import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationGrid } from "@/components/location/LocationGrid";
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { getProfileByUsername } from "@/lib/queries/user";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — SceneScout` };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const hasSocialLinks =
    profile.instagram || profile.youtube || profile.linkedin || profile.website;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {profile.location_count} location{profile.location_count !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </div>

        {hasSocialLinks && (
          <div className="flex flex-wrap gap-4">
            {profile.instagram && (
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
            {profile.youtube && (
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
            {profile.linkedin && (
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
            {profile.website && (
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
      </div>

      {/* Submitted locations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Locations by {profile.username}
        </h2>
        <LocationGrid
          locations={profile.submitted_locations}
          emptyMessage={`${profile.username} hasn't submitted any locations yet.`}
        />
      </div>
    </div>
  );
}
