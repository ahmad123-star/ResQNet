-- Run once in Supabase SQL Editor.
-- Adds photo_url to emergencies and creates the emergency-photos storage bucket.

-- 1. Add photo_url column
ALTER TABLE public.emergencies
  ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Create storage bucket (public so images load via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('emergency-photos', 'emergency-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies
-- Anyone (including anonymous) can view emergency photos
DROP POLICY IF EXISTS "emergency-photos: public read" ON storage.objects;
CREATE POLICY "emergency-photos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'emergency-photos');

-- Authenticated users can upload only to their own folder (path = userId/filename)
DROP POLICY IF EXISTS "emergency-photos: owner upload" ON storage.objects;
CREATE POLICY "emergency-photos: owner upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'emergency-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own photos
DROP POLICY IF EXISTS "emergency-photos: owner delete" ON storage.objects;
CREATE POLICY "emergency-photos: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'emergency-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
