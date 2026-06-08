"use client";

import { Popup } from "react-map-gl/mapbox";
import Link from "next/link";
import Image from "next/image";
import { X, Store, DollarSign } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RentalPin } from "@/types/rental";

interface RentalPopupProps {
  data: RentalPin & { lng: number };
  onClose: () => void;
}

function formatPrice(perHour: number | null, perDay: number | null) {
  if (perHour && perDay) return `$${perHour}/hr · $${perDay}/day`;
  if (perHour) return `$${perHour}/hr`;
  if (perDay) return `$${perDay}/day`;
  return null;
}

export function RentalPopup({ data, onClose }: RentalPopupProps) {
  const price = formatPrice(data.price_per_hour, data.price_per_day);

  return (
    <Popup
      longitude={data.lng}
      latitude={data.lat}
      anchor="top"
      closeButton={false}
      closeOnClick={false}
      className="[&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:rounded-none [&_.mapboxgl-popup-content]:overflow-hidden [&_.mapboxgl-popup-content]:border-2 [&_.mapboxgl-popup-content]:border-emerald-500 [&_.mapboxgl-popup-content]:shadow-[4px_4px_0_0_#10b981]"
    >
      <div className="relative w-56 bg-background text-foreground">
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-sm border-2 border-border bg-background hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="relative h-32 w-full border-b-2 border-emerald-500 bg-muted">
          {data.cover_photo_url ? (
            <Image src={data.cover_photo_url} alt={data.name} fill className="object-cover" sizes="224px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
              <Store className="h-10 w-10 text-emerald-400" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 bg-emerald-500 border-2 border-white px-1.5 py-0.5 text-[10px] font-black text-white rounded-sm">
            AVAILABLE
          </div>
        </div>

        <div className="p-3 space-y-2.5">
          <p className="font-black text-sm leading-tight pr-5">{data.name}</p>
          {price && (
            <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <DollarSign className="h-3 w-3" />
              {price}
            </p>
          )}
          <Link
            href={`/rentals/${data.id}`}
            className={cn(buttonVariants({ size: "sm" }), "w-full justify-center bg-emerald-500 hover:bg-emerald-600 border-emerald-700")}
          >
            View Space
          </Link>
        </div>
      </div>
    </Popup>
  );
}
