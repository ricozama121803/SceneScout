import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { LocationSummary, LocationWithDetails, LocationPin } from "@/types/location";

export const getLocations = unstable_cache(
  async ({
    search,
    tag,
    page = 1,
    limit = 12,
    sort = "newest",
    minRating,
    hasAccessibility,
    hasParking,
  }: {
    search?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sort?: "newest" | "top_rated" | "most_saved" | "most_rated";
    minRating?: number;
    hasAccessibility?: boolean;
    hasParking?: boolean;
  } = {}): Promise<LocationSummary[]> => {
    const supabase = createPublicClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from("locations")
      .select(
        `*, location_photos(url, display_order), location_hashtags(hashtag_id, hashtags(id, name))`
      )
      .range(offset, offset + limit - 1);

    switch (sort) {
      case "top_rated":
        query = query.order("avg_rating", { ascending: false }).order("rating_count", { ascending: false });
        break;
      case "most_saved":
        query = query.order("save_count", { ascending: false });
        break;
      case "most_rated":
        query = query.order("rating_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (minRating) {
      query = query.gte("avg_rating", minRating).gte("rating_count", 1);
    }

    if (hasAccessibility) {
      query = query.not("accessibility", "is", null).neq("accessibility", "");
    }

    if (hasParking) {
      query = query.not("parking_notes", "is", null).neq("parking_notes", "");
    }

    if (tag) {
      const { data: hashtagRow } = await supabase
        .from("hashtags")
        .select("id")
        .eq("name", tag)
        .single();
      if (hashtagRow) {
        const { data: locationIds } = await supabase
          .from("location_hashtags")
          .select("location_id")
          .eq("hashtag_id", hashtagRow.id);
        if (locationIds?.length) {
          query = query.in("id", locationIds.map((r) => r.location_id));
        } else {
          return [];
        }
      }
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((loc) => ({
      ...loc,
      cover_photo_url:
        (loc.location_photos as { url: string; display_order: number }[])
          ?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
      hashtags: (loc.location_hashtags as { hashtags: { id: number; name: string } }[])
        ?.map((lh) => lh.hashtags)
        .filter(Boolean) ?? [],
    }));
  },
  ["locations"],
  { tags: ["locations"], revalidate: 60 }
);

// Note: unstable_cache with a function that takes args caches per unique arg set
export const getLocationById = unstable_cache(
  async (id: string): Promise<LocationWithDetails | null> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("locations")
      .select(
        `*,
        location_photos(*),
        location_hashtags(hashtag_id, hashtags(id, name)),
        community_tips(*, profiles(id, username, avatar_url)),
        comments(*, profiles(id, username, avatar_url)),
        profiles!locations_user_id_fkey(id, username, avatar_url)`
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const photos = (data.location_photos as LocationWithDetails["photos"]) ?? [];

    return {
      ...data,
      cover_photo_url: photos.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
      hashtags:
        (data.location_hashtags as { hashtags: { id: number; name: string } }[])
          ?.map((lh) => lh.hashtags)
          .filter(Boolean) ?? [],
      photos,
      tips: (data.community_tips as unknown as LocationWithDetails["tips"]) ?? [],
      comments: (data.comments as unknown as LocationWithDetails["comments"]) ?? [],
      submitted_by: data.profiles as unknown as LocationWithDetails["submitted_by"],
    };
  },
  ["location-by-id"],
  { revalidate: 60 }
);

export const getTrending = unstable_cache(
  async (limit = 6): Promise<LocationSummary[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("locations")
      .select(`*, location_photos(url, display_order), location_hashtags(hashtag_id, hashtags(id, name))`)
      .order("save_count", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((loc) => ({
      ...loc,
      cover_photo_url:
        (loc.location_photos as { url: string; display_order: number }[])
          ?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
      hashtags: (loc.location_hashtags as { hashtags: { id: number; name: string } }[])
        ?.map((lh) => lh.hashtags)
        .filter(Boolean) ?? [],
    }));
  },
  ["trending"],
  { tags: ["locations", "trending"], revalidate: 300 }
);

export const getTopRated = unstable_cache(
  async (limit = 6): Promise<LocationSummary[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("locations")
      .select(`*, location_photos(url, display_order), location_hashtags(hashtag_id, hashtags(id, name))`)
      .gte("rating_count", 1)
      .order("avg_rating", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((loc) => ({
      ...loc,
      cover_photo_url:
        (loc.location_photos as { url: string; display_order: number }[])
          ?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
      hashtags: (loc.location_hashtags as { hashtags: { id: number; name: string } }[])
        ?.map((lh) => lh.hashtags)
        .filter(Boolean) ?? [],
    }));
  },
  ["top-rated"],
  { tags: ["locations", "top-rated"], revalidate: 300 }
);

export const getLocationPins = unstable_cache(
  async (params?: { search?: string; tags?: string[] }): Promise<LocationPin[]> => {
    const supabase = createPublicClient();
    let query = supabase
      .from("locations")
      .select("id, user_id, lat, lng, name, avg_rating, location_photos(url, display_order)");

    if (params?.search) {
      query = query.ilike("name", `%${params.search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((loc) => {
      const photos = (loc.location_photos as { url: string; display_order: number }[]) ?? [];
      const cover = photos.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null;
      return { id: loc.id, user_id: loc.user_id, lat: loc.lat, lng: loc.lng, name: loc.name, avg_rating: loc.avg_rating, cover_photo_url: cover };
    });
  },
  ["location-pins"],
  { tags: ["location-pins"], revalidate: 60 }
);
