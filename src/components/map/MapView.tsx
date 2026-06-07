"use client";

import { useState, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import useSWR from "swr";
import { LocationPinMarker } from "./LocationPin";
import { LocationPopup } from "./LocationPopup";
import { MapFilters } from "./MapFilters";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAPBOX_STYLE } from "@/lib/utils/constants";
import type { LocationPin } from "@/types/location";
import "mapbox-gl/dist/mapbox-gl.css";

interface PopupData extends LocationPin {
  lng: number;
}

interface MapViewProps {
  initialPins: LocationPin[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.features ?? []);

export function MapView({ initialPins }: MapViewProps) {
  const [filters, setFilters] = useState({ search: "", tags: [] as string[] });
  const [selectedPin, setSelectedPin] = useState<PopupData | null>(null);

  const apiUrl = `/api/locations/pins?search=${encodeURIComponent(filters.search)}&tags=${filters.tags.join(",")}`;
  const { data: features } = useSWR(
    filters.search || filters.tags.length ? apiUrl : null,
    fetcher,
    { fallbackData: [] }
  );

  const pins: LocationPin[] = filters.search || filters.tags.length
    ? (features?.map((f: { properties: { id: string; name: string; avg_rating: number; cover_photo_url: string | null }; geometry: { coordinates: [number, number] } }) => ({
        id: f.properties.id,
        name: f.properties.name,
        avg_rating: f.properties.avg_rating,
        cover_photo_url: f.properties.cover_photo_url ?? null,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })) ?? [])
    : initialPins;

  const handleFilterChange = useCallback(
    (newFilters: { search: string; tags: string[] }) => setFilters(newFilters),
    []
  );

  return (
    <div className="relative h-full w-full">
      {/* Sidebar */}
      <div className="absolute left-0 top-0 z-10 h-full w-80 overflow-y-auto border-r bg-background/95 backdrop-blur p-4 space-y-4">
        <h2 className="font-semibold text-sm">Filter Locations</h2>
        <MapFilters onFilterChange={handleFilterChange} />
        <p className="text-xs text-muted-foreground">{pins.length} location{pins.length !== 1 ? "s" : ""} shown</p>
      </div>

      {/* Map */}
      <div className="h-full w-full pl-80">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: DEFAULT_MAP_CENTER.lng,
            latitude: DEFAULT_MAP_CENTER.lat,
            zoom: DEFAULT_MAP_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAPBOX_STYLE}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />

          {pins.map((pin) => (
            <LocationPinMarker
              key={pin.id}
              lat={pin.lat}
              lng={pin.lng}
              isSelected={selectedPin?.id === pin.id}
              onClick={() => setSelectedPin({ ...pin, lng: pin.lng })}
            />
          ))}

          {selectedPin && (
            <LocationPopup data={selectedPin} onClose={() => setSelectedPin(null)} />
          )}
        </Map>
      </div>
    </div>
  );
}
