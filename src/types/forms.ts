import { z } from "zod";

export const CreateLocationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  address: z.string().min(3, "Please enter an address").max(200),
  lat: z.number({ message: "Please pin a location on the map" }),
  lng: z.number({ message: "Please pin a location on the map" }),
  parking_notes: z.string().max(500).optional(),
  permit_notes: z.string().max(500).optional(),
  accessibility: z.string().max(500).optional(),
  hashtag_ids: z.array(z.number()).min(1, "Select at least one hashtag"),
  photo_paths: z.array(z.string()).min(1, "Upload at least one photo"),
});

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;

export const AddCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
});

export type AddCommentInput = z.infer<typeof AddCommentSchema>;

export const CommunityTipSchema = z.object({
  filming_time: z.string().max(100).optional(),
  noise_level: z.enum(["very_quiet", "quiet", "moderate", "loud", "very_loud"]).optional(),
  crowd_level: z.enum(["empty", "low", "moderate", "busy", "crowded"]).optional(),
  permit_req: z.enum(["none", "unsure", "required", "obtained"]).optional(),
  hidden_gem: z.boolean().optional(),
});

export type CommunityTipInput = z.infer<typeof CommunityTipSchema>;

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignUpSchema = SignInSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
