-- ============================================================
-- SceneScout — Seed Data
-- Run in Supabase SQL Editor: https://app.supabase.com → SQL Editor
-- ============================================================

-- Fake users (inserted directly into auth.users so FK constraints are satisfied)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'scout_jay@fake.scenescout', crypt('password123', gen_salt('bf')), now(), '{"username":"scout_jay"}', now(), now()),
  ('a1000000-0000-0000-0000-000000000002', 'lens_maya@fake.scenescout', crypt('password123', gen_salt('bf')), now(), '{"username":"lens_maya"}', now(), now()),
  ('a1000000-0000-0000-0000-000000000003', 'frame_rico@fake.scenescout', crypt('password123', gen_salt('bf')), now(), '{"username":"frame_rico"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Profiles
INSERT INTO public.profiles (id, username, avatar_url, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'scout_jay',  'https://i.pravatar.cc/150?u=scout_jay',  now()),
  ('a1000000-0000-0000-0000-000000000002', 'lens_maya',  'https://i.pravatar.cc/150?u=lens_maya',  now()),
  ('a1000000-0000-0000-0000-000000000003', 'frame_rico', 'https://i.pravatar.cc/150?u=frame_rico', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LOCATIONS (LA area)
-- ============================================================
INSERT INTO public.locations (id, user_id, name, description, lat, lng, address, parking_notes, parking_score, permit_notes, accessibility, accessibility_score, avg_rating, rating_count, save_count, created_at)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Griffith Observatory Terrace',
    'Iconic hilltop observatory with sweeping views of the LA basin and Hollywood sign. The white art deco facade is instantly recognizable. Best shot at golden hour when the city lights begin to sparkle below. Minimal foot traffic on weekday mornings.',
    34.1184, -118.3004,
    '2800 E Observatory Rd, Los Angeles, CA 90027',
    'Free parking lot on site, fills up fast on weekends. Street parking on Vista Del Valle Dr as overflow.',
    4,
    'No permit required for small crews under 6. Larger productions must contact the city parks department.',
    'Paved paths throughout, fully wheelchair accessible. Elevator inside the building.',
    5,
    4.8, 12, 34,
    now() - interval '45 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Venice Beach Skate Plaza',
    'Legendary concrete skate park right on the Venice boardwalk. Graffiti murals, palm trees, and ocean backdrop make every frame pop. The energy here is electric — skaters, muscle beach regulars, and tourists all create a vibrant backdrop. Works great for action, drama, or documentary.',
    33.9850, -118.4732,
    'Venice Beach Skate Park, Venice, CA 90291',
    'Paid lots on Pacific Ave, roughly $15–25/day. Metered street spots along Ocean Front Walk fill by 9am on weekends.',
    2,
    'Public space — no permit needed for non-commercial shoots. Contact LA County for paid productions.',
    'Flat boardwalk is fully accessible. Skate bowl itself is not wheelchair accessible.',
    4,
    4.5, 8, 21,
    now() - interval '30 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Arts District Warehouse Row',
    'A stretch of converted industrial warehouses in Downtown LA''s Arts District. Raw exposed brick, loading docks, steel doors, and sprawling murals. Perfect for gritty urban scenes, music videos, or sci-fi backdrops. The neighborhood has great natural diffusion from the wide streets.',
    34.0407, -118.2332,
    'E 4th St & Hewitt St, Los Angeles, CA 90013',
    'Street parking is mostly unrestricted on weekends. Several paid lots within a 3-minute walk off Traction Ave.',
    3,
    'Most walls are on private property — always get written permission from the building owner before shooting.',
    'Flat sidewalks throughout. Some loading dock areas have uneven surfaces.',
    3,
    4.2, 6, 15,
    now() - interval '20 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000001',
    'Malibu Creek Canyon Trail',
    'Used in M*A*S*H, Planet of the Apes, and countless other productions. Rocky stream crossings, volcanic rock formations, and dense chaparral. The canyon walls act as natural sound dampening. Extremely versatile — it can pass for Korea, a post-apocalyptic wasteland, or a fantasy realm.',
    34.0984, -118.7321,
    'Malibu Creek State Park, Calabasas, CA 91302',
    'Day-use parking lot at the trailhead, $12 fee. Fills completely by 8am on summer weekends — arrive early or park on Las Virgenes Rd.',
    2,
    'State park permit required for any commercial filming. Apply via California State Parks at least 2 weeks out.',
    'Main fire road is accessible. Trail sections to the rock pool are rugged and not wheelchair friendly.',
    2,
    4.9, 18, 52,
    now() - interval '60 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    'The Last Bookstore',
    'LA''s largest independent bookstore with a surreal interior — book tunnels, spiral staircases made of stacked novels, and high arched ceilings. The second floor labyrinth of books creates incredible depth of field opportunities. The contrast between warm amber light and dark shelves is naturally cinematic.',
    34.0487, -118.2515,
    '453 S Spring St, Los Angeles, CA 90013',
    'Paid structure parking at 5th & Spring parking garage, ~$10 flat rate on weekends.',
    3,
    'Requires owner approval and a location fee. Contact management directly — they''re generally film-friendly.',
    'Ground floor fully accessible. Second floor accessible via elevator near the back.',
    4,
    4.7, 9, 27,
    now() - interval '15 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000003',
    'Elysian Park Hilltop Overlook',
    'A hidden flat clearing near the top of Elysian Park with a direct sightline to the Downtown LA skyline. Almost no one knows about it. Zero crowds at sunrise. The slight elevation and treeline framing make the skyline look massive. Great for establishing shots or romantic scenes.',
    34.0787, -118.2421,
    'Elysian Park Dr, Los Angeles, CA 90012',
    'Free street parking on Elysian Park Dr. Rarely crowded — almost always a spot available.',
    5,
    'City park — no permit required for non-commercial. City Film Office permit for commercial shoots.',
    'Uphill walk from parking (~10 min). The clearing itself is flat but the path has moderate incline.',
    3,
    4.6, 5, 18,
    now() - interval '7 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000001',
    'Santa Monica Pier at Dusk',
    'The Pacific Park Ferris wheel and neon signs at dusk create a dreamy, nostalgic atmosphere. The wooden pier structure, crashing waves below, and carnival sounds make this location feel alive. Works beautifully for wide establishing shots as well as tight character moments against the lit Ferris wheel.',
    34.0083, -118.4973,
    'Santa Monica Pier, Santa Monica, CA 90401',
    'Several paid structures within 2 blocks. Ocean Ave parking structure is closest, about $3/hr.',
    3,
    'Santa Monica Pier Authority permit required for any filming. Processing takes 5–10 business days.',
    'Fully accessible. Wide flat pier with ramp access from the beach.',
    5,
    4.4, 11, 39,
    now() - interval '25 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000002',
    'LA River Concrete Channel',
    'The infamous concrete-lined LA River — seen in Grease, Terminator 2, and Drive. Brutalist and vast, it creates an instantly iconic sci-fi or action backdrop. The channel is dry most of the year, exposing the raw textured concrete. Golden hour casts long dramatic shadows down the walls.',
    34.0511, -118.2096,
    'LA River near 6th St Bridge, Los Angeles, CA 90021',
    'Street parking on S Anderson St or the 6th St Viaduct area. Free and usually available.',
    4,
    'Army Corps of Engineers permit required — apply well in advance. LA City Film Office can help navigate this.',
    'The channel banks are accessible from streets. Inside the channel is not accessible.',
    2,
    4.3, 7, 20,
    now() - interval '40 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LOCATION PHOTOS (using Unsplash for placeholder images)
-- ============================================================
INSERT INTO public.location_photos (location_id, storage_path, url, display_order)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'seed/griffith_1.jpg', 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800', 0),
  ('b1000000-0000-0000-0000-000000000001', 'seed/griffith_2.jpg', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800', 1),
  ('b1000000-0000-0000-0000-000000000002', 'seed/venice_1.jpg',   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 0),
  ('b1000000-0000-0000-0000-000000000002', 'seed/venice_2.jpg',   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 1),
  ('b1000000-0000-0000-0000-000000000003', 'seed/arts_1.jpg',     'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800', 0),
  ('b1000000-0000-0000-0000-000000000003', 'seed/arts_2.jpg',     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 1),
  ('b1000000-0000-0000-0000-000000000004', 'seed/malibu_1.jpg',   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 0),
  ('b1000000-0000-0000-0000-000000000004', 'seed/malibu_2.jpg',   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', 1),
  ('b1000000-0000-0000-0000-000000000005', 'seed/bookstore_1.jpg','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 0),
  ('b1000000-0000-0000-0000-000000000005', 'seed/bookstore_2.jpg','https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', 1),
  ('b1000000-0000-0000-0000-000000000006', 'seed/elysian_1.jpg',  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', 0),
  ('b1000000-0000-0000-0000-000000000007', 'seed/pier_1.jpg',     'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', 0),
  ('b1000000-0000-0000-0000-000000000007', 'seed/pier_2.jpg',     'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800', 1),
  ('b1000000-0000-0000-0000-000000000008', 'seed/river_1.jpg',    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 0),
  ('b1000000-0000-0000-0000-000000000008', 'seed/river_2.jpg',    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LOCATION HASHTAGS
-- ============================================================
INSERT INTO public.location_hashtags (location_id, hashtag_id)
SELECT 'b1000000-0000-0000-0000-000000000001'::uuid, id FROM public.hashtags WHERE name IN ('urban','goldenHour','hiddenGem','permitFree')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000002'::uuid, id FROM public.hashtags WHERE name IN ('urban','action','beach','studentFriendly')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000003'::uuid, id FROM public.hashtags WHERE name IN ('urban','industrial','scifi','nightShoot')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000004'::uuid, id FROM public.hashtags WHERE name IN ('nature','mountains','fantasy','horror')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000005'::uuid, id FROM public.hashtags WHERE name IN ('indoors','romance','hiddenGem','quiet')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000006'::uuid, id FROM public.hashtags WHERE name IN ('urban','goldenHour','hiddenGem','freeParking','permitFree')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000007'::uuid, id FROM public.hashtags WHERE name IN ('beach','romance','goldenHour','nightShoot')
UNION ALL
SELECT 'b1000000-0000-0000-0000-000000000008'::uuid, id FROM public.hashtags WHERE name IN ('urban','industrial','action','scifi','nightShoot')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RATINGS (so avg_rating triggers fire and populate correctly)
-- ============================================================
INSERT INTO public.ratings (location_id, user_id, value)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 5),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 5),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 4),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 5),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 4),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 4),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 5),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 5),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 5),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 4),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 5),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 4),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 4),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 5),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 4),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMMUNITY TIPS
-- ============================================================
INSERT INTO public.community_tips (location_id, user_id, filming_time, noise_level, crowd_level, permit_req, hidden_gem)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Sunrise or 1 hour before sunset', 'quiet', 'low', 'none', false),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Early morning weekdays', 'loud', 'moderate', 'none', false),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Any time — best at night', 'moderate', 'low', 'required', false),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Weekday mornings', 'very_quiet', 'empty', 'required', false),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Weekday afternoons (quieter)', 'quiet', 'low', 'required', true),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Sunrise — you''ll have it to yourself', 'very_quiet', 'empty', 'none', true),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', '30 min before sunset', 'moderate', 'busy', 'required', false),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Golden hour or blue hour', 'quiet', 'empty', 'required', false)
ON CONFLICT DO NOTHING;
