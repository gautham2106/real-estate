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
- `brokers`, `books`, `properties`, `seller_leads`, `buyer_leads`
- `site_visits`, `deals`, `documents`, `alerts`, `activity_log`
- Sequences for auto-IDs (`BLU-2026-001`, `BRK-001`, etc.)
- Trigger for `updated_at` on properties
- Sample seed data (5 demo brokers)

### 2b. Row Level Security

Copy and run `supabase/rls.sql`

This sets up:
- `auth_role()` helper (reads `user_metadata.role` from JWT)
- `auth_broker_id()` helper (matches auth email to broker row)
- RLS policies on every table:
  - **Admin** — full read/write on everything
  - **Broker** — scoped read/write (own leads, assigned properties, own deals)

### 2c. Storage Bucket

Copy and run `supabase/storage.sql`

Or create manually via Dashboard → Storage:
1. Click **New Bucket**
2. Name: `property-documents`
3. **Public bucket**: OFF (private)
4. File size limit: `10 MB`
5. Allowed MIME types: `application/pdf, image/jpeg, image/png, image/webp, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## Step 3 — Create Auth Users

### Admin User

In Dashboard → **Authentication** → Users → **Add user**:

| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@bluesquare.in`     |
| Password | `Admin@123` (change this) |

Then set their role in the user's **metadata** — via SQL Editor:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@bluesquare.in';
```

### Broker Users

For each broker in the `brokers` table, create an Auth user with `role: broker`:

```sql
-- Example: create broker user (do this for each broker)
-- First create the user via Dashboard or API, then:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "broker"}'::jsonb
WHERE email = 'arjun@bluesquare.in';
```

**Important:** The broker's Auth email must match their `email` column in the `brokers` table — this is how `auth_broker_id()` links them.

---

## Step 4 — Verify Setup

Run these checks in SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'property-documents';

-- Check seed brokers
SELECT broker_id, name, tier_level FROM brokers;
```

---

## Step 5 — Optional: Enable Realtime

For live Kanban updates across sessions, enable Realtime for the `deals` table:

Dashboard → **Database** → **Replication** → enable `deals` table.

---

## Database Schema Summary

| Table           | Key Fields                                                         |
|-----------------|--------------------------------------------------------------------|
| `brokers`       | broker_id, name, tier_level, deals_closed, total_commission_earned |
| `books`         | book_id, book_name, status                                         |
| `properties`    | land_code (BLU-YYYY-NNN), type, area, price, side_a/b/c/d         |
| `seller_leads`  | lead_id (SL-NNN), owner_name, property_location, asking_price      |
| `buyer_leads`   | lead_id (BL-NNN), name, budget_min/max, purpose, urgency           |
| `site_visits`   | property_id, buyer_id, visit_date, buyer_reaction                  |
| `deals`         | deal_id (DEAL-NNN), deal_value, commission splits, status          |
| `documents`     | property_id, folder, file_url (Supabase Storage path)             |
| `alerts`        | type, message, is_done, snoozed_until                              |
| `activity_log`  | type, description, actor, related_id                               |

---

## Storage Path Convention

Files are stored at:
```
property-documents/{property_id}/{folder}/{timestamp}.{ext}
```

Example:
```
property-documents/a1b2c3d4-.../Legal/1713000000000.pdf
```

Access via:
```ts
supabase.storage.from('property-documents').getPublicUrl(path)
// or for private buckets:
supabase.storage.from('property-documents').createSignedUrl(path, 3600)
```
