# HireLanka

HireLanka is a freelancing marketplace built with React + Supabase.

## Tech Stack

- **Frontend**: React (Create React App), TypeScript
- **Backend**: Node/Express API (`/server`)
- **Database/Auth/Storage/Realtimes**: Supabase

## Prerequisites

- Node.js + npm
- A Supabase project (URL + anon key)

## Environment Variables

### Frontend (`hire-lanka/.env`)

Create `hire-lanka/.env`:

```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:4000
```

### Backend (`hire-lanka/server/.env`)

Create `hire-lanka/server/.env`:

```bash
PORT=4000

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

ADMIN_EMAIL=admin@hirelanka.com
ADMIN_PASSWORD=12345678
ADMIN_TOKEN_SECRET=replace_with_a_long_random_secret
```

## Supabase Setup

### Storage

- Create a bucket named `media`
- Recommended: set bucket to **Public** (simplifies image display)

Paths used by the app:

- `media/portfolio/*` (freelancer portfolio images)
- `media/gigs/*` (gig cover images)

### Tables / Columns

The app expects:

- `gigs.cover_image_url` (text)
- `portfolio_items` table:

```sql
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  image_url text not null,
  created_at timestamptz not null default now()
);
```

### RLS Policies (portfolio)

```sql
alter table public.portfolio_items enable row level security;

drop policy if exists "portfolio_select_all" on public.portfolio_items;
create policy "portfolio_select_all"
on public.portfolio_items
for select
to authenticated
using (true);

drop policy if exists "portfolio_insert_own" on public.portfolio_items;
create policy "portfolio_insert_own"
on public.portfolio_items
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "portfolio_delete_own" on public.portfolio_items;
create policy "portfolio_delete_own"
on public.portfolio_items
for delete
to authenticated
using (owner_id = auth.uid());
```

## Running Locally

### 1) Start the backend API

From `hire-lanka/server`:

```bash
npm install
npm start
```

API runs on:

- `http://localhost:4000`

### 2) Start the frontend

From `hire-lanka`:

```bash
npm install
npm start
```

App runs on:

- `http://localhost:3000`

## Key Routes / Features

- **Gig marketplace**: `/marketplace`
  - Displays gigs and `cover_image_url` when present
- **Find Talent (freelancers)**: `/talent`
  - Lists freelancers based on uploaded portfolio items and shows thumbnails
- **Freelancer profile**: `/freelancer/:handle`
  - Displays portfolio gallery pulled from `portfolio_items`
- **Messages**: `/messages`
  - Supports opening a direct thread via `?partnerId=<uuid>`
- **Seller dashboard**: `/dashboard` (freelancer role)
  - Upload multiple portfolio images
- **Create gig**: `/gigs/new`
  - Upload a gig cover image (stored in Supabase Storage, URL saved to `gigs.cover_image_url`)
- **Admin login**: `/admin/login`
  - Token-based auth (uses backend `/api/admin/login`)

## Tests

```bash
npm test
```

## Production Build

```bash
npm run build
```

Backend

cd C:\Users\user\Desktop\HireLanka\hire-lanka\server
node index.js