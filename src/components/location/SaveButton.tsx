"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSave } from "@/lib/actions/saves";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  locationId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

export function SaveButton({ locationId, initialSaved, isLoggedIn }: SaveButtonProps) {
  const [, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(initialSaved);

  function handleToggle() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved);
      await toggleSave(locationId, optimisticSaved);
    });
  }

  return (
    <Button
      variant={optimisticSaved ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      <Bookmark className={`h-4 w-4 ${optimisticSaved ? "fill-current" : ""}`} />
      {optimisticSaved ? "Saved" : "Save"}
    </Button>
  );
}
