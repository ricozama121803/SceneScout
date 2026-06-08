# SceneScout — Payments Implementation Plan

The dummy rental marketplace is live. Listings can be created, published, and discovered on the map and browse page. Owners have a dashboard at `/business`. What's missing is money moving.

This document covers exactly what to build to go from "contact the owner" to "renter pays, owner gets 97%, SceneScout keeps 3%."

---

## What's already built

| Thing | Where |
|---|---|
| `rental_listings` + `rental_photos` tables | `supabase/schema.sql` (bottom) |
| Create / publish / delete listing actions | `src/lib/actions/rentals.ts` |
| Browse page | `src/app/(main)/rentals/page.tsx` |
| Listing detail page | `src/app/(main)/rentals/[id]/page.tsx` |
| Owner dashboard | `src/app/(main)/business/page.tsx` |
| Map pins (green, distinct from community locations) | `src/components/map/RentalPinMarker.tsx` |
| TypeScript types for all rental tables | `src/types/database.ts`, `src/types/rental.ts` |

The listing detail page already has a "payments coming soon" placeholder CTA at the bottom of the sidebar. That's where the booking form will live.

---

## Payment model: Stripe Connect Express

Stripe Connect is the right tool because money flows *through* SceneScout to the owner — it's not a simple charge. The platform takes a cut automatically.

**How it works:**
- SceneScout is the **platform account** (one Stripe account you control)
- Each space owner is a **connected account** (Express — Stripe hosts their onboarding, KYC, and payouts)
- When a renter pays, Stripe splits it: owner gets the booking amount minus the platform fee; you get the fee
- The split is set via `application_fee_amount` on the PaymentIntent — no manual transfers needed

**For owner approval before charging:**
- Create the PaymentIntent with `capture_method: 'manual'`
- Stripe *authorizes* the card (holds the funds) but doesn't charge it
- When the owner approves → call `paymentIntent.capture()`
- When the owner declines → call `paymentIntent.cancel()` (card is never charged)
- Authorization holds expire after ~7 days, so owners need a prompt response window

---

## Step 1 — Stripe account & environment

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

Add to `.env.local`:
```
STRIPE_SECRET_KEY=sk_live_...           # or sk_test_... during dev
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
PLATFORM_FEE_PERCENT=3
```

In the Stripe dashboard:
- Enable Connect → Express accounts
- Set the platform name and branding
- Configure the OAuth redirect URL to `https://yoursite.com/api/stripe/connect/return`

---

## Step 2 — Database migration

Run in Supabase SQL Editor:

```sql
-- Store the owner's Stripe Connect account ID on their profile
alter table public.profiles
  add column if not exists stripe_account_id text,
  add column if not exists stripe_onboarded  boolean default false;

-- Booking requests
create table if not exists public.rental_bookings (
  id                      uuid primary key default gen_random_uuid(),
  listing_id              uuid not null references public.rental_listings(id) on delete cascade,
  renter_id               uuid not null references public.profiles(id) on delete cascade,
  start_time              timestamptz not null,
  end_time                timestamptz not null,
  total_price             numeric(10,2) not null,
  platform_fee            numeric(10,2) not null,
  message                 text,
  status                  text not null default 'pending'
                            check (status in ('pending','approved','declined','cancelled','completed')),
  stripe_payment_intent_id text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.rental_bookings enable row level security;

create policy "bookings: renter read"
  on public.rental_bookings for select using (auth.uid() = renter_id);

create policy "bookings: owner read"
  on public.rental_bookings for select using (
    auth.uid() = (select owner_id from public.rental_listings where id = listing_id)
  );

create policy "bookings: renter insert"
  on public.rental_bookings for insert with check (auth.uid() = renter_id);

create policy "bookings: owner update"
  on public.rental_bookings for update using (
    auth.uid() = (select owner_id from public.rental_listings where id = listing_id)
  );
```

Also add `RentalBooking` to `src/types/database.ts` (follow the same pattern as other tables there) and to `src/types/rental.ts`.

---

## Step 3 — Stripe Connect onboarding (owner side)

**File: `src/app/api/stripe/connect/route.ts`**

```ts
// POST — creates a Connect Express account and returns the onboarding URL
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await stripe.accounts.create({ type: "express" });

  // Save stripe_account_id to profiles immediately
  await supabase.from("profiles").update({ stripe_account_id: account.id }).eq("id", user.id);

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect`,
    return_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
```

**File: `src/app/api/stripe/connect/return/route.ts`**

```ts
// GET — called after owner finishes Stripe onboarding
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("stripe_account_id").eq("id", user.id).single();

  if (profile?.stripe_account_id) {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    if (account.details_submitted) {
      await supabase.from("profiles")
        .update({ stripe_onboarded: true }).eq("id", user.id);
    }
  }

  redirect("/business");
}
```

**Update `/business` dashboard** — check `stripe_onboarded` on the profile. If false, show a "Connect your bank account" banner above the listings grid that hits `POST /api/stripe/connect` and redirects the owner to Stripe's hosted onboarding flow.

---

## Step 4 — Booking request (renter side)

**File: `src/components/rental/BookingRequestForm.tsx`** (client component)

Replace the "payments coming soon" placeholder on `/rentals/[id]/page.tsx` with this form. It needs:
- Date + time range picker (start/end)
- Optional message to owner
- Stripe `CardElement` (from `@stripe/react-stripe-js`) for card capture
- Submit calls the `requestBooking` server action

**File: `src/lib/actions/bookings.ts`**

```ts
export async function requestBooking(input: {
  listing_id: string;
  start_time: string;
  end_time: string;
  message?: string;
  payment_method_id: string; // from Stripe.js client-side
}): Promise<{ booking_id: string } | { error: string }> {
  // 1. Auth check
  // 2. Fetch listing to get owner's stripe_account_id and price
  // 3. Calculate total_price and platform_fee (3%)
  // 4. Create Stripe PaymentIntent:
  //      capture_method: "manual"
  //      application_fee_amount: platform_fee in cents
  //      transfer_data: { destination: owner.stripe_account_id }
  //      payment_method: input.payment_method_id
  //      confirm: true
  // 5. Insert rental_bookings row with status "pending" and stripe_payment_intent_id
  // 6. Return booking_id (or error)
}
```

---

## Step 5 — Approve / decline (owner side)

Add a "Booking Requests" tab or section to the `/business` dashboard.

**File: `src/lib/actions/bookings.ts`** (add to same file)

```ts
export async function approveBooking(bookingId: string) {
  // 1. Auth + ownership check
  // 2. Fetch booking.stripe_payment_intent_id
  // 3. stripe.paymentIntents.capture(paymentIntentId)
  // 4. Update booking status to "approved"
  // 5. revalidatePath("/business")
}

export async function declineBooking(bookingId: string) {
  // 1. Auth + ownership check
  // 2. stripe.paymentIntents.cancel(paymentIntentId)
  // 3. Update booking status to "declined"
  // 4. revalidatePath("/business")
}
```

---

## Step 6 — Stripe webhook handler

**File: `src/app/api/webhooks/stripe/route.ts`**

Webhooks are essential — they're the source of truth for payment state, not the client.

```ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle events you care about:
  switch (event.type) {
    case "payment_intent.payment_failed":
      // Mark booking as cancelled in DB
      break;
    case "payment_intent.amount_capturable_updated":
      // Optional: notify owner of new pending booking
      break;
    case "account.updated":
      // Update stripe_onboarded flag if details_submitted changed
      break;
  }

  return NextResponse.json({ received: true });
}

// Required — disable body parsing so Stripe signature verification works
export const config = { api: { bodyParser: false } };
```

Register the webhook endpoint in the Stripe dashboard pointing at `https://yoursite.com/api/webhooks/stripe`.

---

## Step 7 — Booking notifications (nice to have)

Owners need to know when a booking request comes in. Options in order of complexity:
1. **Email via Supabase** — use a Supabase Edge Function triggered by the `rental_bookings` insert to send an email via Resend / SendGrid
2. **In-app notification** — add a `notifications` table, show a badge on the `/business` nav link
3. **Push** — out of scope for now

---

## Testing checklist (use Stripe test mode)

- [ ] Owner onboards via Stripe Connect Express (use test SSN `000-00-0000`)
- [ ] Renter submits booking with test card `4242 4242 4242 4242` → booking appears as "pending" in owner dashboard
- [ ] Owner approves → Stripe dashboard shows captured charge with platform fee deducted
- [ ] Owner declines → Stripe dashboard shows cancelled PaymentIntent, renter not charged
- [ ] Use card `4000 0000 0000 0002` to test payment failure → booking auto-cancelled
- [ ] Webhook events arrive and update DB correctly (use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` during local dev)

---

## Key files to touch when you pick this up

| File | What to do |
|---|---|
| `src/types/database.ts` | Add `rental_bookings` + `profiles.stripe_account_id / stripe_onboarded` |
| `src/types/rental.ts` | Add `RentalBooking` type |
| `src/lib/actions/bookings.ts` | Create — `requestBooking`, `approveBooking`, `declineBooking` |
| `src/app/api/stripe/connect/route.ts` | Create — Connect onboarding |
| `src/app/api/stripe/connect/return/route.ts` | Create — post-onboarding callback |
| `src/app/api/webhooks/stripe/route.ts` | Create — webhook handler |
| `src/app/(main)/rentals/[id]/page.tsx` | Replace placeholder CTA with `BookingRequestForm` |
| `src/app/(main)/business/page.tsx` | Add Stripe onboarding banner + booking requests section |
| `src/components/rental/BookingRequestForm.tsx` | Create — date picker + Stripe card input |
| `supabase/schema.sql` | Add `rental_bookings` table + profile columns (SQL in Step 2 above) |
