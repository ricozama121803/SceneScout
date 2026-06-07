import Link from "next/link";
import { LocationGrid } from "@/components/location/LocationGrid";
import { getLocations } from "@/lib/queries/locations";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HASHTAG_LIST } from "@/lib/utils/constants";

export const metadata = { title: "Browse Locations" };

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
}) {
  const { search, tag, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const locations = await getLocations({ search, tag, page: currentPage });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Browse Locations</h1>
        <p className="text-muted-foreground">
          {search
            ? `Showing results for "${search}"${tag ? ` tagged #${tag}` : ""}`
            : tag
            ? `Locations tagged #${tag}`
            : "All filming locations"}
        </p>
      </div>

      {/* Search bar */}
      <form method="GET" className="flex gap-3 max-w-lg">
        <Input
          name="search"
          defaultValue={search}
          placeholder="Search locations…"
          className="flex-1"
        />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button
          type="submit"
          className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Hashtag filter chips */}
      <div className="flex flex-wrap gap-2">
        <Link href="/locations">
          <Badge variant={!tag ? "default" : "outline"} className="cursor-pointer">All</Badge>
        </Link>
        {HASHTAG_LIST.slice(0, 12).map((h) => (
          <Link key={h.id} href={`/locations?tag=${h.name}`}>
            <Badge variant={tag === h.name ? "default" : "outline"} className="cursor-pointer">
              #{h.name}
            </Badge>
          </Link>
        ))}
      </div>

      <LocationGrid
        locations={locations}
        emptyMessage={
          search || tag
            ? "No locations match your search. Try different keywords or tags."
            : "No locations yet. Be the first to add one!"
        }
      />

      {/* Pagination */}
      {locations.length === 12 && (
        <div className="flex justify-center gap-3 pt-4">
          {currentPage > 1 && (
            <Link
              href={`/locations?${new URLSearchParams({ ...(search ? { search } : {}), ...(tag ? { tag } : {}), page: String(currentPage - 1) })}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          <Link
            href={`/locations?${new URLSearchParams({ ...(search ? { search } : {}), ...(tag ? { tag } : {}), page: String(currentPage + 1) })}`}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
