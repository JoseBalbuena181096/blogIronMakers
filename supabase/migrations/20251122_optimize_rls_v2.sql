-- Optimize RLS policies to fix performance warnings and consolidate permissions
-- Replaces auth.uid() with (select auth.uid())
-- Consolidates multiple permissive policies

-- ======================
-- PROFILES
-- ======================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
-- Also drop the new policy names in case of re-run
DROP POLICY IF EXISTS "Users can insert own profile or Admins" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or Admins" ON public.profiles;

-- SELECT: Public
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: User (self) OR Admin
CREATE POLICY "Users can insert own profile or Admins"
  ON public.profiles FOR INSERT
  WITH CHECK (
    (select auth.uid()) = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- UPDATE: User (self) OR Admin
CREATE POLICY "Users can update own profile or Admins"
  ON public.profiles FOR UPDATE
  USING (
    (select auth.uid()) = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- DELETE: Admin only
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- INSCRIPCIONES
-- ======================

DROP POLICY IF EXISTS "Users can view own inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Users can create own inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can view all inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can insert inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can delete inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can update inscripciones" ON public.inscripciones;
-- Also drop the new policy names in case of re-run
DROP POLICY IF EXISTS "Users view own or Admins view all" ON public.inscripciones;
DROP POLICY IF EXISTS "Users insert own or Admins insert any" ON public.inscripciones;

-- SELECT: User (own) OR Admin
CREATE POLICY "Users view own or Admins view all"
  ON public.inscripciones FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- INSERT: User (own) OR Admin
CREATE POLICY "Users insert own or Admins insert any"
  ON public.inscripciones FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- UPDATE: Admin only (for now, as users don't typically update enrollments directly)
CREATE POLICY "Admins can update inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- DELETE: Admin only
CREATE POLICY "Admins can delete inscripciones"
  ON public.inscripciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- CURSOS (Admin optimizations)
-- ======================

DROP POLICY IF EXISTS "Only admins can insert cursos" ON public.cursos;
DROP POLICY IF EXISTS "Only admins can update cursos" ON public.cursos;
DROP POLICY IF EXISTS "Only admins can delete cursos" ON public.cursos;

CREATE POLICY "Only admins can insert cursos"
  ON public.cursos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can update cursos"
  ON public.cursos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can delete cursos"
  ON public.cursos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- ENTRADAS (Admin optimizations)
-- ======================

DROP POLICY IF EXISTS "Only admins can insert entradas" ON public.entradas;
DROP POLICY IF EXISTS "Only admins can update entradas" ON public.entradas;
DROP POLICY IF EXISTS "Only admins can delete entradas" ON public.entradas;

CREATE POLICY "Only admins can insert entradas"
  ON public.entradas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can update entradas"
  ON public.entradas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can delete entradas"
  ON public.entradas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- PROGRESO LECCIONES
-- ======================

DROP POLICY IF EXISTS "Users can view own progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Users can insert own progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Users can update own progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Admins can view all progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Admins can delete progreso" ON public.progreso_lecciones;
-- Also drop the new policy names in case of re-run
DROP POLICY IF EXISTS "Users view own or Admins view all progreso" ON public.progreso_lecciones;

-- SELECT: User (own) OR Admin
CREATE POLICY "Users view own or Admins view all progreso"
  ON public.progreso_lecciones FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- INSERT: User (own)
CREATE POLICY "Users can insert own progreso"
  ON public.progreso_lecciones FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: User (own)
CREATE POLICY "Users can update own progreso"
  ON public.progreso_lecciones FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- DELETE: Admin only
CREATE POLICY "Admins can delete progreso"
  ON public.progreso_lecciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- QUIZ INTENTOS
-- ======================

DROP POLICY IF EXISTS "Admins can delete quiz attempts" ON public.quiz_intentos;

CREATE POLICY "Admins can delete quiz attempts"
  ON public.quiz_intentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );
