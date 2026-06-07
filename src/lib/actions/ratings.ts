"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export async function upsertRating(locationId: string, value: number) {
  if (value < 1 || value > 5) return { error: "Rating must be between 1 and 5" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to rate locations" };

  const { error } = await supabase.from("ratings").upsert(
    { location_id: locationId, user_id: user.id, value },
    { onConflict: "location_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidateTag("locations", "max");
  return { success: true };
}
