"use client";

import { useState, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "react-map-gl/mapbox";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAPBOX_STYLE } from "@/lib/utils/constants";
import "mapbox-gl/dist/mapbox-gl.css";

interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (location: PickedLocation) => void;
}

async function reverseGeocode(lng: number, lat: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`
    );
    const data = await res.json();
    return data.features?.[0]?.place_name as string | undefined;
  } catch {
    return undefined;
  }
}

export function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const [locating, setLocating] = useState(false);

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      const address = await reverseGeocode(lng, lat);
      onChange({ lat, lng, address });
    },
    [onChange]
  );

  function handleCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        const address = await reverseGeocode(lng, lat);
        onChange({ lat, lng, address });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCurrentLocation}
        disabled={locating}
        className="gap-2"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        {locating ? "Getting location…" : "Use my current location"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Or click anywhere on the map to drop a pin.
      </p>

      <div className="relative h-72 overflow-hidden rounded-xl border cursor-crosshair">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: value?.lng ?? DEFAULT_MAP_CENTER.lng,
            latitude: value?.lat ?? DEFAULT_MAP_CENTER.lat,
            zoom: value ? 13 : DEFAULT_MAP_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAPBOX_STYLE}
          onClick={handleMapClick}
        >
          <NavigationControl position="top-right" />
          {value && (
            <Marker longitude={value.lng} latitude={value.lat} anchor="bottom">
              <MapPin
                className="h-8 w-8 text-primary drop-shadow-lg"
                fill="currentColor"
                strokeWidth={1.5}
              />
            </Marker>
          )}
        </Map>
      </div>

      {value && (
        <p className="text-xs text-muted-foreground tabular-nums">
          📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
