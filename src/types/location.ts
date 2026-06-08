import type { Database } from "./database";

export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type LocationPhoto = Database["public"]["Tables"]["location_photos"]["Row"];
export type Hashtag = Database["public"]["Tables"]["hashtags"]["Row"];
export type CommunityTip = Database["public"]["Tables"]["community_tips"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface LocationSummary extends Location {
  cover_photo_url: string | null;
  hashtags: Hashtag[];
  is_saved?: boolean;
}

export interface LocationWithDetails extends LocationSummary {
  photos: LocationPhoto[];
  tips: (CommunityTip & { profiles: Profile })[];
  comments: (Comment & { profiles: Profile })[];
  user_rating?: number | null;
  submitted_by: Profile;
}

export interface DraftSummary extends Location {
  cover_photo_url: string | null;
}

// Minimal shape used for map pins (keep the GeoJSON payload small)
export interface LocationPin {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  name: string;
  avg_rating: number;
  cover_photo_url: string | null;
}
