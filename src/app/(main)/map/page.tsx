import { MapLoader } from "@/components/map/MapLoader";
import { getLocationPins } from "@/lib/queries/locations";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const initialPins = await getLocationPins();

  return (
    <div style={{ height: "calc(100vh - 4rem)" }}>
      <MapLoader initialPins={initialPins} />
    </div>
  );
}
