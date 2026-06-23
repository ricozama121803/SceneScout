"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { setLocationDraft } from "@/lib/actions/locations";
import { Spinner } from "@/components/ui/spinner";

export function UnpublishLocationButton({ locationId }: { locationId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUnpublish() {
    startTransition(async () => {
      const result = await setLocationDraft(locationId);
      if (result?.error) {
        setOpen(false);
        return;
      }
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <EyeOff className="h-4 w-4" />
        Move to Draft
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to draft?</DialogTitle>
            <DialogDescription>
              This location will be hidden from public listings and the map. You can re-publish it at any time from your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleUnpublish}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <Spinner className="h-4 w-4" />}
              {isPending ? "Saving…" : "Yes, move to draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
