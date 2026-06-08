"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { HASHTAG_LIST } from "@/lib/utils/constants";

interface Filters {
  search: string;
  tags: string[];
  hideMyLocations: boolean;
}

interface MapFiltersProps {
  isLoggedIn: boolean;
  onFilterChange: (filters: Filters) => void;
  onSearch?: () => void;
}

export function MapFilters({ isLoggedIn, onFilterChange, onSearch }: MapFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hideMyLocations, setHideMyLocations] = useState(false);

  function emit(overrides: Partial<Filters> = {}) {
    onFilterChange({ search, tags: selectedTags, hideMyLocations, ...overrides });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    emit();
    onSearch?.();
  }

  const hasActiveFilters = search || selectedTags.length > 0 || hideMyLocations;

  function clearFilters() {
    setSearch("");
    setSelectedTags([]);
    setHideMyLocations(false);
    onFilterChange({ search: "", tags: [], hideMyLocations: false });
  }

  function toggleTag(name: string) {
    const newTags = selectedTags.includes(name)
      ? selectedTags.filter((t) => t !== name)
      : [...selectedTags, name];
    setSelectedTags(newTags);
    emit({ tags: newTags });
  }

  function toggleHideMyLocations() {
    const next = !hideMyLocations;
    setHideMyLocations(next);
    emit({ hideMyLocations: next });
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

      {isLoggedIn && (
        <button
          type="button"
          onClick={toggleHideMyLocations}
          className="flex w-full items-center justify-between rounded-md border-2 border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Hide my locations
          <span className={`h-4 w-8 rounded-full border-2 border-border transition-colors flex items-center px-0.5 ${hideMyLocations ? "bg-primary" : "bg-muted"}`}>
            <span className={`h-2.5 w-2.5 rounded-full bg-white border border-border transition-transform ${hideMyLocations ? "translate-x-3" : "translate-x-0"}`} />
          </span>
        </button>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
