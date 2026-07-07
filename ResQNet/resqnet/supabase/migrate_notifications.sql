-- Notifications migration — run once in Supabase SQL Editor.
-- Adds INSERT policy so any authenticated user can create a notification
-- for any target user (needed for cross-user events like NGO → volunteer).
-- The SELECT and UPDATE policies already restrict reads/updates to own rows.

CREATE POLICY "notifications: auth insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
