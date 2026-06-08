"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import { UpdateProfileSchema, type UpdateProfileInput } from "@/types/forms";

export async function updateProfile(
  data: UpdateProfileInput
): Promise<{ error?: string }> {
  const parsed = UpdateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated" };

  const { username, bio, show_email, instagram, youtube, linkedin, website } = parsed.data;

  // Check username uniqueness (allow keeping the same username)
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .single();

  if (existing) return { error: "Username is already taken" };

  const { error } = await supabase.from("profiles").update({
    username,
    bio: bio || null,
    show_email: show_email ?? false,
    instagram: instagram || null,
    youtube: youtube || null,
    linkedin: linkedin || null,
    website: website || null,
  }).eq("id", user.id);

  if (error) return { error: error.message };

  revalidateTag("profile", "max");
  return {};
}

export async function updateAvatarUrl(
  storagePath: string
): Promise<{ avatarUrl: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/location-photos/${storagePath}`;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidateTag("profile", "max");
  return { avatarUrl };
}
