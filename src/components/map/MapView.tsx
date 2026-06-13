"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Eye, EyeOff } from "lucide-react";
import { AuthPromptModal } from "@/components/guest/AuthPromptModal";
import { Button } from "@/components/ui/button";
import { LocationPinMarker } from "./LocationPin";
import { LocationPopup } from "./LocationPopup";
import { RentalPinMarker } from "./RentalPinMarker";
import { RentalPopup } from "./RentalPopup";
import { MapFilters } from "./MapFilters";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAPBOX_STYLE } from "@/lib/utils/constants";
import type { LocationPin } from "@/types/location";
import type { RentalPin } from "@/types/rental";
import "mapbox-gl/dist/mapbox-gl.css";

interface PopupData extends LocationPin {
  lng: number;
}

interface MapViewProps {
  initialPins: LocationPin[];
  initialRentalPins: RentalPin[];
  currentUserId: string | null;
  isAuthenticated?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.features ?? []);

export function MapView({ initialPins, initialRentalPins, currentUserId, isAuthenticated = true }: MapViewProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({ search: "", tags: [] as string[], hideMyLocations: false });
  const [mapBlurred, setMapBlurred] = useState(() =>
    !isAuthenticated && typeof window !== "undefined"
      ? sessionStorage.getItem("map-blurred") === "1"
      : false
  );
  const [selectedPin, setSelectedPin] = useState<PopupData | null>(null);
  const [selectedRentalPin, setSelectedRentalPin] = useState<(RentalPin & { lng: number }) | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const geolocateRef = useRef<React.ElementRef<typeof GeolocateControl>>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem("map-blurred");
      return;
    }
    if (sessionStorage.getItem("map-blurred") === "1") return;
    const t = setTimeout(() => {
      setMapBlurred(true);
      sessionStorage.setItem("map-blurred", "1");
    }, 30_000);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  const handleMapLoad = useCallback(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const { latitude: lat, longitude: lng } = coords;
              setUserLocation({ lat, lng });
              mapRef.current?.flyTo({ center: [lng, lat], zoom: DEFAULT_MAP_ZOOM, duration: 1400 });
            },
            () => {}
          );
        }
      })
      .catch(() => {});
  }, []);

  const hasFilter = !!(filters.search || filters.tags.length);

  const apiUrl = `/api/locations/pins?search=${encodeURIComponent(filters.search)}&tags=${filters.tags.join(",")}`;
  const { data: features } = useSWR(hasFilter ? apiUrl : null, fetcher, { fallbackData: [] });

  const rentalApiUrl = `/api/rentals/pins?search=${encodeURIComponent(filters.search)}`;
  const { data: rentalFeatures } = useSWR(filters.search ? rentalApiUrl : null, fetcher, { fallbackData: [] });

  const rawPins: LocationPin[] = hasFilter
    ? (features?.map((f: { properties: { id: string; user_id: string; name: string; avg_rating: number; cover_photo_url: string | null }; geometry: { coordinates: [number, number] } }) => ({
        id: f.properties.id,
        user_id: f.properties.user_id,
        name: f.properties.name,
        avg_rating: f.properties.avg_rating,
        cover_photo_url: f.properties.cover_photo_url ?? null,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })) ?? [])
    : initialPins;

  const rentalPins: RentalPin[] = filters.search
    ? (rentalFeatures?.map((f: { properties: { id: string; owner_id: string; name: string; price_per_hour: number | null; price_per_day: number | null; cover_photo_url: string | null }; geometry: { coordinates: [number, number] } }) => ({
        id: f.properties.id,
        owner_id: f.properties.owner_id,
        name: f.properties.name,
        price_per_hour: f.properties.price_per_hour,
        price_per_day: f.properties.price_per_day,
        cover_photo_url: f.properties.cover_photo_url ?? null,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      })) ?? [])
    : initialRentalPins;

  const pins = filters.hideMyLocations && currentUserId
    ? rawPins.filter((p) => p.user_id !== currentUserId)
    : rawPins;

  const handleFilterChange = useCallback(
    (newFilters: { search: string; tags: string[]; hideMyLocations: boolean }) => setFilters(newFilters),
    []
  );

  return (
    <div className="relative h-full w-full">
      {/* Photo toggle — below filters button on mobile, top-left of map canvas on desktop */}
      <button
        type="button"
        onClick={() => setShowPhotos((v) => !v)}
        className={`absolute left-3 top-14 z-20 flex items-center justify-center rounded-md border-2 border-border p-1.5 shadow-shadow-sm transition-colors md:top-3 md:left-[calc(20rem+0.75rem)] ${
          showPhotos ? "bg-primary text-primary-foreground" : "bg-background"
        }`}
        aria-label={showPhotos ? "Hide photos" : "Show photos"}
      >
        {showPhotos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      {/* Mobile toggle button — hidden on md+ where sidebar is always visible */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md border-2 border-border bg-background px-3 py-1.5 text-sm font-semibold shadow-shadow-sm md:hidden"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {(filters.tags.length > 0 || filters.search || filters.hideMyLocations) && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
            {filters.tags.length + (filters.search ? 1 : 0) + (filters.hideMyLocations ? 1 : 0)}
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
        <MapFilters isLoggedIn={!!currentUserId} onFilterChange={handleFilterChange} onSearch={() => setSidebarOpen(false)} />
        <p className="text-xs text-muted-foreground">{pins.length} location{pins.length !== 1 ? "s" : ""} shown</p>
      </div>

      {!isAuthenticated && <AuthPromptModal />}

      {/* Map — full width on mobile, offset on md+ */}
      <div className="relative h-full w-full md:pl-80">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: DEFAULT_MAP_CENTER.lng,
            latitude: DEFAULT_MAP_CENTER.lat,
            zoom: DEFAULT_MAP_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAPBOX_STYLE}
          onLoad={handleMapLoad}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl ref={geolocateRef} position="top-right" trackUserLocation showUserHeading />

          {userLocation && (
            <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-8 w-8 rounded-full bg-blue-500/30 animate-ping" />
                <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
              </div>
            </Marker>
          )}

          {pins.map((pin) => (
            <LocationPinMarker
              key={pin.id}
              lat={pin.lat}
              lng={pin.lng}
              name={pin.name}
              coverPhotoUrl={pin.cover_photo_url}
              isSelected={selectedPin?.id === pin.id}
              showPhoto={showPhotos}
              onClick={() => { setSelectedRentalPin(null); setSelectedPin({ ...pin, lng: pin.lng }); }}
            />
          ))}

          {rentalPins.map((pin) => (
            <RentalPinMarker
              key={pin.id}
              lat={pin.lat}
              lng={pin.lng}
              name={pin.name}
              coverPhotoUrl={pin.cover_photo_url}
              isSelected={selectedRentalPin?.id === pin.id}
              showPhoto={showPhotos}
              onClick={() => { setSelectedPin(null); setSelectedRentalPin({ ...pin, lng: pin.lng }); }}
            />
          ))}

          {selectedPin && (
            <LocationPopup data={selectedPin} onClose={() => setSelectedPin(null)} />
          )}

          {selectedRentalPin && (
            <RentalPopup data={selectedRentalPin} onClose={() => setSelectedRentalPin(null)} />
          )}
        </Map>
        {mapBlurred && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-md bg-black/40">
            <p className="text-white font-bold text-lg">Sign in to keep exploring</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/signup")}>
                Sign Up Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
