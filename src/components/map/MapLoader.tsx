"use client";

import dynamic from "next/dynamic";
import type { LocationPin } from "@/types/location";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
});

export function MapLoader({ initialPins }: { initialPins: LocationPin[] }) {
  return <MapView initialPins={initialPins} />;
}
