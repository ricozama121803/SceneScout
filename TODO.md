# SceneScout TODO

## Before the live demo

- [ ] Set Stripe env vars on the host (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PLATFORM_FEE_PERCENT=10`, `NEXT_PUBLIC_SITE_URL` set to the live URL)
- [ ] Register a webhook endpoint in the Stripe sandbox at `https://<live-site>/api/webhooks/stripe` for `payment_intent.payment_failed`, `payment_intent.canceled` and `account.updated` (Connect events). Put its `whsec_...` in the host's `STRIPE_WEBHOOK_SECRET`
- [ ] Supabase Auth: set Site URL and add the live URL to Redirect URLs so confirmation emails stop pointing at `localhost`
- [ ] Run both payment migrations from `supabase/schema.sql` (done locally; confirm on any other database)
- [ ] Run the full payment test on the live site (see below)

## Payment test (Stripe test mode)

- [ ] Owner: create and publish a listing with a price and a photo
- [ ] Renter (second account): request a booking with card `4242 4242 4242 4242`
- [ ] Owner: approve. Check Stripe for the charge, the 10% fee and the transfer
- [ ] Renter: request another booking, owner declines. Check the hold is released
- [ ] Declined card `4000 0000 0000 0002` shows an error
- [ ] New owner (never onboarded): approve a booking, see "$X is waiting for you", click **Get paid**, finish Stripe's form, confirm the payout goes out

## Product gaps

- [ ] Renter "My bookings" page (renters only see a confirmation message today)
- [ ] Notify owners of new booking requests (email or in-app badge)
- [ ] Handle cards that need 3D Secure (rejected today)
- [ ] "List for rent" copies photos from the location (today the owner re-uploads them)
- [ ] Pick a one-line starting niche for the pitch (renters and owners are "anyone")
- [ ] Decide whether to add a renter service fee later (today: owner pays a flat 10%, renter pays the listed price)
- [ ] Switch Stripe to live mode only after business verification

## Known lint errors (existing, not from payments)

- [ ] `AddLocationForm.tsx` and `EditDraftForm.tsx`: `useState` inside a callback
- [ ] `LocationFilters.tsx`: setState inside an effect
- [ ] `StarRating.tsx`: assigning `window.location.href` during render handling

## Reference: engagement and attention design

Notes for deciding which behavior patterns SceneScout should use.

### Core psychological mechanisms

- **Variable ratio schedule (intermittent rewards):** apps mimic slot machines by giving unpredictable rewards (new posts, likes, messages) at random times, which spikes dopamine and makes users keep checking.
- **Fogg Behavior Model:** action happens when Motivation, Ability (simplicity, low friction) and a Trigger (like a push notification) converge at the same moment.
- **Goal gradient effect:** people speed up as they get closer to finishing a task. Apps use an "artificial head start", such as an onboarding checklist that is already 20% complete.
- **Zeigarnik effect:** the brain remembers uncompleted tasks better than finished ones. Progress bars, streak counters and cliffhangers create tension that pulls the user back.
- **Social proof and influence:** people mimic their peers. Real-time activity feeds, online status indicators and community tags make the app feel alive and socially mandatory.
- **Classical and operant conditioning:** chimes, custom notification sounds and red badge alerts create a reflexive urge to open the app.

### Designing for short attention spans

- **Reduce cognitive load:** the brain consciously processes only a tiny fraction of incoming sensory data. Clear visual hierarchy, uncluttered screens and fewer options prevent decision fatigue.
- **Leverage peripheral cues:** eyes are drawn to motion, human faces with direct gazes and high-contrast colors (like bright red notification dots).
- **Eliminate stopping cues:** infinite scrolls, auto-play and rapid content pacing bypass natural breaks.
