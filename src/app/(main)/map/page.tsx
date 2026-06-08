import { MapLoader } from "@/components/map/MapLoader";
import { getLocationPins } from "@/lib/queries/locations";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const [initialPins, { data: { user } }] = await Promise.all([
    getLocationPins(),
    createClient().then((s) => s.auth.getUser()),
  ]);

  return (
    <div style={{ height: "calc(100vh - 4rem)" }}>
      <MapLoader initialPins={initialPins} currentUserId={user?.id ?? null} />
    </div>
  );
}
