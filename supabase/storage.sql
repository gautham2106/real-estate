-- ══════════════════════════════════════════════════════════
--  Bluesquare CRM — Storage Buckets & Policies
--  Run this in Supabase SQL Editor AFTER schema.sql + rls.sql
-- ══════════════════════════════════════════════════════════

-- ─── Create storage bucket ────────────────────────────────
-- This can also be done in Supabase Dashboard > Storage > New Bucket

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

-- ─── Storage RLS Policies ────────────────────────────────

-- Policy 1: Admin can upload anything
CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Policy 2: Admin can read all files
CREATE POLICY "storage_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Policy 3: Admin can delete files
CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Policy 4: Brokers can upload to folders named with their broker ID prefix
-- Brokers upload to: {property_id}/{folder}/{filename}
-- (No broker-level restriction on folder path here — adjust if needed)
CREATE POLICY "storage_broker_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'broker'
  );

-- Policy 5: Brokers can read files (for documents they uploaded or are assigned to)
CREATE POLICY "storage_broker_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-documents' AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'broker'
  );
