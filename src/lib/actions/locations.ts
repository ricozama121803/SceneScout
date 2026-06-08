"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CreateLocationSchema, UpdateDraftSchema, type UpdateDraftInput } from "@/types/forms";

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

export async function quickSaveLocation(input: {
  lat: number;
  lng: number;
  photo_path: string;
  name: string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to save a location" };

  const { data: location, error: locError } = await supabase
    .from("locations")
    .insert({
      user_id: user.id,
      name: input.name,
      description: "",
      lat: input.lat,
      lng: input.lng,
      status: "draft",
    })
    .select("id")
    .single();

  if (locError || !location) return { error: locError?.message ?? "Failed to save draft" };

  await supabase.from("location_photos").insert({
    location_id: location.id,
    storage_path: input.photo_path,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/location-photos/${input.photo_path}`,
    display_order: 0,
  });

  return { id: location.id };
}

async function syncPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  locationId: string,
  photoPaths: string[]
) {
  const { data: existing } = await supabase
    .from("location_photos")
    .select("storage_path")
    .eq("location_id", locationId);

  const newSet = new Set(photoPaths);
  const toRemove = (existing ?? []).filter((p) => !newSet.has(p.storage_path));

  if (toRemove.length > 0) {
    await supabase.storage
      .from("location-photos")
      .remove(toRemove.map((p) => p.storage_path));
  }

  await supabase.from("location_photos").delete().eq("location_id", locationId);

  if (photoPaths.length > 0) {
    await supabase.from("location_photos").insert(
      photoPaths.map((path, i) => ({
        location_id: locationId,
        storage_path: path,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/location-photos/${path}`,
        display_order: i,
      }))
    );
  }
}

export async function updateLocation(
  locationId: string,
  data: UpdateDraftInput
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("locations")
    .select("user_id")
    .eq("id", locationId)
    .single();

  if (!existing || existing.user_id !== user.id) return { error: "Not authorized" };

  const { hashtag_ids, photo_paths, ...fields } = data;

  await supabase
    .from("locations")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", locationId);

  if (photo_paths !== undefined) {
    await syncPhotos(supabase, locationId, photo_paths);
  }

  if (hashtag_ids !== undefined) {
    await supabase.from("location_hashtags").delete().eq("location_id", locationId);
    if (hashtag_ids.length > 0) {
      await supabase.from("location_hashtags").insert(
        hashtag_ids.map((hashtag_id) => ({ location_id: locationId, hashtag_id }))
      );
    }
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function publishLocation(
  locationId: string,
  data: CreateLocationInput
): Promise<{ error: string } | undefined> {
  const parsed = CreateLocationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("locations")
    .select("user_id")
    .eq("id", locationId)
    .single();

  if (!existing || existing.user_id !== user.id) return { error: "Not authorized" };

  const { hashtag_ids, photo_paths, ...fields } = parsed.data;

  await supabase
    .from("locations")
    .update({
      ...fields,
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", locationId);

  await syncPhotos(supabase, locationId, photo_paths);

  await supabase.from("location_hashtags").delete().eq("location_id", locationId);
  if (hashtag_ids.length > 0) {
    await supabase.from("location_hashtags").insert(
      hashtag_ids.map((hashtag_id) => ({ location_id: locationId, hashtag_id }))
    );
  }

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/map");
  revalidatePath("/profile");
  revalidateTag("locations", "max");
  revalidateTag("location-pins", "max");
  revalidateTag("location-by-id", "max");
  redirect(`/locations/${locationId}`);
}

type CreateLocationInput = import("@/types/forms").CreateLocationInput;
