import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { releasePendingPayouts } from "@/lib/stripe/payouts";

/** GET — owner lands here after Stripe's hosted onboarding. Verify with Stripe before flagging them onboarded. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_account_id) {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    const ready = account.details_submitted && account.capabilities?.transfers === "active";
    await service.from("profiles").update({ stripe_onboarded: ready }).eq("id", user.id);
    if (ready) await releasePendingPayouts(user.id).catch(() => {});
  }

  redirect("/business");
}
