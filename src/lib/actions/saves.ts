"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export async function toggleSave(locationId: string, currentlySaved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to save locations" };

  if (currentlySaved) {
    await supabase
      .from("saved_locations")
      .delete()
      .eq("user_id", user.id)
      .eq("location_id", locationId);
  } else {
    await supabase
      .from("saved_locations")
      .insert({ user_id: user.id, location_id: locationId });
  }

  revalidateTag("locations", "max");
  return { success: true };
}
