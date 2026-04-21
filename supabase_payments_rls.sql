alter table public.payments enable row level security;
alter table public.payouts enable row level security;

drop policy if exists "payments_select_own" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;
drop policy if exists "payouts_select_own" on public.payouts;

create policy "payments_select_own" on public.payments
for select
to authenticated
using (user_id = auth.uid()::text);

create policy "payments_insert_own" on public.payments
for insert
to authenticated
with check (user_id = auth.uid()::text);

create policy "payouts_select_own" on public.payouts
for select
to authenticated
using (provider_id = auth.uid()::text);
