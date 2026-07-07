-- Adds avatar_url to profiles and creates the avatars storage bucket.
-- Run this once in Supabase SQL Editor.

-- 1. Add column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Create storage bucket (public so image URLs load without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies
DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars: owner upload" ON storage.objects;
CREATE POLICY "avatars: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars: owner update" ON storage.objects;
CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars: owner delete" ON storage.objects;
CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
