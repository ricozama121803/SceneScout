"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function getUploadUrl(filename: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to upload photos" };

  const ext = filename.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const serviceSupabase = createServiceClient();
  const { data, error } = await serviceSupabase.storage
    .from("location-photos")
    .createSignedUploadUrl(storagePath);

  if (error || !data) return { error: error?.message ?? "Failed to create upload URL" };

  return { signedUrl: data.signedUrl, path: storagePath };
}
