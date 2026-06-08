import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditDraftForm } from "@/components/forms/EditDraftForm";
import { HASHTAG_LIST } from "@/lib/utils/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Draft" };

export default async function EditDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: location } = await supabase
    .from("locations")
    .select("*, location_photos(url, storage_path, display_order), location_hashtags(hashtag_id)")
    .eq("id", id)
    .single();

  if (!location || location.user_id !== user.id || location.status !== "draft") {
    redirect("/profile?tab=drafts");
  }

  const { data: dbHashtags } = await supabase.from("hashtags").select("id, name").order("name");
  const hashtags = dbHashtags?.length ? dbHashtags : HASHTAG_LIST;

  const photos = (location.location_photos as { url: string; storage_path: string; display_order: number }[]) ?? [];
  const hashtag_ids = (location.location_hashtags as { hashtag_id: number }[])?.map((lh) => lh.hashtag_id) ?? [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Finish Your Draft</h1>
        <p className="text-muted-foreground">
          Add the details and publish when you&apos;re ready — or save and come back later.
        </p>
      </div>
      <EditDraftForm
        draft={{
          id: location.id,
          name: location.name,
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          parking_notes: location.parking_notes,
          parking_score: location.parking_score,
          permit_notes: location.permit_notes,
          accessibility: location.accessibility,
          accessibility_score: location.accessibility_score,
          photos,
          hashtag_ids,
        }}
        hashtags={hashtags}
      />
    </div>
  );
}
