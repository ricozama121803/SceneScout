"use client";

import { useState, useTransition } from "react";
import { toggleSave } from "@/lib/actions/saves";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  locationId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

export function SaveButton({ locationId, initialSaved, isLoggedIn }: SaveButtonProps) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);

  function handleToggle() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      await toggleSave(locationId, saved);
    });
  }

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={pending}
      className="gap-2"
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
