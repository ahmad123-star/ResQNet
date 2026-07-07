-- ResQNet Seed Data
-- Run this in the Supabase SQL Editor (Settings → SQL Editor → New query)
-- Safe to re-run: ON CONFLICT (name) DO NOTHING skips existing rows.

INSERT INTO public.emergency_categories (name, description) VALUES
  ('Flood',       'Rising water levels threatening lives or property'),
  ('Fire',        'Uncontrolled fire endangering people or structures'),
  ('Earthquake',  'Seismic activity causing structural damage or injuries'),
  ('Accident',    'Road, industrial, or other accidents requiring immediate response'),
  ('Medical',     'Medical emergencies requiring urgent healthcare assistance'),
  ('Other',       'Any emergency not covered by the above categories')
ON CONFLICT (name) DO NOTHING;
