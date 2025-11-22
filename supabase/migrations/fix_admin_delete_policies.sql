-- Fix: Add DELETE policies for admins on progreso_lecciones and quiz_intentos
-- This allows admins to reset user progress from the admin panel

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can delete progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Admins can update inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can delete inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can delete quiz attempts" ON public.quiz_intentos;

-- Add DELETE policy for progreso_lecciones
CREATE POLICY "Admins can delete progreso"
  ON public.progreso_lecciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Add UPDATE policy for inscripciones (needed for resetting course status)
CREATE POLICY "Admins can update inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Add DELETE policy for inscripciones (needed for unenrollment)
CREATE POLICY "Admins can delete inscripciones"
  ON public.inscripciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Add DELETE policy for quiz_intentos
CREATE POLICY "Admins can delete quiz attempts"
  ON public.quiz_intentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
