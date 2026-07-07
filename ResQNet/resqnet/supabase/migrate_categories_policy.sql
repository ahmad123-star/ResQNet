-- Run once in Supabase SQL Editor.
-- Grants admins full CUD access to emergency_categories.
-- (The SELECT policy already exists from policies.sql.)

DROP POLICY IF EXISTS "emergency_categories: admin can manage" ON public.emergency_categories;

CREATE POLICY "emergency_categories: admin can manage"
  ON public.emergency_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
