// Manual type definitions matching the Supabase schema.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          bio: string | null;
          show_email: boolean;
          instagram: string | null;
          youtube: string | null;
          linkedin: string | null;
          website: string | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          bio?: string | null;
          show_email?: boolean;
          instagram?: string | null;
          youtube?: string | null;
          linkedin?: string | null;
          website?: string | null;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          show_email?: boolean;
          instagram?: string | null;
          youtube?: string | null;
          linkedin?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          description: string;
          lat: number;
          lng: number;
          address: string | null;
          parking_notes: string | null;
          parking_score: number | null;
          permit_notes: string | null;
          accessibility: string | null;
          accessibility_score: number | null;
          avg_rating: number;
          rating_count: number;
          save_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          lat: number;
          lng: number;
          address?: string | null;
          parking_notes?: string | null;
          parking_score?: number | null;
          permit_notes?: string | null;
          accessibility?: string | null;
          accessibility_score?: number | null;
          created_at?: string;
          updated_at?: string;
          avg_rating?: number;
          rating_count?: number;
          save_count?: number;
        };
        Update: {
          name?: string;
          description?: string;
          lat?: number;
          lng?: number;
          address?: string | null;
          parking_notes?: string | null;
          parking_score?: number | null;
          permit_notes?: string | null;
          accessibility?: string | null;
          accessibility_score?: number | null;
          avg_rating?: number;
          rating_count?: number;
          save_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      location_photos: {
        Row: {
          id: string;
          location_id: string;
          storage_path: string;
          url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          storage_path: string;
          url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          display_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "location_photos_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      hashtags: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      location_hashtags: {
        Row: {
          location_id: string;
          hashtag_id: number;
        };
        Insert: {
          location_id: string;
          hashtag_id: number;
        };
        Update: {
          location_id?: string;
          hashtag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "location_hashtags_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "location_hashtags_hashtag_id_fkey";
            columns: ["hashtag_id"];
            isOneToOne: false;
            referencedRelation: "hashtags";
            referencedColumns: ["id"];
          }
        ];
      };
      community_tips: {
        Row: {
          id: string;
          location_id: string;
          user_id: string;
          filming_time: string | null;
          noise_level: "very_quiet" | "quiet" | "moderate" | "loud" | "very_loud" | null;
          crowd_level: "empty" | "low" | "moderate" | "busy" | "crowded" | null;
          permit_req: "none" | "unsure" | "required" | "obtained" | null;
          hidden_gem: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          user_id: string;
          filming_time?: string | null;
          noise_level?: "very_quiet" | "quiet" | "moderate" | "loud" | "very_loud" | null;
          crowd_level?: "empty" | "low" | "moderate" | "busy" | "crowded" | null;
          permit_req?: "none" | "unsure" | "required" | "obtained" | null;
          hidden_gem?: boolean;
          created_at?: string;
        };
        Update: {
          filming_time?: string | null;
          noise_level?: "very_quiet" | "quiet" | "moderate" | "loud" | "very_loud" | null;
          crowd_level?: "empty" | "low" | "moderate" | "busy" | "crowded" | null;
          permit_req?: "none" | "unsure" | "required" | "obtained" | null;
          hidden_gem?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "community_tips_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_tips_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          location_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ratings: {
        Row: {
          id: string;
          location_id: string;
          user_id: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        };
        Update: {
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_locations: {
        Row: {
          user_id: string;
          location_id: string;
          saved_at: string;
        };
        Insert: {
          user_id: string;
          location_id: string;
          saved_at?: string;
        };
        Update: {
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_locations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]?: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [_ in never]?: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]?: string | string[];
    };
    CompositeTypes: {
      [_ in never]?: Record<string, unknown>;
    };
  };
}
