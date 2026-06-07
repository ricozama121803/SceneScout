"use client";

import Image from "next/image";
import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";

interface LocationPinProps {
  lat: number;
  lng: number;
  name: string;
  coverPhotoUrl: string | null;
  onClick: () => void;
  isSelected?: boolean;
  showPhoto?: boolean;
}

export function LocationPinMarker({ lat, lng, name, coverPhotoUrl, onClick, isSelected, showPhoto }: LocationPinProps) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom" onClick={onClick}>
      <button
        className="group focus:outline-none flex flex-col items-center"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        {showPhoto && (
          <div className={`mb-1 w-24 rounded-sm border-2 overflow-hidden shadow-[2px_2px_0_0_#000] transition-transform ${
            isSelected ? "border-yellow-400 scale-110" : "border-border group-hover:scale-105"
          }`}>
            <div className="relative h-16 w-full bg-muted">
              {coverPhotoUrl ? (
                <Image src={coverPhotoUrl} alt={name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="bg-background px-1 py-0.5">
              <p className="text-[10px] font-bold leading-tight truncate">{name}</p>
            </div>
          </div>
        )}
        <MapPin
          className={`h-8 w-8 transition-transform group-hover:scale-125 drop-shadow-md ${
            isSelected ? "text-yellow-400 scale-125" : "text-primary"
          }`}
          fill={isSelected ? "#facc15" : "currentColor"}
          strokeWidth={1.5}
        />
      </button>
    </Marker>
  );
}
