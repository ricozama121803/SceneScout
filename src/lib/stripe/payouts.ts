import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

/**
 * SceneScout collects the renter's payment. The owner's share is transferred once their Stripe
 * account can receive money, so owners don't have to onboard before they get their first booking.
 * Safe to call repeatedly: each booking is transferred at most once (idempotency key + payout_status).
 */
export async function releasePendingPayouts(ownerId: string): Promise<number> {
  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", ownerId)
    .single();
  if (!profile?.stripe_account_id) return 0;

  const account = await stripe.accounts.retrieve(profile.stripe_account_id);
  if (account.capabilities?.transfers !== "active") return 0;

  const { data: rows } = await service
    .from("rental_bookings")
    .select("id, total_price, platform_fee, stripe_payment_intent_id, rental_listings!inner(owner_id)")
    .eq("status", "approved")
    .eq("payout_status", "pending")
    .eq("rental_listings.owner_id", ownerId);

  let released = 0;
  for (const booking of rows ?? []) {
    if (!booking.stripe_payment_intent_id) continue;
    try {
      const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
      const chargeId = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;
      if (!chargeId) continue;

      const amount = Math.round((Number(booking.total_price) - Number(booking.platform_fee)) * 100);
      const transfer = await stripe.transfers.create(
        {
          amount,
          currency: "usd",
          destination: profile.stripe_account_id,
          source_transaction: chargeId,
          metadata: { booking_id: booking.id },
        },
        { idempotencyKey: `payout-${booking.id}` }
      );

      await service
        .from("rental_bookings")
        .update({ payout_status: "paid", stripe_transfer_id: transfer.id })
        .eq("id", booking.id);
      released++;
    } catch (e) {
      console.error("payout failed for booking", booking.id, e);
    }
  }
  return released;
}
