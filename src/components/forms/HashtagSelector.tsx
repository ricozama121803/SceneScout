"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { findOrCreateHashtag } from "@/lib/actions/hashtags";
import type { Hashtag } from "@/types/location";

interface HashtagSelectorProps {
  hashtags: Hashtag[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function HashtagSelector({ hashtags: initialHashtags, selected, onChange }: HashtagSelectorProps) {
  const [query, setQuery] = useState("");
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>(initialHashtags);
  const [creating, setCreating] = useState(false);

  const COLORS = ["secondary", "accent", "pink"] as const;

  const normalized = query.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  const visible = normalized
    ? allHashtags.filter((t) => t.name.includes(normalized))
    : allHashtags;

  const exactMatch = allHashtags.some((t) => t.name === normalized);
  const canCreate = normalized.length >= 2 && !exactMatch;

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  async function handleCreate() {
    if (!canCreate || creating) return;
    setCreating(true);
    const result = await findOrCreateHashtag(normalized);
    setCreating(false);
    if ("error" in result) return;
    const newTag: Hashtag = { id: result.id, name: normalized };
    setAllHashtags((prev) =>
      prev.some((t) => t.id === result.id) ? prev : [...prev, newTag]
    );
    onChange([...selected, result.id]);
    setQuery("");
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search or create a hashtag…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {visible.map((tag) => {
          const isSelected = selected.includes(tag.id);
          const color = COLORS[allHashtags.indexOf(tag) % COLORS.length];
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              <Badge
                variant={isSelected ? "default" : color}
                className={`cursor-pointer text-sm transition-all gap-1 ${
                  isSelected
                    ? "shadow-none translate-x-[2px] translate-y-[2px]"
                    : "shadow-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                }`}
              >
                #{tag.name}
                {isSelected && <X className="h-3 w-3" />}
              </Badge>
            </button>
          );
        })}

        {visible.length === 0 && !canCreate && (
          <p className="text-sm text-muted-foreground">No hashtags match.</p>
        )}

        {canCreate && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full disabled:opacity-50"
          >
            <Badge variant="outline" className="cursor-pointer text-sm transition-colors gap-1 border-dashed text-primary border-primary">
              {creating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Create #{normalized}
            </Badge>
          </button>
        )}
      </div>
    </div>
  );
}
