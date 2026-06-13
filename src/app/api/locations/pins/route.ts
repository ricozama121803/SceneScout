import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { LocationPin } from "@/types/location";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined;

  const supabase = await createClient();

  let query = supabase
    .from("locations")
    .select("id, user_id, lat, lng, name, avg_rating, location_photos(url, display_order)")
    .eq("status", "published");

  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }

  if (tags?.length) {
    const { data: hashtagRows } = await supabase
      .from("hashtags")
      .select("id")
      .in("name", tags);
    if (hashtagRows?.length) {
      const hashtagIds = hashtagRows.map((h) => h.id);
      const { data: locationIds } = await supabase
        .from("location_hashtags")
        .select("location_id")
        .in("hashtag_id", hashtagIds);
      if (locationIds?.length) {
        query = query.in("id", locationIds.map((r) => r.location_id));
      } else {
        return NextResponse.json({ type: "FeatureCollection", features: [] });
      }
    }
  }

  const { data, error } = await query.limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const geojson = {
    type: "FeatureCollection" as const,
    features: (data as (LocationPin & { location_photos: { url: string; display_order: number }[] })[]).map((pin) => {
      const photos = pin.location_photos ?? [];
      const cover = photos.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null;
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
        properties: { id: pin.id, user_id: pin.user_id, name: pin.name, avg_rating: pin.avg_rating, cover_photo_url: cover },
      };
    }),
  };

  return NextResponse.json(geojson, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
