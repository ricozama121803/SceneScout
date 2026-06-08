export interface RentalListing {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  price_per_hour: number | null;
  price_per_day: number | null;
  amenities: string | null;
  rules: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalListingSummary extends RentalListing {
  cover_photo_url: string | null;
  owner: { username: string; avatar_url: string | null };
}

export interface RentalListingWithDetails extends RentalListing {
  photos: { storage_path: string; url: string; display_order: number }[];
  owner: { id: string; username: string; avatar_url: string | null };
}

export interface RentalPin {
  id: string;
  owner_id: string;
  lat: number;
  lng: number;
  name: string;
  cover_photo_url: string | null;
  price_per_hour: number | null;
  price_per_day: number | null;
}
