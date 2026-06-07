import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Bookmark } from "lucide-react";
import { HashtagBadges } from "./HashtagBadges";
import { formatRating } from "@/lib/utils/formatters";
import type { LocationSummary } from "@/types/location";

interface LocationCardProps {
  location: LocationSummary;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`} className="group block">
      <article className="border-2 border-border bg-card shadow-shadow rounded-lg overflow-hidden transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none">
        <div className="relative h-48 bg-muted border-b-2 border-border">
          {location.cover_photo_url ? (
            <Image
              src={location.cover_photo_url}
              alt={location.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {location.rating_count > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent border-2 border-border px-2 py-0.5 text-xs font-bold rounded-sm">
              <Star className="h-3 w-3 fill-foreground" />
              {formatRating(location.avg_rating)}
            </div>
          )}
          {location.save_count > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-secondary border-2 border-border px-2 py-0.5 text-xs font-bold rounded-sm">
              <Bookmark className="h-3 w-3" />
              {location.save_count}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-black text-base leading-tight line-clamp-1">
            {location.name}
          </h3>
          {location.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location.address}</span>
            </p>
          )}
          <HashtagBadges hashtags={location.hashtags.slice(0, 3)} linkable={false} />
        </div>
      </article>
    </Link>
  );
}
