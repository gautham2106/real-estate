# Bluesquare CRM — Supabase Setup Guide

## Prerequisites

- A Supabase project at [supabase.com](https://supabase.com)
- Project URL and anon key from Project Settings → API

---

## Step 1 — Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Without these variables the app runs in **Demo Mode** (mock data, no database).

---

## Step 2 — Run Database Schema

In Supabase Dashboard → **SQL Editor**, run the files in this order:

### 2a. Core Schema

Copy and run `supabase/schema.sql`

This creates:
- All 10 tables: `brokers`, `books`, `properties`, `seller_leads`, `buyer_leads`, `site_visits`, `deals`, `documents`, `alerts`, `activity_log`
- Sequences for auto-IDs (`BLU-YYYY-NNN`, `BL-NNN`, `SL-NNN`, `BRK-NNN`, `DEAL-NNN`)
- `set_updated_at()` trigger on `properties` and `deals`
- `generate_land_code()` function for auto land codes
- `nextval(sequence_name)` RPC wrapper (callable from client)
- Indexes on all frequently queried columns
- Seed data: 5 demo brokers

### 2b. Row Level Security

Copy and run `supabase/rls.sql`

This sets up:
- `auth_role()` helper — reads `user_metadata.role` from JWT (`'admin'` or `'broker'`)
- `auth_broker_id()` helper — matches the auth user's email to a row in `brokers`
- RLS enabled on all 10 tables with policies:

| Table          | Admin | Broker |
|----------------|-------|--------|
| `brokers`      | ALL   | SELECT own row only |
| `books`        | ALL   | — |
| `properties`   | ALL   | SELECT all; UPDATE own assigned |
| `seller_leads` | ALL   | SELECT all; INSERT + UPDATE own |
| `buyer_leads`  | ALL   | SELECT all; INSERT + UPDATE own |
| `site_visits`  | ALL   | SELECT all; INSERT |
| `deals`        | ALL   | SELECT where buyer/seller/referral broker |
| `documents`    | ALL   | — |
| `alerts`       | ALL   | — |
| `activity_log` | ALL   | — |

### 2c. Storage Buckets

Copy and run `supabase/storage.sql`

This creates two buckets:

| Bucket | Public | Max Size | Use |
|--------|--------|----------|-----|
| `property-photos` | ✅ Yes | 5 MB | Property listing images (JPG/PNG/WebP/GIF) |
| `property-documents` | ❌ No | 10 MB | Legal docs, agreements, PDFs (requires signed URL) |

---

## Step 3 — Create Auth Users

### Admin User

In Dashboard → **Authentication** → Users → **Add user**:

| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@bluesquare.in`     |
| Password | `Admin@123` (change this) |

Then assign the admin role via SQL Editor:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@bluesquare.in';
```

### Broker Users

For each broker in the `brokers` table, create an Auth user and set their role:

```sql
-- 1. Create the user via Dashboard → Authentication → Users → Add user
-- 2. Then set their role:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "broker"}'::jsonb
WHERE email = 'arjun@bluesquare.in';  -- must match brokers.email exactly
```

**Important:** The broker's Auth email must exactly match their `email` column in the `brokers` table. This is how `auth_broker_id()` links the session to the broker row.

Optionally link their auth UUID back to the broker row (enables direct user ID lookups):

```sql
UPDATE brokers
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'arjun@bluesquare.in')
WHERE email = 'arjun@bluesquare.in';
```

---

## Step 4 — Verify Setup

Run these checks in SQL Editor:

```sql
-- Tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- RLS enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Both storage buckets created
SELECT id, name, public FROM storage.buckets ORDER BY id;

-- Seed brokers loaded
SELECT broker_id, name, tier_level FROM brokers ORDER BY broker_id;

-- Test auth_role() as admin (run while authenticated as admin):
SELECT auth_role();   -- should return 'admin'
SELECT auth_broker_id();  -- should return the admin's broker UUID if linked
```

---

## Step 5 — Optional: Enable Realtime

For live Kanban / pipeline updates, enable Realtime on key tables:

Dashboard → **Database** → **Replication** → enable `deals`, `buyer_leads`, `site_visits`.

---

## Database Schema Summary

| Table           | Key Fields |
|-----------------|------------|
| `brokers`       | `broker_id` (BRK-NNN), `name`, `tier_level`, `deals_closed`, `total_commission_earned`, `auth_user_id` |
| `books`         | `book_id`, `book_name`, `status` |
| `properties`    | `land_code` (BLU-YYYY-NNN), `type`, `area_sqft`, `asking_price`, `photo_urls TEXT[]`, `gps_lat/lng`, `landmark` |
| `seller_leads`  | `lead_id` (SL-NNN), `owner_name`, `asking_price`, `notes_history JSONB[]` |
| `buyer_leads`   | `lead_id` (BL-NNN), `name`, `budget_min/max`, `purpose`, `urgency`, `properties_visited UUID[]`, `notes_history JSONB[]` |
| `site_visits`   | `property_id`, `buyer_id`, `visit_date`, `buyer_reaction`, `price_discussed`, `next_action` |
| `deals`         | `deal_id` (DEAL-NNN), `deal_value`, `commission_pct`, `total_commission` (generated), `status` |
| `documents`     | `property_id`, `folder`, `file_name`, `file_url`, `file_type` |
| `alerts`        | `type`, `message`, `is_done`, `snoozed_until` |
| `activity_log`  | `type`, `description`, `actor`, `related_id`, `related_type` |

---

## NoteEntry JSONB Structure

`notes_history` on `buyer_leads` and `seller_leads` stores an array of JSONB objects:

```json
{
  "timestamp": "2026-04-19T10:30:00.000Z",
  "author": "Admin",
  "text": "Called buyer, very interested in Plot BLU-2026-003",
  "interaction_type": "Call"
}
```

Valid `interaction_type` values: `Call`, `WhatsApp`, `Meeting`, `Email`, `Site Visit Inquiry`, `Proposal Sent`, `Other`

Example query — get all Call interactions for a buyer:

```sql
SELECT elem->>'timestamp', elem->>'text'
FROM buyer_leads,
     jsonb_array_elements(notes_history) AS elem
WHERE id = '<buyer-uuid>'
  AND elem->>'interaction_type' = 'Call'
ORDER BY 1 DESC;
```

---

## Storage Path Conventions

### Photos (`property-photos` — public)
```
photos/{timestamp}-{random}.{ext}
```
Access: `supabase.storage.from('property-photos').getPublicUrl(path)`

### Documents (`property-documents` — private)
```
{property_id}/{folder}/{timestamp}.{ext}
```
Access: `supabase.storage.from('property-documents').createSignedUrl(path, 3600)`

---

## Generated / Computed Columns

These are PostgreSQL `GENERATED ALWAYS AS ... STORED` columns — do not insert into them:

| Table       | Column              | Formula |
|-------------|---------------------|---------|
| `properties`| `price_per_sqft`    | `asking_price / area_sqft` |
| `deals`     | `total_commission`  | `deal_value * commission_pct / 100` |
