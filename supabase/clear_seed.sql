-- ============================================================
-- SceneScout — Clear Seed Data
-- Run in Supabase SQL Editor to wipe the original fake data.
-- Targets only the known seed IDs — real user data is untouched.
-- ============================================================

DO $$
DECLARE
  seed_user_ids uuid[] := ARRAY[
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  ];
  seed_location_ids uuid[] := ARRAY[
    'b1000000-0000-0000-0000-000000000001'::uuid,
    'b1000000-0000-0000-0000-000000000002'::uuid,
    'b1000000-0000-0000-0000-000000000003'::uuid,
    'b1000000-0000-0000-0000-000000000004'::uuid,
    'b1000000-0000-0000-0000-000000000005'::uuid,
    'b1000000-0000-0000-0000-000000000006'::uuid,
    'b1000000-0000-0000-0000-000000000007'::uuid,
    'b1000000-0000-0000-0000-000000000008'::uuid
  ];
BEGIN
  DELETE FROM public.community_tips   WHERE location_id = ANY(seed_location_ids) OR user_id = ANY(seed_user_ids);
  DELETE FROM public.ratings          WHERE location_id = ANY(seed_location_ids) OR user_id = ANY(seed_user_ids);
  DELETE FROM public.comments         WHERE location_id = ANY(seed_location_ids) OR user_id = ANY(seed_user_ids);
  DELETE FROM public.saved_locations  WHERE location_id = ANY(seed_location_ids) OR user_id = ANY(seed_user_ids);
  DELETE FROM public.location_hashtags WHERE location_id = ANY(seed_location_ids);
  DELETE FROM public.location_photos   WHERE location_id = ANY(seed_location_ids);
  DELETE FROM public.locations         WHERE id = ANY(seed_location_ids);
  DELETE FROM public.profiles          WHERE id = ANY(seed_user_ids);
  DELETE FROM auth.users               WHERE id = ANY(seed_user_ids);

  RAISE NOTICE 'Seed data cleared: % locations, % users removed.',
    array_length(seed_location_ids, 1),
    array_length(seed_user_ids, 1);
END $$;
