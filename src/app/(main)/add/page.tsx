import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AddLocationForm } from "@/components/forms/AddLocationForm";
import { HASHTAG_LIST } from "@/lib/utils/constants";

export const metadata = { title: "Add Location" };

async function AddLocationContent() {
  const supabase = await createClient();

  const { data: dbHashtags } = await supabase
    .from("hashtags")
    .select("id, name")
    .order("name");

  const hashtags = dbHashtags?.length ? dbHashtags : HASHTAG_LIST;

  return <AddLocationForm hashtags={hashtags} />;
}

export default function AddLocationPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Add a Filming Location</h1>
        <p className="text-muted-foreground">
          Share a great spot with the community. Include photos, hashtags, and practical tips.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
        <AddLocationContent />
      </Suspense>
    </div>
  );
}
