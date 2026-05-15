create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  nickname text not null,
  avatar_seed text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages add column if not exists avatar_seed text;

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  reaction text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notify_leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  event_id text,
  source text default 'schedule',
  created_at timestamptz not null default now()
);

create table if not exists public.event_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_room_created_idx on public.messages (room_id, created_at desc);
create index if not exists reactions_created_idx on public.reactions (created_at desc);
create index if not exists notify_leads_created_idx on public.notify_leads (created_at desc);
create index if not exists announcements_event_created_idx on public.announcements (event_id, created_at desc);

alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.notify_leads enable row level security;
alter table public.event_state enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "anon can read messages" on public.messages;
create policy "anon can read messages"
on public.messages for select
to anon
using (true);

drop policy if exists "anon can insert messages" on public.messages;
create policy "anon can insert messages"
on public.messages for insert
to anon
with check (
  length(trim(room_id)) > 0
  and length(trim(user_id)) > 0
  and length(trim(nickname)) between 1 and 40
  and (avatar_seed is null or length(trim(avatar_seed)) between 1 and 80)
  and length(trim(body)) between 1 and 500
);

drop policy if exists "anon can read reactions" on public.reactions;
create policy "anon can read reactions"
on public.reactions for select
to anon
using (true);

drop policy if exists "anon can insert reactions" on public.reactions;
create policy "anon can insert reactions"
on public.reactions for insert
to anon
with check (
  length(trim(room_id)) > 0
  and length(trim(user_id)) > 0
  and reaction in ('pulse', 'spark', 'charge', 'heart')
);

drop policy if exists "anon can insert notify leads" on public.notify_leads;
create policy "anon can insert notify leads"
on public.notify_leads for insert
to anon
with check (length(trim(contact)) between 3 and 160);

drop policy if exists "anon can read notify leads for host export" on public.notify_leads;
create policy "anon can read notify leads for host export"
on public.notify_leads for select
to anon
using (true);

drop policy if exists "anon can read event state" on public.event_state;
create policy "anon can read event state"
on public.event_state for select
to anon
using (true);

drop policy if exists "anon can upsert event state for closed test" on public.event_state;
create policy "anon can upsert event state for closed test"
on public.event_state for insert
to anon
with check (length(trim(id)) > 0);

drop policy if exists "anon can update event state for closed test" on public.event_state;
create policy "anon can update event state for closed test"
on public.event_state for update
to anon
using (true)
with check (length(trim(id)) > 0);

drop policy if exists "anon can read announcements" on public.announcements;
create policy "anon can read announcements"
on public.announcements for select
to anon
using (true);

drop policy if exists "anon can insert announcements for closed test" on public.announcements;
create policy "anon can insert announcements for closed test"
on public.announcements for insert
to anon
with check (
  length(trim(event_id)) > 0
  and length(trim(body)) between 1 and 280
);

-- After running this file, enable Realtime for public.messages, public.reactions,
-- public.event_state, and public.announcements
-- in Supabase Dashboard > Database > Replication if they are not already enabled.
