-- Bookings table for the /book consulting funnel.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

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

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;
-- No public policies — all reads/writes go through server routes using service_role.
