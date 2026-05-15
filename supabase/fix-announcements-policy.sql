-- PING host announcement RLS fix.
-- Run this in Supabase SQL Editor if the host panel shows "send failed"
-- for announcements while chat/reactions still work.

alter table public.announcements enable row level security;

drop policy if exists "anon can read announcements" on public.announcements;
create policy "anon can read announcements"
on public.announcements for select
to anon
using (true);

drop policy if exists "anon can insert announcements for closed test" on public.announcements;
drop policy if exists "anon can insert announcements" on public.announcements;
create policy "anon can insert announcements for closed test"
on public.announcements for insert
to anon
with check (
  event_id is not null
  and body is not null
  and length(trim(event_id)) > 0
  and length(trim(body)) between 1 and 280
);
