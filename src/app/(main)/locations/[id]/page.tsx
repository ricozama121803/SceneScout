import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocationById } from "@/lib/queries/locations";
import { PhotoGallery } from "@/components/location/PhotoGallery";
import { HashtagBadges } from "@/components/location/HashtagBadges";
import { StarRating } from "@/components/location/StarRating";
import { SaveButton } from "@/components/location/SaveButton";
import { CommunityTipCard } from "@/components/location/CommunityTipCard";
import { CommunityTipForm } from "@/components/location/CommunityTipForm";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ParkingCircle, FileText, Accessibility, Star } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const location = await getLocationById(id);
  if (!location) return { title: "Location Not Found" };
  return {
    title: location.name,
    description: location.description.slice(0, 160),
    openGraph: location.cover_photo_url
      ? { images: [{ url: location.cover_photo_url }] }
      : undefined,
  };
}

// Fetches user-specific state — must be wrapped in <Suspense> since it's uncached
async function UserPanel({ locationId }: { locationId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  let isSaved = false;
  let userRating: number | null = null;

  if (user) {
    const [savedRow, ratingRow] = await Promise.all([
      supabase.from("saved_locations").select("user_id").eq("user_id", user.id).eq("location_id", locationId).single(),
      supabase.from("ratings").select("value").eq("user_id", user.id).eq("location_id", locationId).single(),
    ]);
    isSaved = !!savedRow.data;
    userRating = (ratingRow.data as { value: number } | null)?.value ?? null;
  }

  return { isLoggedIn, isSaved, userRating };
}

async function UserSaveButton({ locationId }: { locationId: string }) {
  const { isLoggedIn, isSaved } = await UserPanel({ locationId });
  return <SaveButton locationId={locationId} initialSaved={isSaved} isLoggedIn={isLoggedIn} />;
}

async function UserStarRating({
  locationId,
  initialRating,
  ratingCount,
}: {
  locationId: string;
  initialRating: number;
  ratingCount: number;
}) {
  const { isLoggedIn, userRating } = await UserPanel({ locationId });
  return (
    <StarRating
      locationId={locationId}
      initialRating={initialRating}
      ratingCount={ratingCount}
      userRating={userRating}
      isLoggedIn={isLoggedIn}
    />
  );
}

async function UserCommentSection({ locationId }: { locationId: string }) {
  const { isLoggedIn } = await UserPanel({ locationId });
  if (isLoggedIn) return <CommentForm locationId={locationId} />;
  return (
    <p className="text-sm text-muted-foreground">
      <a href="/login" className="underline">Sign in</a> to leave a comment.
    </p>
  );
}

async function UserTipSection({ locationId }: { locationId: string }) {
  const { isLoggedIn } = await UserPanel({ locationId });
  if (!isLoggedIn) return null;
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Share your tip</h3>
      <CommunityTipForm locationId={locationId} />
    </div>
  );
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocationById(id);

  if (!location) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{location.name}</h1>
          <Suspense fallback={<div className="h-8 w-20 rounded-md bg-muted animate-pulse" />}>
            <UserSaveButton locationId={id} />
          </Suspense>
        </div>
        {location.address && (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {location.address}
          </p>
        )}
        <HashtagBadges hashtags={location.hashtags} />
        <Suspense fallback={<div className="h-6 w-48 rounded bg-muted animate-pulse" />}>
          <UserStarRating
            locationId={id}
            initialRating={location.avg_rating}
            ratingCount={location.rating_count}
          />
        </Suspense>
      </div>

      {/* Photos */}
      {location.photos.length > 0 && (
        <PhotoGallery photos={location.photos} locationName={location.name} />
      )}

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">About this location</h2>
        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{location.description}</p>
      </div>

      {/* Notes grid */}
      {(location.parking_notes || location.parking_score || location.permit_notes || location.accessibility || location.accessibility_score) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(location.parking_notes || location.parking_score) && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <ParkingCircle className="h-4 w-4 text-primary" /> Parking
              </div>
              {location.parking_score != null && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= location.parking_score! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">{location.parking_score}/5</span>
                </div>
              )}
              {location.parking_notes && (
                <p className="text-sm text-muted-foreground">{location.parking_notes}</p>
              )}
            </div>
          )}
          {location.permit_notes && (
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2 font-medium text-sm">
                <FileText className="h-4 w-4 text-primary" /> Permits
              </div>
              <p className="text-sm text-muted-foreground">{location.permit_notes}</p>
            </div>
          )}
          {(location.accessibility || location.accessibility_score) && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Accessibility className="h-4 w-4 text-primary" /> Accessibility
              </div>
              {location.accessibility_score != null && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= location.accessibility_score! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">{location.accessibility_score}/5</span>
                </div>
              )}
              {location.accessibility && (
                <p className="text-sm text-muted-foreground">{location.accessibility}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Community Tips */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Community Tips</h2>
        {location.tips.length > 0 ? (
          <div className="space-y-3">
            {location.tips.map((tip) => (
              <CommunityTipCard key={tip.id} tip={{ ...tip, profile: tip.profiles }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tips yet.</p>
        )}
        <Suspense fallback={null}>
          <UserTipSection locationId={id} />
        </Suspense>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <CommentList comments={location.comments.map((c) => ({ ...c, profile: c.profiles }))} />
        <Suspense fallback={null}>
          <UserCommentSection locationId={id} />
        </Suspense>
      </div>

      {/* Submitted by */}
      <div className="flex items-center gap-3 pt-4 border-t text-sm text-muted-foreground">
        <Avatar className="h-7 w-7">
          <AvatarImage src={location.submitted_by?.avatar_url ?? undefined} />
          <AvatarFallback>{location.submitted_by?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <span>
          Added by <strong>{location.submitted_by?.username}</strong> on {formatDate(location.created_at)}
        </span>
      </div>
    </div>
  );
}
