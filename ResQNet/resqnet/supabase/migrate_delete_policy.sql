-- Run once in Supabase SQL Editor.
-- Allows admins to delete emergency reports (cascades to tasks via FK).
-- Also allows victims to delete their own unresolved reports.

DROP POLICY IF EXISTS "emergencies: admin can delete"  ON public.emergencies;
DROP POLICY IF EXISTS "emergencies: victim can delete own" ON public.emergencies;

CREATE POLICY "emergencies: admin can delete"
  ON public.emergencies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "emergencies: victim can delete own"
  ON public.emergencies FOR DELETE
  TO authenticated
  USING (victim_id = auth.uid());
