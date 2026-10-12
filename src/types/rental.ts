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

export type BookingStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";

export interface RentalBooking {
  id: string;
  listing_id: string;
  renter_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  platform_fee: number;
  message: string | null;
  status: BookingStatus;
  stripe_payment_intent_id: string | null;
  payout_status: "pending" | "paid";
  stripe_transfer_id: string | null;
  created_at: string;
  updated_at: string;
}
