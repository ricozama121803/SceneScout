"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { republishLocation } from "@/lib/actions/locations";
import { Spinner } from "@/components/ui/spinner";

export function RepublishLocationButton({ locationId }: { locationId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRepublish() {
    startTransition(async () => {
      await republishLocation(locationId);
      router.refresh();
    });
  }

  return (
    <Button onClick={handleRepublish} disabled={isPending} className="gap-1.5">
      {isPending ? <Spinner className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {isPending ? "Publishing…" : "Re-publish"}
    </Button>
  );
}
