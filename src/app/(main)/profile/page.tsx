import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getLocations } from "@/lib/queries/locations";
import { getSavedLocations } from "@/lib/queries/user";
import { LocationGrid } from "@/components/location/LocationGrid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, MapPin } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const metadata = { title: "My Profile" };

// All user-specific data is isolated in this component, wrapped in <Suspense>
async function ProfileContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // proxy.ts already redirected unauthenticated users

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

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">
            {(profile?.username ?? user.email ?? "?")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username ?? "My Profile"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

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
