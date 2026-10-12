import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { releasePendingPayouts } from "@/lib/stripe/payouts";

/** Stripe is the source of truth for payment state. Verify the signature, then sync our DB. */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const service = createServiceClient();

  switch (event.type) {
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      // Failed card, or the 7-day authorization hold expired without the owner responding.
      const pi = event.data.object as Stripe.PaymentIntent;
      await service
        .from("rental_bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", pi.id)
        .eq("status", "pending");
      break;
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const ready = account.details_submitted && account.capabilities?.transfers === "active";
      const { data: owner } = await service
        .from("profiles")
        .update({ stripe_onboarded: !!ready })
        .eq("stripe_account_id", account.id)
        .select("id")
        .single();
      if (ready && owner) await releasePendingPayouts(owner.id).catch(() => {});
      break;
    }
  }

  return NextResponse.json({ received: true });
}
