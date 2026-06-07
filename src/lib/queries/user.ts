// User-specific queries — these use the auth cookie and are NOT cached with 'use cache'
import { createClient } from "@/lib/supabase/server";
import type { LocationSummary } from "@/types/location";

export async function getSavedLocations(userId: string): Promise<LocationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_locations")
    .select(
      `locations(*, location_photos(url, display_order), location_hashtags(hashtag_id, hashtags(id, name)))`
    )
    .eq("user_id", userId);

  if (error || !data) return [];

  return data
    .map((row) => {
      const loc = row.locations as typeof row.locations & {
        location_photos: { url: string; display_order: number }[];
        location_hashtags: { hashtags: { id: number; name: string } }[];
      };
      if (!loc) return null;
      return {
        ...loc,
        cover_photo_url:
          loc.location_photos?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
        hashtags: loc.location_hashtags?.map((lh) => lh.hashtags).filter(Boolean) ?? [],
        is_saved: true,
      };
    })
    .filter(Boolean) as LocationSummary[];
}
