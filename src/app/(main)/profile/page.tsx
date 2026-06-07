import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getLocations } from "@/lib/queries/locations";
import { getSavedLocations } from "@/lib/queries/user";
import { LocationGrid } from "@/components/location/LocationGrid";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, MapPin, Globe, Mail } from "lucide-react";
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import type { Database } from "@/types/database";
import type { UpdateProfileInput } from "@/types/forms";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const metadata = { title: "My Profile" };

async function ProfileContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as Profile | null;

  const [allLocations, savedLocations] = await Promise.all([
    getLocations({ page: 1, limit: 50 }),
    getSavedLocations(user.id),
  ]);

  const myLocations = allLocations.filter((l) => l.user_id === user.id);

  const initialValues: UpdateProfileInput = {
    username: profile?.username ?? "",
    bio: profile?.bio ?? "",
    show_email: profile?.show_email ?? false,
    instagram: profile?.instagram ?? "",
    youtube: profile?.youtube ?? "",
    linkedin: profile?.linkedin ?? "",
    website: profile?.website ?? "",
  };

  const hasSocialLinks =
    (profile?.show_email) ||
    profile?.instagram ||
    profile?.youtube ||
    profile?.linkedin ||
    profile?.website;

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl">
              {(profile?.username ?? user.email ?? "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold">{profile?.username ?? "My Profile"}</h1>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Social links */}
        {hasSocialLinks && (
          <div className="flex flex-wrap gap-3">
            {profile?.show_email && (
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {user.email}
              </a>
            )}
            {profile?.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <InstagramIcon />
                @{profile.instagram}
              </a>
            )}
            {profile?.youtube && (
              <a
                href={`https://youtube.com/@${profile.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <YoutubeIcon />
                @{profile.youtube}
              </a>
            )}
            {profile?.linkedin && (
              <a
                href={`https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkedinIcon />
                {profile.linkedin}
              </a>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}

        <ProfileEditForm initialValues={initialValues} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved ({savedLocations.length})
          </TabsTrigger>
          <TabsTrigger value="submitted" className="gap-2">
            <MapPin className="h-4 w-4" />
            My Locations ({myLocations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          <LocationGrid
            locations={savedLocations}
            emptyMessage="You haven't saved any locations yet. Browse the map to find great spots!"
          />
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          <LocationGrid
            locations={myLocations}
            emptyMessage="You haven't added any locations yet. Share your first filming spot!"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-xl" />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
