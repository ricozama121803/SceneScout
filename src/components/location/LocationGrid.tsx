import { LocationCard } from "./LocationCard";
import type { LocationSummary } from "@/types/location";

interface LocationGridProps {
  locations: LocationSummary[];
  emptyMessage?: string;
}

export function LocationGrid({ locations, emptyMessage = "No locations found." }: LocationGridProps) {
  if (!locations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-lg text-muted-foreground font-bold">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}
