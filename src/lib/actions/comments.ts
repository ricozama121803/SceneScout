"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import { AddCommentSchema } from "@/types/forms";

export async function addComment(locationId: string, content: string) {
  const parsed = AddCommentSchema.safeParse({ content });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to comment" };

  const { error } = await supabase.from("comments").insert({
    location_id: locationId,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (error) return { error: error.message };

  revalidateTag("locations", "max");
  return { success: true };
}

export async function deleteComment(commentId: string, locationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateTag("locations", "max");
  return { success: true };
}
