"use client";

import Image from "next/image";
import { Marker } from "react-map-gl/mapbox";
import { Store } from "lucide-react";

interface RentalPinMarkerProps {
  lat: number;
  lng: number;
  name: string;
  coverPhotoUrl: string | null;
  onClick: () => void;
  isSelected?: boolean;
  showPhoto?: boolean;
}

export function RentalPinMarker({ lat, lng, name, coverPhotoUrl, onClick, isSelected, showPhoto }: RentalPinMarkerProps) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom" onClick={onClick}>
      <button
        className="group focus:outline-none flex flex-col items-center"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        {showPhoto && (
          <div className={`mb-1 w-24 rounded-sm border-2 overflow-hidden shadow-[2px_2px_0_0_#000] transition-transform ${
            isSelected ? "border-yellow-400 scale-110" : "border-emerald-500 group-hover:scale-105"
          }`}>
            <div className="relative h-16 w-full bg-muted">
              {coverPhotoUrl ? (
                <Image src={coverPhotoUrl} alt={name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                  <Store className="h-5 w-5 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="bg-emerald-500 px-1 py-0.5">
              <p className="text-[10px] font-bold leading-tight truncate text-white">AVAILABLE</p>
            </div>
          </div>
        )}
        <Store
          className={`h-8 w-8 transition-transform group-hover:scale-125 drop-shadow-md ${
            isSelected ? "text-yellow-400 scale-125" : "text-emerald-500"
          }`}
          fill={isSelected ? "#facc15" : "#10b981"}
          strokeWidth={1.5}
          stroke="white"
        />
      </button>
    </Marker>
  );
}
