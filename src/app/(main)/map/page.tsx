import { MapLoader } from "@/components/map/MapLoader";
import { getLocationPins } from "@/lib/queries/locations";
import { getRentalPins } from "@/lib/queries/rentals";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const [initialPins, initialRentalPins, { data: { user } }] = await Promise.all([
    getLocationPins(),
    getRentalPins(),
    createClient().then((s) => s.auth.getUser()),
  ]);

  return (
    <div style={{ height: "calc(100vh - 4rem)" }}>
      <MapLoader initialPins={initialPins} initialRentalPins={initialRentalPins} currentUserId={user?.id ?? null} />
    </div>
  );
}
