-- 1. Permitir a los admins insertar inscripciones
DROP POLICY IF EXISTS "Admins can insert inscripciones" ON public.inscripciones;
CREATE POLICY "Admins can insert inscripciones"
  ON public.inscripciones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- 2. Permitir a los admins eliminar inscripciones
DROP POLICY IF EXISTS "Admins can delete inscripciones" ON public.inscripciones;
CREATE POLICY "Admins can delete inscripciones"
  ON public.inscripciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- 3. Permitir a los admins actualizar inscripciones
DROP POLICY IF EXISTS "Admins can update inscripciones" ON public.inscripciones;
CREATE POLICY "Admins can update inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
