"use server";

import { createClient } from "@/lib/supabase/server";

export async function findOrCreateHashtag(
  name: string
): Promise<{ id: number } | { error: string }> {
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  if (normalized.length < 2) return { error: "Hashtag must be at least 2 characters" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in" };

  const { data: existing } = await supabase
    .from("hashtags")
    .select("id")
    .eq("name", normalized)
    .single();

  if (existing) return { id: existing.id };

  const { data, error } = await supabase
    .from("hashtags")
    .insert({ name: normalized })
    .select("id")
    .single();

  if (error || !data) return { error: "Failed to create hashtag" };
  return { id: data.id };
}
