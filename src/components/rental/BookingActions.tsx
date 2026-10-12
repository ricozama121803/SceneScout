"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { approveBooking, declineBooking } from "@/lib/actions/bookings";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: (id: string) => Promise<{ success: true } | { error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(bookingId);
      if ("error" in result) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600" onClick={() => run(approveBooking)} disabled={pending}>
          {pending && <Spinner size="sm" className="text-white" />}
          Approve &amp; charge
        </Button>
        <Button size="sm" variant="outline" onClick={() => run(declineBooking)} disabled={pending}>
          Decline
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
