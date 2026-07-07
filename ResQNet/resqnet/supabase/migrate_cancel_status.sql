-- Run once in Supabase SQL Editor.
-- Adds 'Cancelled' as a valid emergency status.

ALTER TABLE public.emergencies
  DROP CONSTRAINT IF EXISTS emergencies_status_check;

ALTER TABLE public.emergencies
  ADD CONSTRAINT emergencies_status_check
  CHECK (status IN ('Reported', 'In Progress', 'Resolved', 'Cancelled'));
