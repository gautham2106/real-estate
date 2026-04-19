-- ══════════════════════════════════════════════════════════
--  Bluesquare CRM — Storage Buckets & Policies
--  Run this in Supabase SQL Editor AFTER schema.sql + rls.sql
-- ══════════════════════════════════════════════════════════

-- ─── Bucket 1: property-photos (public) ──────────────────
-- Stores property listing photos served directly in the UI.
-- Public bucket so Next.js Image can load URLs without signed tokens.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-photos',
  'property-photos',
  true,               -- public bucket (URLs work without auth)
  5242880,            -- 5 MB max per photo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─── Bucket 2: property-documents (private) ──────────────
-- Stores legal docs, agreements, PDFs — requires signed URLs.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,              -- private bucket (requires signed URLs or admin access)
  10485760,           -- 10 MB max file size
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies: property-photos ───────────────

-- Admin: full access
CREATE POLICY "photos_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-photos' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "photos_admin_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-photos');

CREATE POLICY "photos_public_select" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'property-photos');

CREATE POLICY "photos_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-photos' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Brokers can upload photos
CREATE POLICY "photos_broker_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-photos' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'broker'
  );

-- ─── Storage RLS Policies: property-documents ────────────

-- Admin: full access
CREATE POLICY "docs_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "docs_admin_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "docs_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Brokers can upload and read documents
CREATE POLICY "docs_broker_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'broker'
  );

CREATE POLICY "docs_broker_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'broker'
  );
