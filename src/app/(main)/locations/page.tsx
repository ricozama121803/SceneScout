import { Suspense } from "react";
import Link from "next/link";
import { LocationGrid } from "@/components/location/LocationGrid";
import { LocationFilters } from "@/components/location/LocationFilters";
import { getLocations } from "@/lib/queries/locations";
import { Spinner } from "@/components/ui/spinner";

export const metadata = { title: "Browse Locations" };

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    tag?: string;
    page?: string;
    sort?: string;
    min_rating?: string;
    has_accessibility?: string;
    has_parking?: string;
  }>;
}) {
  const { search, tag, page, sort, min_rating, has_accessibility, has_parking } =
    await searchParams;
  const currentPage = Number(page) || 1;

  const locations = await getLocations({
    search,
    tag,
    page: currentPage,
    sort: sort as "newest" | "top_rated" | "most_saved" | "most_rated" | undefined,
    minRating: min_rating ? Number(min_rating) : undefined,
    hasAccessibility: has_accessibility === "1",
    hasParking: has_parking === "1",
  });

  const paginationParams = {
    ...(search ? { search } : {}),
    ...(tag ? { tag } : {}),
    ...(sort ? { sort } : {}),
    ...(min_rating ? { min_rating } : {}),
    ...(has_accessibility ? { has_accessibility } : {}),
    ...(has_parking ? { has_parking } : {}),
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Browse Locations</h1>
        <p className="text-muted-foreground">
          {search
            ? `Results for "${search}"${tag ? ` · #${tag}` : ""}`
            : tag
            ? `Tagged #${tag}`
            : "All filming locations"}
        </p>
      </div>

      <Suspense fallback={<Spinner />}>
        <LocationFilters />
      </Suspense>

      <LocationGrid
        locations={locations}
        emptyMessage={
          search || tag || sort || min_rating || has_accessibility || has_parking
            ? "No locations match your filters. Try adjusting your search."
            : "No locations yet. Be the first to add one!"
        }
      />

      {locations.length === 12 && (
        <div className="flex justify-center gap-3 pt-4">
          {currentPage > 1 && (
            <Link
              href={`/locations?${new URLSearchParams({ ...paginationParams, page: String(currentPage - 1) })}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          <Link
            href={`/locations?${new URLSearchParams({ ...paginationParams, page: String(currentPage + 1) })}`}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
