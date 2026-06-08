"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CreateLocationSchema } from "@/types/forms";

export async function createLocation(formData: CreateLocationInput) {
  const parsed = CreateLocationSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to add a location" };

  const { photo_paths, hashtag_ids, ...locationData } = parsed.data;

  const { data: location, error: locError } = await supabase
    .from("locations")
    .insert({ ...locationData, user_id: user.id })
    .select("id")
    .single();

  if (locError || !location) {
    return { error: locError?.message ?? "Failed to create location" };
  }

  // Insert photos
  if (photo_paths.length > 0) {
    const photoRows = photo_paths.map((path, i) => ({
      location_id: location.id,
      storage_path: path,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/location-photos/${path}`,
      display_order: i,
    }));
    await supabase.from("location_photos").insert(photoRows);
  }

  // Insert hashtags
  if (hashtag_ids.length > 0) {
    const hashtagRows = hashtag_ids.map((hashtag_id) => ({
      location_id: location.id,
      hashtag_id,
    }));
    await supabase.from("location_hashtags").insert(hashtagRows);
  }

  revalidatePath("/");
  revalidatePath("/locations");
  revalidateTag("locations", "max");
  redirect(`/locations/${location.id}`);
}

export async function deleteLocation(locationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: location } = await supabase
    .from("locations")
    .select("user_id, location_photos(storage_path)")
    .eq("id", locationId)
    .single();

  if (!location || location.user_id !== user.id) {
    return { error: "Not authorized to delete this location" };
  }

  // Delete storage objects
  const photos = location.location_photos as { storage_path: string }[];
  if (photos?.length > 0) {
    await supabase.storage
      .from("location-photos")
      .remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabase.from("locations").delete().eq("id", locationId);
  if (error) return { error: error.message };

  revalidatePath("/locations");
  revalidatePath("/map");
  revalidatePath("/profile");
  revalidateTag("locations", "max");
  revalidateTag("location-pins", "max");
  return { success: true };
}

type CreateLocationInput = import("@/types/forms").CreateLocationInput;
