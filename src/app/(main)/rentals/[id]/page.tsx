import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getRentalListingById } from "@/lib/queries/rentals";
import { buttonVariants } from "@/components/ui/button";
import { MapPin, DollarSign, Store, ArrowLeft, CheckSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getRentalListingById(id);
  if (!listing) return { title: "Space Not Found" };
  return { title: listing.name };
}

function formatPrice(perHour: number | null, perDay: number | null) {
  const parts = [];
  if (perHour) parts.push(`$${perHour} / hour`);
  if (perDay) parts.push(`$${perDay} / day`);
  return parts.length > 0 ? parts.join("  ·  ") : null;
}

export default async function RentalListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getRentalListingById(id);
  if (!listing) notFound();

  const price = formatPrice(listing.price_per_hour, listing.price_per_day);
  const coverPhoto = listing.photos[0]?.url ?? null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link
        href="/rentals"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-6 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to spaces
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main content */}
        <div className="space-y-6">
          {/* Cover photo */}
          <div className="relative aspect-video w-full rounded-xl border-2 border-emerald-500 overflow-hidden bg-emerald-50 shadow-[4px_4px_0_0_#10b981]">
            {coverPhoto ? (
              <Image src={coverPhoto} alt={listing.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 600px" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Store className="h-16 w-16 text-emerald-300" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-emerald-500 border-2 border-white px-2.5 py-1 text-xs font-black text-white rounded-sm">
              AVAILABLE
            </div>
          </div>

          {/* Photo gallery */}
          {listing.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {listing.photos.slice(1, 4).map((photo, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border-2 border-border">
                  <Image src={photo.url} alt={`${listing.name} photo ${i + 2}`} fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-black">About this space</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities && (
            <div className="space-y-2">
              <h2 className="text-lg font-black">Amenities</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{listing.amenities}</p>
            </div>
          )}

          {/* Rules */}
          {listing.rules && (
            <div className="space-y-2 border-2 border-border rounded-lg p-4 bg-muted/40">
              <h2 className="text-base font-black flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Rules &amp; Requirements
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{listing.rules}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border-2 border-emerald-500 rounded-xl p-5 shadow-[4px_4px_0_0_#10b981] space-y-4">
            <h1 className="text-xl font-black leading-tight">{listing.name}</h1>

            {listing.address && (
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {listing.address}
              </p>
            )}

            {price && (
              <div className="border-t-2 border-border pt-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">Pricing</p>
                <p className="flex items-center gap-1.5 font-black text-lg text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                  {price}
                </p>
              </div>
            )}

            <div className="border-t-2 border-border pt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Listed by</p>
              <Link
                href={`/users/${listing.owner.username}`}
                className="flex items-center gap-2 hover:underline"
              >
                <div className="h-8 w-8 rounded-full border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                  {listing.owner.avatar_url ? (
                    <Image src={listing.owner.avatar_url} alt={listing.owner.username} width={32} height={32} className="object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{listing.owner.username[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-bold">@{listing.owner.username}</span>
              </Link>
            </div>

            {/* Booking CTA — placeholder */}
            <div className="border-t-2 border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3">
                <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  Payments &amp; booking coming soon. Reach out to the owner directly to arrange your shoot.
                </p>
              </div>
              <Link
                href={`/users/${listing.owner.username}`}
                className={cn(buttonVariants(), "w-full bg-emerald-500 hover:bg-emerald-600")}
              >
                View Owner Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
