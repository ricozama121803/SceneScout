-- CineMap — Supabase Schema
-- Run this in the Supabase SQL Editor: https://app.supabase.com → SQL Editor

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles: public read"  on public.profiles for select using (true);
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LOCATIONS
-- ============================================================
create table public.locations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  description     text not null,
  lat             double precision not null,
  lng             double precision not null,
  address         text,
  parking_notes   text,
  permit_notes    text,
  accessibility   text,
  avg_rating      numeric(3,2) default 0,
  rating_count    int default 0,
  save_count      int default 0
);
alter table public.locations enable row level security;
create policy "locations: public read"   on public.locations for select using (true);
create policy "locations: auth insert"   on public.locations for insert with check (auth.uid() = user_id);
create policy "locations: owner update"  on public.locations for update using (auth.uid() = user_id);
create policy "locations: owner delete"  on public.locations for delete using (auth.uid() = user_id);

-- Full-text search index
create index on public.locations using gin (
  to_tsvector('english', name || ' ' || description || ' ' || coalesce(address,''))
);

-- ============================================================
-- LOCATION PHOTOS
-- ============================================================
create table public.location_photos (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references public.locations(id) on delete cascade,
  storage_path  text not null,
  url           text not null,
  display_order int default 0,
  created_at    timestamptz default now()
);
alter table public.location_photos enable row level security;
create policy "photos: public read" on public.location_photos for select using (true);
create policy "photos: owner insert" on public.location_photos for insert
  with check (auth.uid() = (select user_id from public.locations where id = location_id));

-- ============================================================
-- HASHTAGS (pre-seeded)
-- ============================================================
create table public.hashtags (
  id    serial primary key,
  name  text unique not null
);
alter table public.hashtags enable row level security;
create policy "hashtags: public read" on public.hashtags for select using (true);
create policy "hashtags: auth insert" on public.hashtags for insert to authenticated with check (true);

insert into public.hashtags (name) values
  ('nature'),('desert'),('forest'),('beach'),('urban'),
  ('industrial'),('mountains'),('horror'),('fantasy'),('scifi'),
  ('romance'),('action'),('studentFriendly'),('quiet'),
  ('freeParking'),('hiddenGem'),('nightShoot'),('goldenHour'),
  ('permitFree'),('indoors');

-- ============================================================
-- LOCATION HASHTAGS
-- ============================================================
create table public.location_hashtags (
  location_id  uuid references public.locations(id) on delete cascade,
  hashtag_id   int  references public.hashtags(id)  on delete cascade,
  primary key (location_id, hashtag_id)
);
alter table public.location_hashtags enable row level security;
create policy "lh: public read" on public.location_hashtags for select using (true);
create policy "lh: owner insert" on public.location_hashtags for insert
  with check (auth.uid() = (select user_id from public.locations where id = location_id));

-- ============================================================
-- COMMUNITY TIPS
-- ============================================================
create table public.community_tips (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  filming_time text,
  noise_level  text check (noise_level in ('very_quiet','quiet','moderate','loud','very_loud')),
  crowd_level  text check (crowd_level in ('empty','low','moderate','busy','crowded')),
  permit_req   text check (permit_req in ('none','unsure','required','obtained')),
  hidden_gem   boolean default false,
  created_at   timestamptz default now()
);
alter table public.community_tips enable row level security;
create policy "tips: public read"  on public.community_tips for select using (true);
create policy "tips: auth insert"  on public.community_tips for insert with check (auth.uid() = user_id);
create policy "tips: owner update" on public.community_tips for update using (auth.uid() = user_id);
create unique index on public.community_tips(location_id, user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);
alter table public.comments enable row level security;
create policy "comments: public read"   on public.comments for select using (true);
create policy "comments: auth insert"   on public.comments for insert with check (auth.uid() = user_id);
create policy "comments: owner delete"  on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- RATINGS
-- ============================================================
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  value       int not null check (value between 1 and 5),
  created_at  timestamptz default now(),
  unique (location_id, user_id)
);
alter table public.ratings enable row level security;
create policy "ratings: public read"   on public.ratings for select using (true);
create policy "ratings: auth insert"   on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings: owner update"  on public.ratings for update using (auth.uid() = user_id);

-- Trigger: keep locations.avg_rating + rating_count in sync
create or replace function sync_location_rating()
returns trigger language plpgsql as $$
declare loc_id uuid;
begin
  loc_id := coalesce(new.location_id, old.location_id);
  update public.locations set
    avg_rating   = coalesce((select round(avg(value)::numeric, 2) from public.ratings where location_id = loc_id), 0),
    rating_count = (select count(*) from public.ratings where location_id = loc_id)
  where id = loc_id;
  return coalesce(new, old);
end;
$$;
create trigger trg_sync_rating
  after insert or update or delete on public.ratings
  for each row execute procedure sync_location_rating();

-- ============================================================
-- SAVED LOCATIONS
-- ============================================================
create table public.saved_locations (
  user_id     uuid references public.profiles(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  saved_at    timestamptz default now(),
  primary key (user_id, location_id)
);
alter table public.saved_locations enable row level security;
create policy "saves: owner read"   on public.saved_locations for select using (auth.uid() = user_id);
create policy "saves: owner insert" on public.saved_locations for insert with check (auth.uid() = user_id);
create policy "saves: owner delete" on public.saved_locations for delete using (auth.uid() = user_id);

-- Trigger: keep locations.save_count in sync
create or replace function sync_save_count()
returns trigger language plpgsql as $$
declare loc_id uuid;
begin
  loc_id := coalesce(new.location_id, old.location_id);
  update public.locations set
    save_count = (select count(*) from public.saved_locations where location_id = loc_id)
  where id = loc_id;
  return coalesce(new, old);
end;
$$;
create trigger trg_sync_saves
  after insert or delete on public.saved_locations
  for each row execute procedure sync_save_count();

-- ============================================================
-- STORAGE (run in Supabase Dashboard → SQL editor)
-- ============================================================
-- 1. Create a PUBLIC bucket named: location-photos
--    Dashboard → Storage → New bucket → name: location-photos, Public: ON
-- 2. Set max file size: 5 MB
-- 3. Allowed MIME types: image/jpeg, image/png, image/webp
-- 4. Run these storage RLS policies:

create policy "location-photos public read"
  on storage.objects for select
  using (bucket_id = 'location-photos');

create policy "location-photos auth upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'location-photos');

create policy "location-photos owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'location-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- PARKING & ACCESSIBILITY SCORES (migration)
-- ============================================================
alter table public.locations
  add column if not exists parking_score       int check (parking_score between 0 and 5),
  add column if not exists accessibility_score int check (accessibility_score between 0 and 5);

-- ============================================================
-- PROFILE SOCIAL LINKS (migration)
-- ============================================================
alter table public.profiles
  add column if not exists bio          text,
  add column if not exists show_email   boolean default false,
  add column if not exists instagram    text,
  add column if not exists youtube      text,
  add column if not exists linkedin     text,
  add column if not exists website      text;
