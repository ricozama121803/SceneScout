"use client";

import { Badge } from "@/components/ui/badge";
import type { Hashtag } from "@/types/location";

interface HashtagSelectorProps {
  hashtags: Hashtag[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function HashtagSelector({ hashtags, selected, onChange }: HashtagSelectorProps) {
  function toggle(id: number) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hashtags.map((tag) => {
        const isSelected = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer text-sm transition-colors"
            >
              #{tag.name}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
