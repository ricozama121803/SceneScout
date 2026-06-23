import { MapLoader } from "@/components/map/MapLoader";
import { getLocationPins } from "@/lib/queries/locations";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const { data: { user } } = await createClient().then((s) => s.auth.getUser());

  const isAuthenticated = !!user;
  const initialPins = await getLocationPins(isAuthenticated ? undefined : { limit: 10 });

  return (
    <div style={{ height: "calc(100vh - 4rem)" }}>
      <MapLoader initialPins={initialPins} initialRentalPins={[]} currentUserId={user?.id ?? null} isAuthenticated={isAuthenticated} />
    </div>
  );
}
