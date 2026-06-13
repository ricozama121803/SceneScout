"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthPromptModalProps {
  delayMs?: number;
}

export function AuthPromptModal({ delayMs = 30_000 }: AuthPromptModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>You&apos;re in preview mode</DialogTitle>
          <DialogDescription>
            Sign in to browse all locations, see every map pin, and unlock saving, ratings, and more.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col">
          <Button className="w-full" onClick={() => router.push("/signup")}>
            Sign Up Free
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
            Sign In
          </Button>
          <DialogClose render={<Button variant="ghost" className="w-full" />}>
            Continue in preview mode
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
