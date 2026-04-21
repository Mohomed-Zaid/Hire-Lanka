create extension if not exists "pgcrypto";

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider_id text not null,
  service_type text,
  file_path text not null,
  total_amount numeric not null,
  platform_fee numeric not null,
  net_amount numeric not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  provider_id text not null,
  amount_to_pay numeric not null,
  status text not null check (status in ('pending', 'paid')),
  paid_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_status_created_at on public.payments(status, created_at desc);
create index if not exists idx_payouts_status_created_at on public.payouts(status, created_at desc);
