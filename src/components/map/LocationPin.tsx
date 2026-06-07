"use client";

import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";

interface LocationPinProps {
  lat: number;
  lng: number;
  onClick: () => void;
  isSelected?: boolean;
}

export function LocationPinMarker({ lat, lng, onClick, isSelected }: LocationPinProps) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom" onClick={onClick}>
      <button
        className="group focus:outline-none"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
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
