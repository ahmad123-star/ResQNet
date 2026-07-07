-- Admin migration — run once in Supabase SQL Editor.
-- Adds missing columns and fixes RLS so the admin role can operate.

-- ── 1. emergency_categories: add icon + active ────────────────────────────
ALTER TABLE public.emergency_categories
  ADD COLUMN IF NOT EXISTS icon   text,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- ── 2. system_logs: add level ─────────────────────────────────────────────
ALTER TABLE public.system_logs
  ADD COLUMN IF NOT EXISTS level text DEFAULT 'info';

-- ── 3. profiles: add email (populated for new sign-ups via updated trigger)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- ── 4. Update trigger to save email ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'victim'),
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- ── 5. profiles: admin can update any profile (block / unblock) ───────────
DROP POLICY IF EXISTS "profiles: admin update" ON public.profiles;
CREATE POLICY "profiles: admin update" ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ── 6. donations: admin can read all ─────────────────────────────────────
DROP POLICY IF EXISTS "donations: donor read" ON public.donations;
CREATE POLICY "donations: read" ON public.donations FOR SELECT
  USING (
    auth.uid() = donor_id
    OR auth.uid() = target_ngo_id
    OR EXISTS (SELECT 1 FROM public.profiles p
               WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ── 7. system_logs: admin can read all; also allow null-user-id rows ──────
DROP POLICY IF EXISTS "system_logs: own read" ON public.system_logs;
CREATE POLICY "system_logs: read" ON public.system_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles p
               WHERE p.id = auth.uid() AND p.role = 'admin')
  );
