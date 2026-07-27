-- Bookings table for the /book consulting funnel (v2 — scheduled sessions).
-- Idempotent: safe to run whether or not the v1 table already exists.
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  whatsapp text not null,
  role text not null,
  need text not null,
  source text, -- content pillar / platform attribution from ?src= on /book
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- v2: Calendly-style scheduling + vetting + post-session resources
alter table public.bookings add column if not exists social text;
alter table public.bookings add column if not exists slot_start timestamptz;
alter table public.bookings add column if not exists slot_end timestamptz;
alter table public.bookings add column if not exists visitor_tz text;
alter table public.bookings add column if not exists wants_resources boolean not null default false;
alter table public.bookings add column if not exists resources_sent_at timestamptz;
alter table public.bookings add column if not exists calendar_event_id text;
alter table public.bookings add column if not exists meet_link text;

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

-- One active claim per slot — blocks double-booking at the database level.
create unique index if not exists bookings_active_slot_idx
  on public.bookings (slot_start)
  where status in ('pending', 'approved') and slot_start is not null;

alter table public.bookings enable row level security;
-- No public policies — all reads/writes go through server routes using service_role.
