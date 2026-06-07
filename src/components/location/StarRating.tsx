"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { upsertRating } from "@/lib/actions/ratings";
import { formatRating } from "@/lib/utils/formatters";

interface StarRatingProps {
  locationId: string;
  initialRating: number;
  ratingCount: number;
  userRating: number | null;
  isLoggedIn: boolean;
}

export function StarRating({
  locationId,
  initialRating,
  ratingCount,
  userRating,
  isLoggedIn,
}: StarRatingProps) {
  const [, startTransition] = useTransition();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(userRating ?? 0);

  function handleRate(value: number) {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setSelected(value);
    startTransition(async () => {
      await upsertRating(locationId, value);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus:outline-none"
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (hovered || selected)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {ratingCount > 0
          ? `${formatRating(initialRating)} (${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})`
          : "No ratings yet"}
      </span>
    </div>
  );
}
