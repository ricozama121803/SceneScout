"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp } from "lucide-react";
import { HASHTAG_LIST } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "top_rated", label: "Top Rated" },
  { value: "most_saved", label: "Most Saved" },
  { value: "most_rated", label: "Most Rated" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const MIN_RATING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

export function LocationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentSearch = searchParams.get("search") ?? "";
  const currentTag = searchParams.get("tag") ?? "";
  const currentSort = (searchParams.get("sort") as SortValue) ?? "newest";
  const currentMinRating = searchParams.get("min_rating") ?? "";
  const currentHasAccessibility = searchParams.get("has_accessibility") === "1";
  const currentHasParking = searchParams.get("has_parking") === "1";

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const activeFilterCount = [
    currentSort !== "newest",
    !!currentMinRating,
    currentHasAccessibility,
    currentHasParking,
  ].filter(Boolean).length;

  const hasAnyFilter = !!(currentSearch || currentTag || activeFilterCount);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => router.push(`/locations?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchInput || null });
  }

  function clearAll() {
    setSearchInput("");
    startTransition(() => router.push("/locations"));
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or city…"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter &amp; Sort
          {activeFilterCount > 0 && (
            <Badge className="h-5 px-1.5 text-xs">{activeFilterCount}</Badge>
          )}
          {showAdvanced ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={clearAll}
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="rounded-lg border-2 border-border bg-card p-4 space-y-5">
          {/* Sort */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => navigate({ sort: value === "newest" ? null : value })}
                  className={cn(
                    "rounded-md border-2 border-border px-3 py-1 text-sm font-medium transition-colors",
                    currentSort === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Min rating */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Minimum Rating</p>
            <div className="flex flex-wrap gap-2">
              {MIN_RATING_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => navigate({ min_rating: value || null })}
                  className={cn(
                    "flex items-center gap-1 rounded-md border-2 border-border px-3 py-1 text-sm font-medium transition-colors",
                    currentMinRating === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {value && <Star className="h-3 w-3 fill-current" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Has info */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Has Info</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentHasAccessibility}
                  onChange={(e) =>
                    navigate({ has_accessibility: e.target.checked ? "1" : null })
                  }
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Accessibility info</span>
              </label>
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentHasParking}
                  onChange={(e) =>
                    navigate({ has_parking: e.target.checked ? "1" : null })
                  }
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Parking info</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Hashtag chips */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate({ tag: null })}>
          <Badge variant={!currentTag ? "default" : "outline"} className="cursor-pointer">
            All
          </Badge>
        </button>
        {HASHTAG_LIST.slice(0, 12).map((h) => (
          <button key={h.id} type="button" onClick={() => navigate({ tag: h.name })}>
            <Badge
              variant={currentTag === h.name ? "default" : "outline"}
              className="cursor-pointer"
            >
              #{h.name}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
