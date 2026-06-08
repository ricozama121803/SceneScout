"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteRentalListing } from "@/lib/actions/rentals";
import { Trash2 } from "lucide-react";

export function DeleteRentalButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteRentalListing(listingId);
      router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
