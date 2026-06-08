import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { PublishRentalButton } from "@/components/rental/PublishRentalButton";
import { DeleteRentalButton } from "@/components/rental/DeleteRentalButton";
import { Store, MapPin, DollarSign, Plus, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "My Listed Spaces" };

function formatPrice(perHour: number | null, perDay: number | null) {
  if (perHour && perDay) return `$${perHour}/hr · $${perDay}/day`;
  if (perHour) return `$${perHour}/hr`;
  if (perDay) return `$${perDay}/day`;
  return "No price set";
}

export default async function BusinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("rental_listings")
    .select("*, rental_photos(url, display_order)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const withCovers = (listings ?? []).map((l) => {
    const photos = ((l.rental_photos ?? []) as { url: string; display_order: number }[])
      .sort((a, b) => a.display_order - b.display_order);
    return { ...l, cover_photo_url: photos[0]?.url ?? null };
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">My Listed Spaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage spaces you&apos;ve listed for filming and photography on SceneScout.
          </p>
        </div>
        <Link href="/business/listings/new" className={cn(buttonVariants(), "gap-2 bg-emerald-500 hover:bg-emerald-600")}>
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {withCovers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border-2 border-dashed border-border rounded-xl">
          <Store className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-bold">No listings yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            List any space you own — a home, backyard, pool, rooftop, studio, or storefront — and earn when filmmakers and photographers book it.
          </p>
          <Link href="/business/listings/new" className={cn(buttonVariants(), "bg-emerald-500 hover:bg-emerald-600")}>
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {withCovers.map((listing) => (
            <div
              key={listing.id}
              className="flex gap-4 border-2 border-border bg-card rounded-lg overflow-hidden shadow-shadow-sm"
            >
              {/* Cover photo */}
              <div className="relative w-32 shrink-0 bg-muted border-r-2 border-border">
                {listing.cover_photo_url ? (
                  <Image
                    src={listing.cover_photo_url}
                    alt={listing.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 py-4 pr-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-black text-base leading-tight">{listing.name}</h2>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border-2",
                      listing.status === "published"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-400"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {listing.status === "published" ? (
                      <span className="flex items-center gap-1"><Radio className="h-2.5 w-2.5" /> Live</span>
                    ) : "Draft"}
                  </span>
                </div>

                {listing.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{listing.address}</span>
                  </p>
                )}

                <p className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <DollarSign className="h-3.5 w-3.5" />
                  {formatPrice(listing.price_per_hour as number | null, listing.price_per_day as number | null)}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {listing.status === "draft" && (
                    <PublishRentalButton listingId={listing.id} />
                  )}
                  {listing.status === "published" && (
                    <Link
                      href={`/rentals/${listing.id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
                    >
                      View listing
                    </Link>
                  )}
                  <DeleteRentalButton listingId={listing.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
