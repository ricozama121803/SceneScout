"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { deleteLocation } from "@/lib/actions/locations";
import { Spinner } from "@/components/ui/spinner";

export function DeleteLocationButton({ locationId }: { locationId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLocation(locationId);
      if (result?.error) {
        setOpen(false);
        return;
      }
      router.refresh();
      router.push("/locations");
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete location?</DialogTitle>
            <DialogDescription>
              This will permanently remove the location, all its photos, and any associated data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <Spinner className="h-4 w-4" />}
              {isPending ? "Deleting…" : "Yes, delete it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
