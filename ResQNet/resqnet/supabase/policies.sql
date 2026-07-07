-- ResQNet Row Level Security Policies
-- Run this in the Supabase SQL Editor (Settings → SQL Editor → New query)
-- Safe to re-run: every policy is dropped before being recreated.

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: authenticated users can read all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can update own"               ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can insert own"               ON public.profiles;

-- Any logged-in user can read profiles (volunteers/NGOs need victim names, etc.)
CREATE POLICY "profiles: authenticated users can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- A user may only edit their own profile row.
CREATE POLICY "profiles: user can update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- The handle_new_user trigger inserts via SECURITY DEFINER, but allow direct inserts too.
CREATE POLICY "profiles: user can insert own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────
-- EMERGENCY CATEGORIES
-- ─────────────────────────────────────────────
ALTER TABLE public.emergency_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emergency_categories: authenticated read" ON public.emergency_categories;

-- Read-only lookup table for all authenticated users; writes handled by admin via dashboard.
CREATE POLICY "emergency_categories: authenticated read"
  ON public.emergency_categories FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- EMERGENCIES
-- ─────────────────────────────────────────────
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emergencies: victim can insert own"          ON public.emergencies;
DROP POLICY IF EXISTS "emergencies: victim can select own"          ON public.emergencies;
DROP POLICY IF EXISTS "emergencies: victim can update own"          ON public.emergencies;
DROP POLICY IF EXISTS "emergencies: authenticated users can select" ON public.emergencies;
DROP POLICY IF EXISTS "emergencies: authenticated users can update" ON public.emergencies;

-- Victims create and manage their own emergencies.
CREATE POLICY "emergencies: victim can insert own"
  ON public.emergencies FOR INSERT
  TO authenticated
  WITH CHECK (victim_id = auth.uid());

CREATE POLICY "emergencies: victim can select own"
  ON public.emergencies FOR SELECT
  TO authenticated
  USING (victim_id = auth.uid());

CREATE POLICY "emergencies: victim can update own"
  ON public.emergencies FOR UPDATE
  TO authenticated
  USING (victim_id = auth.uid());

-- Volunteers, NGOs, and admins need to browse all emergencies to respond.
CREATE POLICY "emergencies: authenticated users can select"
  ON public.emergencies FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user (volunteer/NGO/admin) can update the status field.
CREATE POLICY "emergencies: authenticated users can update"
  ON public.emergencies FOR UPDATE
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: volunteer can insert own"          ON public.tasks;
DROP POLICY IF EXISTS "tasks: volunteer can select own"          ON public.tasks;
DROP POLICY IF EXISTS "tasks: volunteer can update own"          ON public.tasks;
DROP POLICY IF EXISTS "tasks: ngo/admin can select all"          ON public.tasks;
DROP POLICY IF EXISTS "tasks: ngo/admin can insert"              ON public.tasks;
DROP POLICY IF EXISTS "tasks: ngo/admin can update"              ON public.tasks;
DROP POLICY IF EXISTS "tasks: victim can select for own emergency" ON public.tasks;

-- Volunteers manage tasks assigned to themselves.
CREATE POLICY "tasks: volunteer can insert own"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (volunteer_id = auth.uid());

CREATE POLICY "tasks: volunteer can select own"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (volunteer_id = auth.uid());

CREATE POLICY "tasks: volunteer can update own"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (volunteer_id = auth.uid());

-- NGOs and admins have full read/write over all tasks (coordination role).
-- Role is stored in profiles; we join via a sub-select to avoid a per-row function call.
CREATE POLICY "tasks: ngo/admin can select all"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ngo','admin')
    )
  );

CREATE POLICY "tasks: ngo/admin can insert"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ngo','admin')
    )
  );

CREATE POLICY "tasks: ngo/admin can update"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ngo','admin')
    )
  );

-- Victims can see tasks that are responding to their own emergencies.
CREATE POLICY "tasks: victim can select for own emergency"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.emergencies
      WHERE id = tasks.emergency_id AND victim_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- RESOURCES
-- ─────────────────────────────────────────────
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources: ngo can manage own"   ON public.resources;
DROP POLICY IF EXISTS "resources: others can select all" ON public.resources;

-- NGOs have full control over resources they own.
CREATE POLICY "resources: ngo can manage own"
  ON public.resources FOR ALL
  TO authenticated
  USING (ngo_id = auth.uid())
  WITH CHECK (ngo_id = auth.uid());

-- All other authenticated users (volunteers, victims) can browse available resources.
CREATE POLICY "resources: others can select all"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- DONATIONS
-- ─────────────────────────────────────────────
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations: donor can insert own"    ON public.donations;
DROP POLICY IF EXISTS "donations: donor can select own"    ON public.donations;
DROP POLICY IF EXISTS "donations: ngo/admin can select all" ON public.donations;
DROP POLICY IF EXISTS "donations: ngo/admin can update"    ON public.donations;

-- Donors create and view their own donation records.
CREATE POLICY "donations: donor can insert own"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "donations: donor can select own"
  ON public.donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

-- NGOs and admins can see all incoming donations and update their status.
CREATE POLICY "donations: ngo/admin can select all"
  ON public.donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ngo','admin')
    )
  );

CREATE POLICY "donations: ngo/admin can update"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ngo','admin')
    )
  );

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: user can select own"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: user can update own"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: authenticated can insert" ON public.notifications;

-- Users only see their own notifications.
CREATE POLICY "notifications: user can select own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users mark their own notifications as read.
CREATE POLICY "notifications: user can update own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Any authenticated session can create notifications for any user_id
-- (needed so the app can notify victims, volunteers, NGOs, etc.)
CREATE POLICY "notifications: authenticated can insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- SYSTEM LOGS
-- ─────────────────────────────────────────────
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_logs: authenticated can insert" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs: authenticated can select" ON public.system_logs;

-- Any authenticated user can append a log entry (client-side audit trail).
CREATE POLICY "system_logs: authenticated can insert"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can query the audit trail (admins filter in-app by role).
CREATE POLICY "system_logs: authenticated can select"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- REALTIME PUBLICATIONS
-- Enables live updates for the three most time-sensitive tables.
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
