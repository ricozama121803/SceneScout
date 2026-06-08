"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CreateRentalListingSchema, type CreateRentalListingInput } from "@/types/forms";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function createRentalListing(formData: CreateRentalListingInput) {
  const parsed = CreateRentalListingSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to list a space" };

  const { photo_paths, ...listingData } = parsed.data;

  const { data: listing, error: listingError } = await supabase
    .from("rental_listings")
    .insert({ ...listingData, owner_id: user.id, status: "draft" })
    .select("id")
    .single();

  if (listingError || !listing) return { error: listingError?.message ?? "Failed to create listing" };

  if (photo_paths.length > 0) {
    await supabase.from("rental_photos").insert(
      photo_paths.map((path, i) => ({
        listing_id: listing.id,
        storage_path: path,
        url: `${SUPABASE_URL}/storage/v1/object/public/location-photos/${path}`,
        display_order: i,
      }))
    );
  }

  revalidatePath("/business");
  redirect("/business");
}

export async function publishRentalListing(listingId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("rental_listings")
    .select("owner_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.owner_id !== user.id) return { error: "Not authorized" };

  await supabase
    .from("rental_listings")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  revalidatePath("/rentals");
  revalidatePath("/business");
  revalidatePath("/map");
  revalidateTag("rental-listings", "max");
  revalidateTag("rental-pins", "max");
  revalidateTag("rental-listing-by-id", "max");
  return { success: true };
}

export async function deleteRentalListing(listingId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: listing } = await supabase
    .from("rental_listings")
    .select("owner_id, rental_photos(storage_path)")
    .eq("id", listingId)
    .single();

  if (!listing || listing.owner_id !== user.id) return { error: "Not authorized" };

  const photos = listing.rental_photos as { storage_path: string }[];
  if (photos?.length > 0) {
    await supabase.storage.from("location-photos").remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabase.from("rental_listings").delete().eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/rentals");
  revalidatePath("/business");
  revalidatePath("/map");
  revalidateTag("rental-listings", "max");
  revalidateTag("rental-pins", "max");
  return { success: true };
}
