create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  nickname text not null,
  body text not null,
  created_at timestamptz not null default now()
);

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

create index if not exists messages_room_created_idx on public.messages (room_id, created_at desc);
create index if not exists reactions_created_idx on public.reactions (created_at desc);
create index if not exists notify_leads_created_idx on public.notify_leads (created_at desc);

alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.notify_leads enable row level security;

drop policy if exists "anon can read messages" on public.messages;
drop policy if exists "anon can insert messages" on public.messages;
drop policy if exists "anon can read reactions" on public.reactions;
drop policy if exists "anon can insert reactions" on public.reactions;
drop policy if exists "anon can insert notify leads" on public.notify_leads;
drop policy if exists "anon can read notify leads for host export" on public.notify_leads;

create policy "anon can read messages"
on public.messages for select
to anon
using (true);

create policy "anon can insert messages"
on public.messages for insert
to anon
with check (
  length(trim(room_id)) > 0
  and length(trim(user_id)) > 0
  and length(trim(nickname)) between 1 and 40
  and length(trim(body)) between 1 and 500
);

create policy "anon can read reactions"
on public.reactions for select
to anon
using (true);

create policy "anon can insert reactions"
on public.reactions for insert
to anon
with check (
  length(trim(room_id)) > 0
  and length(trim(user_id)) > 0
  and reaction in ('pulse', 'spark', 'charge', 'heart')
);

create policy "anon can insert notify leads"
on public.notify_leads for insert
to anon
with check (length(trim(contact)) between 3 and 160);

create policy "anon can read notify leads for host export"
on public.notify_leads for select
to anon
using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reactions'
  ) then
    alter publication supabase_realtime add table public.reactions;
  end if;
end $$;
