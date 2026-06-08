import Link from "next/link";
import Image from "next/image";
import { Store, MapPin, DollarSign } from "lucide-react";
import type { RentalListingSummary } from "@/types/rental";

interface RentalListingCardProps {
  listing: RentalListingSummary;
}

function formatPrice(perHour: number | null, perDay: number | null) {
  if (perHour && perDay) return `$${perHour}/hr · $${perDay}/day`;
  if (perHour) return `From $${perHour}/hr`;
  if (perDay) return `From $${perDay}/day`;
  return "Contact for pricing";
}

export function RentalListingCard({ listing }: RentalListingCardProps) {
  return (
    <Link href={`/rentals/${listing.id}`} className="group block">
      <article className="border-2 border-emerald-500 bg-card shadow-[4px_4px_0_0_#10b981] rounded-lg overflow-hidden transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none">
        <div className="relative h-48 bg-emerald-50 border-b-2 border-emerald-500">
          {listing.cover_photo_url ? (
            <Image
              src={listing.cover_photo_url}
              alt={listing.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="h-12 w-12 text-emerald-300" />
            </div>
          )}
          <div className="absolute top-2 left-2 bg-emerald-500 border-2 border-white px-2 py-0.5 text-xs font-black text-white rounded-sm">
            AVAILABLE
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-black text-base leading-tight line-clamp-1">{listing.name}</h3>
          {listing.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.address}</span>
            </p>
          )}
          <p className="flex items-center gap-1 text-sm font-bold text-emerald-600">
            <DollarSign className="h-3.5 w-3.5" />
            {formatPrice(listing.price_per_hour, listing.price_per_day)}
          </p>
        </div>
      </article>
    </Link>
  );
}
