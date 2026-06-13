import { MapLoader } from "@/components/map/MapLoader";
import { getLocationPins } from "@/lib/queries/locations";
import { getRentalPins } from "@/lib/queries/rentals";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const [{ data: { user } }, initialRentalPins] = await Promise.all([
    createClient().then((s) => s.auth.getUser()),
    getRentalPins(),
  ]);

  const isAuthenticated = !!user;
  const initialPins = await getLocationPins(isAuthenticated ? undefined : { limit: 10 });

  return (
    <div style={{ height: "calc(100vh - 4rem)" }}>
      <MapLoader initialPins={initialPins} initialRentalPins={initialRentalPins} currentUserId={user?.id ?? null} isAuthenticated={isAuthenticated} />
    </div>
  );
}
