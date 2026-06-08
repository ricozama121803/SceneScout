"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishRentalListing } from "@/lib/actions/rentals";
import { Spinner } from "@/components/ui/spinner";

export function PublishRentalButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishRentalListing(listingId);
      if ("success" in result) router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
      onClick={handlePublish}
      disabled={pending}
    >
      {pending && <Spinner size="sm" className="text-white" />}
      {pending ? "Publishing…" : "Go Live"}
    </Button>
  );
}
