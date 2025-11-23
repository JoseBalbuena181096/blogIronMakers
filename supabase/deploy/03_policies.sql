-- 03_policies.sql
-- Row Level Security Policies

-- ======================
-- PROFILES
-- ======================
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
-- CURSOS
-- ======================
-- SELECT: Public (if published) OR Admin
CREATE POLICY "Cursos are viewable by everyone"
  ON public.cursos FOR SELECT
  USING (
    publicado = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- INSERT/UPDATE/DELETE: Admin only
CREATE POLICY "Admins can manage cursos"
  ON public.cursos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- ENTRADAS
-- ======================
-- SELECT: Public (if published) OR Admin
CREATE POLICY "Entradas are viewable by everyone"
  ON public.entradas FOR SELECT
  USING (
    publicado = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- INSERT/UPDATE/DELETE: Admin only
CREATE POLICY "Admins can manage entradas"
  ON public.entradas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- INSCRIPCIONES
-- ======================
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

-- UPDATE/DELETE: Admin only
CREATE POLICY "Admins can update inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

CREATE POLICY "Admins can delete inscripciones"
  ON public.inscripciones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- PROGRESO LECCIONES
-- ======================
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
-- NIVELES EDUCATIVOS
-- ======================
-- SELECT: Public
CREATE POLICY "Public read access for educational levels"
    ON public.niveles_educativos FOR SELECT
    USING (true);

-- ======================
-- ENTRADAS VECTORS
-- ======================
-- Service role full access
CREATE POLICY "Service role full access on vectors"
    ON public.entradas_vectors FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Authenticated users read access
CREATE POLICY "Authenticated users can read vectors"
    ON public.entradas_vectors FOR SELECT TO authenticated
    USING (true);

-- ======================
-- QUIZ PREGUNTAS
-- ======================
-- SELECT: Public
CREATE POLICY "Cualquiera puede ver preguntas"
  ON public.quiz_preguntas FOR SELECT
  USING (true);

-- ALL: Admin only
CREATE POLICY "Solo admins pueden gestionar preguntas"
  ON public.quiz_preguntas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- QUIZ INTENTOS
-- ======================
-- SELECT: User (own) OR Admin
CREATE POLICY "Usuarios ven sus propios intentos"
  ON public.quiz_intentos FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins ven todos los intentos"
  ON public.quiz_intentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- INSERT: User (own)
CREATE POLICY "Usuarios pueden registrar intentos"
  ON public.quiz_intentos FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- DELETE: Admin only
CREATE POLICY "Admins can delete quiz attempts"
  ON public.quiz_intentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- REDES SOCIALES
-- ======================
-- SELECT: Public
CREATE POLICY "Redes sociales visibles para todos"
  ON public.redes_sociales FOR SELECT
  USING (visible = true);

-- ALL: Admin only
CREATE POLICY "Admins gestionan redes sociales"
  ON public.redes_sociales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ======================
-- PROYECTOS DESTACADOS
-- ======================
-- SELECT: Public (if visible) OR Admin
CREATE POLICY "Proyectos are viewable by everyone"
  ON public.proyectos_destacados FOR SELECT
  USING (
    visible = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );

-- ALL: Admin only
CREATE POLICY "Admins gestionan proyectos"
  ON public.proyectos_destacados FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );
