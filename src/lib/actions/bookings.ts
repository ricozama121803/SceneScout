"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe/server";
import { calculateBookingCents, platformFeeCents } from "@/lib/stripe/pricing";
import { releasePendingPayouts } from "@/lib/stripe/payouts";

const RequestBookingSchema = z.object({
  listing_id: z.string().uuid(),
  start_time: z.string().min(1, "Choose a start time"),
  end_time: z.string().min(1, "Choose an end time"),
  message: z.string().max(500).optional(),
  payment_method_id: z.string().startsWith("pm_"),
});

type ActionResult<T = object> = ({ success: true } & T) | { error: string };

async function hasApprovedOverlap(listingId: string, startIso: string, endIso: string, excludeId?: string) {
  const service = createServiceClient();
  let query = service
    .from("rental_bookings")
    .select("id")
    .eq("listing_id", listingId)
    .eq("status", "approved")
    .lt("start_time", endIso)
    .gt("end_time", startIso);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}

export async function requestBooking(
  input: z.input<typeof RequestBookingSchema>
): Promise<ActionResult<{ booking_id: string }>> {
  const parsed = RequestBookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { listing_id, message, payment_method_id } = parsed.data;

  const start = new Date(parsed.data.start_time);
  const end = new Date(parsed.data.end_time);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: "Invalid dates" };
  if (start.getTime() < Date.now()) return { error: "Start time must be in the future" };
  if (end <= start) return { error: "End time must be after the start time" };
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to book a space" };

  const { data: listing } = await supabase
    .from("rental_listings")
    .select("id, owner_id, price_per_hour, price_per_day, status")
    .eq("id", listing_id)
    .single();
  if (!listing || listing.status !== "published") return { error: "This space isn't available" };
  if (listing.owner_id === user.id) return { error: "You can't book your own space" };

  const total = calculateBookingCents(startIso, endIso, listing.price_per_hour, listing.price_per_day);
  if (!total) return { error: "This listing has no price set" };
  if (total < 50) return { error: "Minimum booking is $0.50" };
  const fee = platformFeeCents(total, PLATFORM_FEE_PERCENT);

  if (await hasApprovedOverlap(listing_id, startIso, endIso)) {
    return { error: "That time is already booked. Pick another slot." };
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      capture_method: "manual", // hold the card; only charge once the owner approves
      payment_method: payment_method_id,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: { listing_id, renter_id: user.id },
      description: `SceneScout booking ${listing_id}`,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Payment failed" };
  }

  if (paymentIntent.status !== "requires_capture") {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
    return { error: "Your card couldn't be authorized. Try a different card." };
  }

  const { data: booking, error } = await supabase
    .from("rental_bookings")
    .insert({
      listing_id,
      renter_id: user.id,
      start_time: startIso,
      end_time: endIso,
      total_price: total / 100,
      platform_fee: fee / 100,
      message: message || null,
      stripe_payment_intent_id: paymentIntent.id,
    })
    .select("id")
    .single();

  if (error || !booking) {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
    return { error: error?.message ?? "Couldn't save your booking" };
  }

  revalidatePath("/business");
  return { success: true, booking_id: booking.id };
}

async function loadOwnedBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const { data: booking } = await supabase
    .from("rental_bookings")
    .select("*, rental_listings(owner_id)")
    .eq("id", bookingId)
    .single();

  const listing = booking?.rental_listings as unknown as { owner_id: string } | null;
  if (!booking || !listing || listing.owner_id !== user.id) return { ok: false as const, error: "Not authorized" };
  if (booking.status !== "pending") return { ok: false as const, error: "This request was already handled" };
  if (!booking.stripe_payment_intent_id) return { ok: false as const, error: "No payment on file" };
  return { ok: true as const, supabase, booking };
}

export async function approveBooking(bookingId: string): Promise<ActionResult> {
  const ctx = await loadOwnedBooking(bookingId);
  if (!ctx.ok) return { error: ctx.error };
  const { supabase, booking } = ctx;

  if (await hasApprovedOverlap(booking.listing_id, booking.start_time, booking.end_time, booking.id)) {
    return { error: "You already approved a booking that overlaps this time" };
  }

  try {
    await stripe.paymentIntents.capture(booking.stripe_payment_intent_id!);
  } catch (e) {
    // The authorization hold lapses after about 7 days; the card can no longer be charged.
    await supabase.from("rental_bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", bookingId);
    revalidatePath("/business");
    return { error: e instanceof Error ? e.message : "Couldn't capture the payment. The card hold may have expired." };
  }

  await supabase.from("rental_bookings").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", bookingId);

  // Pay the owner now if their Stripe account is ready; otherwise the share waits until they set it up.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await releasePendingPayouts(user.id).catch(() => {});

  revalidatePath("/business");
  return { success: true };
}

export async function declineBooking(bookingId: string): Promise<ActionResult> {
  const ctx = await loadOwnedBooking(bookingId);
  if (!ctx.ok) return { error: ctx.error };
  const { supabase, booking } = ctx;

  try {
    await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id!);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't release the card hold" };
  }

  await supabase.from("rental_bookings").update({ status: "declined", updated_at: new Date().toISOString() }).eq("id", bookingId);
  revalidatePath("/business");
  return { success: true };
}
