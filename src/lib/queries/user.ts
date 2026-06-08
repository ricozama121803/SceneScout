// User-specific queries — these use the auth cookie and are NOT cached with 'use cache'
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import type { LocationSummary, DraftSummary } from "@/types/location";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface PublicProfile extends Profile {
  location_count: number;
  submitted_locations: LocationSummary[];
}

export const getProfileByUsername = unstable_cache(
  async (username: string): Promise<PublicProfile | null> => {
    const supabase = createPublicClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !profile) return null;

    const { data: locData } = await supabase
      .from("locations")
      .select("*, location_photos(url, display_order), location_hashtags(hashtag_id, hashtags(id, name))")
      .eq("user_id", profile.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    const submitted_locations: LocationSummary[] = (locData ?? []).map((loc) => ({
      ...loc,
      cover_photo_url:
        (loc.location_photos as { url: string; display_order: number }[])
          ?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
      hashtags:
        (loc.location_hashtags as { hashtags: { id: number; name: string } }[])
          ?.map((lh) => lh.hashtags)
          .filter(Boolean) ?? [],
    }));

    return { ...profile, location_count: submitted_locations.length, submitted_locations };
  },
  ["profile-by-username"],
  { revalidate: 60 }
);

export async function getUserDrafts(userId: string): Promise<DraftSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*, location_photos(url, display_order)")
    .eq("user_id", userId)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((loc) => {
    const photos = (loc.location_photos as { url: string; display_order: number }[]) ?? [];
    const cover = photos.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null;
    return { ...loc, cover_photo_url: cover };
  });
}

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
