import { NextResponse } from "next/server";
import { getRentalPins } from "@/lib/queries/rentals";

export async function GET() {
  const pins = await getRentalPins();

  const geojson = {
    type: "FeatureCollection",
    features: pins.map((pin) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
      properties: {
        id: pin.id,
        owner_id: pin.owner_id,
        name: pin.name,
        price_per_hour: pin.price_per_hour,
        price_per_day: pin.price_per_day,
        cover_photo_url: pin.cover_photo_url,
      },
    })),
  };

  return NextResponse.json(geojson, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
