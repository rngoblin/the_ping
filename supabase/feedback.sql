-- PING feedback table for closed tests.
-- Run this in Supabase SQL Editor before using the in-app feedback form.

create extension if not exists pgcrypto;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  username text,
  room_id text,
  message text not null,
  user_session_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "anon can insert feedback" on public.feedback;
create policy "anon can insert feedback"
on public.feedback for insert
to anon
with check (length(trim(message)) between 1 and 8000);

drop policy if exists "anon can read feedback for host export" on public.feedback;
create policy "anon can read feedback for host export"
on public.feedback for select
to anon
using (true);
