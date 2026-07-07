-- ResQNet Database Schema
-- Run this in the Supabase SQL Editor (Settings → SQL Editor → New query)

-- ─────────────────────────────────────────────
-- PROFILES
-- Extends auth.users; one row per registered user.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                text NOT NULL CHECK (role IN ('victim','volunteer','ngo','donor','admin')),
  name                text,
  phone               text,
  address             text,
  lat                 double precision,
  lng                 double precision,
  availability_status text DEFAULT 'available',
  blocked             boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile; can only update their own.
CREATE POLICY "profiles: read all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles: insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- EMERGENCY CATEGORIES
-- Lookup table: Fire, Flood, Medical, etc.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.emergency_categories ENABLE ROW LEVEL SECURITY;

-- Public read; only authenticated users (admins) should write — tighten later.
CREATE POLICY "emergency_categories: read all" ON public.emergency_categories FOR SELECT USING (true);
CREATE POLICY "emergency_categories: auth write" ON public.emergency_categories FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- EMERGENCIES
-- Distress events reported by victims.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergencies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.emergency_categories(id) ON DELETE SET NULL,
  description text,
  severity    text CHECK (severity IN ('Low','Medium','High')),
  lat         double precision,
  lng         double precision,
  address     text,
  status      text CHECK (status IN ('Reported','In Progress','Resolved')) DEFAULT 'Reported',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read emergencies; victims can insert/update their own.
CREATE POLICY "emergencies: read all"   ON public.emergencies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "emergencies: victim insert" ON public.emergencies FOR INSERT WITH CHECK (auth.uid() = victim_id);
CREATE POLICY "emergencies: victim update" ON public.emergencies FOR UPDATE USING (auth.uid() = victim_id);

-- ─────────────────────────────────────────────
-- TASKS
-- Volunteer assignments linked to emergencies.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id uuid REFERENCES public.emergencies(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status       text CHECK (status IN ('Accepted','In Progress','Completed')) DEFAULT 'Accepted',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read tasks; volunteers can manage their own.
CREATE POLICY "tasks: read all"         ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "tasks: volunteer insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = volunteer_id);
CREATE POLICY "tasks: volunteer update" ON public.tasks FOR UPDATE USING (auth.uid() = volunteer_id);

-- ─────────────────────────────────────────────
-- RESOURCES
-- Items/supplies managed by NGOs.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resources (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name       text,
  category   text,
  quantity   int DEFAULT 0,
  unit       text,
  status     text DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read; NGOs manage their own resources.
CREATE POLICY "resources: read all"    ON public.resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "resources: ngo insert"  ON public.resources FOR INSERT WITH CHECK (auth.uid() = ngo_id);
CREATE POLICY "resources: ngo update"  ON public.resources FOR UPDATE USING (auth.uid() = ngo_id);
CREATE POLICY "resources: ngo delete"  ON public.resources FOR DELETE USING (auth.uid() = ngo_id);

-- ─────────────────────────────────────────────
-- DONATIONS
-- Monetary or in-kind contributions from donors.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type                text CHECK (type IN ('Funds','Items')),
  amount              numeric,           -- used when type = 'Funds'
  item                text,              -- used when type = 'Items'
  quantity            int,               -- used when type = 'Items'
  target_ngo_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_emergency_id uuid REFERENCES public.emergencies(id) ON DELETE SET NULL,
  status              text DEFAULT 'Pending',
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donors can read and insert their own donations; NGOs can read donations targeting them.
CREATE POLICY "donations: donor read"  ON public.donations FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = target_ngo_id);
CREATE POLICY "donations: donor insert" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- In-app alerts sent to any user.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text,
  title      text,
  message    text,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own notifications.
CREATE POLICY "notifications: own read"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications: own update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SYSTEM LOGS
-- Audit trail of admin/user actions.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     text,
  details    text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only the owning user can read their own log entries; inserts open to authenticated users.
CREATE POLICY "system_logs: own read"   ON public.system_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "system_logs: auth insert" ON public.system_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_emergencies_status     ON public.emergencies(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_victim_id  ON public.emergencies(victim_id);
CREATE INDEX IF NOT EXISTS idx_tasks_volunteer_id     ON public.tasks(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON public.notifications(user_id);

-- ─────────────────────────────────────────────
-- TRIGGER: auto-create profile on sign-up
-- Reads role/name/phone from raw_user_meta_data
-- (passed as the 3rd argument to supabase.auth.signUp).
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'victim'),
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate so re-running this file is safe.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
