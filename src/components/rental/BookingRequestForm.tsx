"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { requestBooking } from "@/lib/actions/bookings";
import { calculateBookingCents } from "@/lib/stripe/pricing";
import { CheckCircle2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  listingId: string;
  pricePerHour: number | null;
  pricePerDay: number | null;
}

function Form({ listingId, pricePerHour, pricePerDay }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const totalCents = useMemo(() => {
    if (!start || !end) return null;
    return calculateBookingCents(new Date(start).toISOString(), new Date(end).toISOString(), pricePerHour, pricePerDay);
  }, [start, end, pricePerHour, pricePerDay]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSubmitting(true);
    setError(null);

    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({ type: "card", card });
    if (pmError || !paymentMethod) {
      setError(pmError?.message ?? "Check your card details");
      setSubmitting(false);
      return;
    }

    const result = await requestBooking({
      listing_id: listingId,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      message: message.trim() || undefined,
      payment_method_id: paymentMethod.id,
    });

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-start gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700 font-medium">
          Request sent. Your card is on hold and won&apos;t be charged unless the owner approves.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="booking-start" className="text-xs font-bold">Start</label>
        <Input id="booking-start" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label htmlFor="booking-end" className="text-xs font-bold">End</label>
        <Input id="booking-end" type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label htmlFor="booking-message" className="text-xs font-bold">Message to owner (optional)</label>
        <Textarea id="booking-message" rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What are you shooting?" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-bold">Card</span>
        <div className="border-2 border-border rounded-md px-3 py-2.5 bg-background">
          <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: "14px" } } }} />
        </div>
      </div>

      {totalCents !== null && (
        <div className="flex items-center justify-between border-t-2 border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-black text-lg text-emerald-600">${(totalCents / 100).toFixed(2)}</span>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600" disabled={!stripe || submitting}>
        {submitting && <Spinner size="sm" className="text-white" />}
        {submitting ? "Sending request…" : "Request to book"}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        Test mode: use card 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </form>
  );
}

export function BookingRequestForm(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <Form {...props} />
    </Elements>
  );
}
