"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import { CommunityTipSchema, type CommunityTipInput } from "@/types/forms";

export async function upsertTip(locationId: string, tipData: CommunityTipInput) {
  const parsed = CommunityTipSchema.safeParse(tipData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to add tips" };

  const { error } = await supabase.from("community_tips").upsert(
    { location_id: locationId, user_id: user.id, ...parsed.data },
    { onConflict: "location_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidateTag("locations", "max");
  return { success: true };
}
