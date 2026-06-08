import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { RentalListingSummary, RentalListingWithDetails, RentalPin } from "@/types/rental";

export const getRentalListings = unstable_cache(
  async (): Promise<RentalListingSummary[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("rental_listings")
      .select("*, rental_photos(url, display_order), owner:profiles!owner_id(username, avatar_url)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!data) return [];

    return data.map((l) => {
      const photos = ((l.rental_photos ?? []) as { url: string; display_order: number }[])
        .sort((a, b) => a.display_order - b.display_order);
      const owner = l.owner as { username: string; avatar_url: string | null } | null;
      return {
        ...l,
        rental_photos: undefined,
        owner: owner ?? { username: "unknown", avatar_url: null },
        cover_photo_url: photos[0]?.url ?? null,
      } as unknown as RentalListingSummary;
    });
  },
  ["rental-listings"],
  { tags: ["rental-listings"], revalidate: 60 }
);

export const getRentalListingById = unstable_cache(
  async (id: string): Promise<RentalListingWithDetails | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("rental_listings")
      .select("*, rental_photos(storage_path, url, display_order), owner:profiles!owner_id(id, username, avatar_url)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const photos = ((data.rental_photos ?? []) as { storage_path: string; url: string; display_order: number }[])
      .sort((a, b) => a.display_order - b.display_order);
    const owner = data.owner as { id: string; username: string; avatar_url: string | null };

    return { ...data, rental_photos: undefined, photos, owner } as unknown as RentalListingWithDetails;
  },
  ["rental-listing-by-id"],
  { tags: ["rental-listing-by-id"], revalidate: 60 }
);

export const getRentalPins = unstable_cache(
  async (): Promise<RentalPin[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("rental_listings")
      .select("id, owner_id, lat, lng, name, price_per_hour, price_per_day, rental_photos(url, display_order)")
      .eq("status", "published")
      .limit(1000);

    if (!data) return [];

    return data.map((l) => {
      const photos = ((l.rental_photos ?? []) as { url: string; display_order: number }[])
        .sort((a, b) => a.display_order - b.display_order);
      return {
        id: l.id,
        owner_id: l.owner_id,
        lat: l.lat,
        lng: l.lng,
        name: l.name,
        price_per_hour: (l.price_per_hour as number | null) ?? null,
        price_per_day: (l.price_per_day as number | null) ?? null,
        cover_photo_url: photos[0]?.url ?? null,
      } as RentalPin;
    });
  },
  ["rental-pins"],
  { tags: ["rental-pins"], revalidate: 60 }
);
