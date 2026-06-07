"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { HASHTAG_LIST } from "@/lib/utils/constants";

interface MapFiltersProps {
  onFilterChange: (filters: { search: string; tags: string[] }) => void;
}

export function MapFilters({ onFilterChange }: MapFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ search, tags: selectedTags });
  }

  function toggleTag(name: string) {
    const newTags = selectedTags.includes(name)
      ? selectedTags.filter((t) => t !== name)
      : [...selectedTags, name];
    setSelectedTags(newTags);
    onFilterChange({ search, tags: newTags });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations…"
          className="pl-9 pr-20"
        />
        <Button type="submit" size="sm" className="absolute right-1 top-1 h-7">
          Go
        </Button>
      </form>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setShowFilters((v) => !v)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter by tags
        {selectedTags.length > 0 && (
          <Badge className="h-5 px-1.5 text-xs">{selectedTags.length}</Badge>
        )}
      </Button>

      {showFilters && (
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto py-1">
          {HASHTAG_LIST.map((tag) => (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.name)}>
              <Badge
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                className="cursor-pointer text-xs"
              >
                #{tag.name}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
