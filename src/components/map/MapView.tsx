"use client";

import { useState, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import useSWR from "swr";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile toggle button — hidden on md+ where sidebar is always visible */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md border-2 border-border bg-background px-3 py-1.5 text-sm font-semibold shadow-shadow-sm md:hidden"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {(filters.tags.length > 0 || filters.search) && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
            {filters.tags.length + (filters.search ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slides in on mobile, always visible on md+ */}
      <div
        className={[
          "absolute left-0 top-0 z-30 h-full w-80 overflow-y-auto border-r-2 border-border bg-background/95 backdrop-blur p-4 space-y-4 transition-transform duration-300",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Filter Locations</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <MapFilters onFilterChange={handleFilterChange} onSearch={() => setSidebarOpen(false)} />
        <p className="text-xs text-muted-foreground">{pins.length} location{pins.length !== 1 ? "s" : ""} shown</p>
      </div>

      {/* Map — full width on mobile, offset on md+ */}
      <div className="h-full w-full md:pl-80">
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
