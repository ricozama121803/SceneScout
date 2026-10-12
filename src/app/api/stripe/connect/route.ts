import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe, SITE_URL } from "@/lib/stripe/server";

/** POST — create (or reuse) the owner's Connect Express account and return the hosted onboarding URL. */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  let accountId = profile?.stripe_account_id ?? null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      country: "US",
      // Pre-answer the business questions so owners skip the website/industry screens.
      business_type: "individual",
      business_profile: {
        mcc: "7299",
        product_description: "Rents out space for photo and film shoots through SceneScout",
      },
      capabilities: { transfers: { requested: true } },
      metadata: { user_id: user.id },
    });
    accountId = account.id;
    await service.from("profiles").update({ stripe_account_id: accountId }).eq("id", user.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${SITE_URL}/business`,
    return_url: `${SITE_URL}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
