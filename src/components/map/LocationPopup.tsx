"use client";

import { Popup } from "react-map-gl/mapbox";
import Link from "next/link";
import Image from "next/image";
import { Star, X, MapPin } from "lucide-react";
import { formatRating } from "@/lib/utils/formatters";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PopupData {
  id: string;
  lng: number;
  lat: number;
  name: string;
  avg_rating: number;
  cover_photo_url: string | null;
}

interface LocationPopupProps {
  data: PopupData;
  onClose: () => void;
}

export function LocationPopup({ data, onClose }: LocationPopupProps) {
  return (
    <Popup
      longitude={data.lng}
      latitude={data.lat}
      anchor="top"
      closeButton={false}
      closeOnClick={false}
      className="[&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:rounded-none [&_.mapboxgl-popup-content]:overflow-hidden [&_.mapboxgl-popup-content]:border-2 [&_.mapboxgl-popup-content]:border-black [&_.mapboxgl-popup-content]:shadow-[4px_4px_0_0_#000]"
    >
      <div className="relative w-56 bg-background text-foreground">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-sm border-2 border-border bg-background hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Cover image */}
        <div className="relative h-32 w-full border-b-2 border-border bg-muted">
          {data.cover_photo_url ? (
            <Image
              src={data.cover_photo_url}
              alt={data.name}
              fill
              className="object-cover"
              sizes="224px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {data.avg_rating > 0 && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-accent border-2 border-border px-1.5 py-0.5 text-xs font-bold rounded-sm">
              <Star className="h-3 w-3 fill-foreground" />
              {formatRating(data.avg_rating)}
            </div>
          )}
        </div>

        {/* Info + CTA */}
        <div className="p-3 space-y-2.5">
          <p className="font-black text-sm leading-tight pr-5">{data.name}</p>
          <Link
            href={`/locations/${data.id}`}
            className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
          >
            View Location
          </Link>
        </div>
      </div>
    </Popup>
  );
}
