"use client";

import dynamic from "next/dynamic";
import type { LocationPin } from "@/types/location";
import type { RentalPin } from "@/types/rental";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
});

export function MapLoader({ initialPins, initialRentalPins, currentUserId }: { initialPins: LocationPin[]; initialRentalPins: RentalPin[]; currentUserId: string | null }) {
  return <MapView initialPins={initialPins} initialRentalPins={initialRentalPins} currentUserId={currentUserId} />;
}
