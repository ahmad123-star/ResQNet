-- Add missing columns to resources table (run once in Supabase SQL Editor)
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS unit     text;
