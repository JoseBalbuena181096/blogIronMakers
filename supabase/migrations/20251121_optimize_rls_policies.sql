-- Migración para optimizar políticas RLS y eliminar warnings de rendimiento
-- Fecha: 2025-11-21

-- ==============================================================================
-- 1. OPTIMIZACIÓN DE TABLAS PÚBLICAS (Eliminar políticas redundantes)
-- ==============================================================================

-- public.certificados
-- Ya tiene "Anyone can verify certificados by code" (USING true), por lo que otras políticas SELECT son redundantes para el acceso público.
-- Sin embargo, mantenemos "Admins can view all" si queremos restringir la vista de lista completa solo a admins, 
-- pero el warning indica que hay múltiples políticas permisivas.
-- Si la intención es que CUALQUIERA vea por código, y ADMINS vean todo, y USUARIOS vean los suyos:
-- La política "Anyone can verify..." es `USING (true)`, lo que efectivamente hace pública la tabla para SELECT.
-- Si la tabla es pública, no necesitamos las otras políticas de SELECT.
DROP POLICY IF EXISTS "Users can view own certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins can view all certificados" ON public.certificados;
-- Nota: Mantenemos "Anyone can verify certificados by code" que es la que da acceso público.

-- public.integrantes_equipo
-- Es pública ("Integrantes are viewable by everyone").
-- La política "Only admins can manage integrantes" es FOR ALL. Vamos a separarla para evitar solapamiento en SELECT.
DROP POLICY IF EXISTS "Only admins can manage integrantes" ON public.integrantes_equipo;
CREATE POLICY "Only admins can manage integrantes"
  ON public.integrantes_equipo
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND rol = 'admin'
    )
  );
-- Pero para evitar el warning en SELECT, debemos excluir SELECT de esta política "manage".
-- Postgres no permite "FOR INSERT, UPDATE, DELETE", hay que crear una por una o usar ALL y aceptar el warning (o que sea redundante).
-- La mejor práctica para evitar el warning "Multiple Permissive Policies" en SELECT es que la política de admin NO aplique a SELECT si ya hay una pública.
-- Así que recreamos la de admin solo para modificaciones.
DROP POLICY IF EXISTS "Only admins can manage integrantes" ON public.integrantes_equipo;
CREATE POLICY "Only admins can insert integrantes"
  ON public.integrantes_equipo FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Only admins can update integrantes"
  ON public.integrantes_equipo FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Only admins can delete integrantes"
  ON public.integrantes_equipo FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));


-- public.proyectos_destacados
-- Similar a integrantes, es pública.
DROP POLICY IF EXISTS "Only admins can manage proyectos" ON public.proyectos_destacados;
CREATE POLICY "Only admins can insert proyectos"
  ON public.proyectos_destacados FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Only admins can update proyectos"
  ON public.proyectos_destacados FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Only admins can delete proyectos"
  ON public.proyectos_destacados FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

-- public.redes_sociales
-- Es pública.
DROP POLICY IF EXISTS "Admin write access for redes_sociales" ON public.redes_sociales;
-- Recreamos solo para escritura
CREATE POLICY "Admin insert redes_sociales"
  ON public.redes_sociales FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Admin update redes_sociales"
  ON public.redes_sociales FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Admin delete redes_sociales"
  ON public.redes_sociales FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

-- public.quiz_preguntas
-- Es pública ("Cualquiera puede ver preguntas").
DROP POLICY IF EXISTS "Solo admins pueden gestionar preguntas" ON public.quiz_preguntas;
CREATE POLICY "Admins insert preguntas"
  ON public.quiz_preguntas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Admins update preguntas"
  ON public.quiz_preguntas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
CREATE POLICY "Admins delete preguntas"
  ON public.quiz_preguntas FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));


-- ==============================================================================
-- 2. OPTIMIZACIÓN DE TABLAS PRIVADAS (Consolidar y auth.uid())
-- ==============================================================================

-- public.profiles
-- Optimizar auth.uid()
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);


-- public.inscripciones
-- Combinar SELECT policies y optimizar auth.uid()
DROP POLICY IF EXISTS "Users can view own inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can view all inscripciones" ON public.inscripciones;

CREATE POLICY "Users own or Admins all inscripciones"
  ON public.inscripciones FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin')
  );

DROP POLICY IF EXISTS "Users can create own inscripciones" ON public.inscripciones;
CREATE POLICY "Users can create own inscripciones"
  ON public.inscripciones FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);


-- public.progreso_lecciones
-- Combinar SELECT policies y optimizar auth.uid()
DROP POLICY IF EXISTS "Users can view own progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Admins can view all progreso" ON public.progreso_lecciones;

CREATE POLICY "Users own or Admins all progreso"
  ON public.progreso_lecciones FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert own progreso" ON public.progreso_lecciones;
CREATE POLICY "Users can insert own progreso"
  ON public.progreso_lecciones FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own progreso" ON public.progreso_lecciones;
CREATE POLICY "Users can update own progreso"
  ON public.progreso_lecciones FOR UPDATE
  USING ((select auth.uid()) = user_id);


-- public.quiz_intentos
-- Combinar SELECT policies y optimizar auth.uid()
DROP POLICY IF EXISTS "Usuarios ven sus propios intentos" ON public.quiz_intentos;
DROP POLICY IF EXISTS "Admins ven todos los intentos" ON public.quiz_intentos;

CREATE POLICY "Users own or Admins all intentos"
  ON public.quiz_intentos FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin')
  );

DROP POLICY IF EXISTS "Usuarios pueden registrar intentos" ON public.quiz_intentos;
CREATE POLICY "Usuarios pueden registrar intentos"
  ON public.quiz_intentos FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);


-- ==============================================================================
-- 3. OPTIMIZACIÓN DE OTRAS POLÍTICAS ADMIN (auth.uid())
-- ==============================================================================

-- public.cursos
DROP POLICY IF EXISTS "Only admins can insert cursos" ON public.cursos;
CREATE POLICY "Only admins can insert cursos"
  ON public.cursos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

DROP POLICY IF EXISTS "Only admins can update cursos" ON public.cursos;
CREATE POLICY "Only admins can update cursos"
  ON public.cursos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete cursos" ON public.cursos;
CREATE POLICY "Only admins can delete cursos"
  ON public.cursos FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

-- public.entradas
DROP POLICY IF EXISTS "Only admins can insert entradas" ON public.entradas;
CREATE POLICY "Only admins can insert entradas"
  ON public.entradas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

DROP POLICY IF EXISTS "Only admins can update entradas" ON public.entradas;
CREATE POLICY "Only admins can update entradas"
  ON public.entradas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete entradas" ON public.entradas;
CREATE POLICY "Only admins can delete entradas"
  ON public.entradas FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

-- public.contenido_landing
DROP POLICY IF EXISTS "Only admins can update landing content" ON public.contenido_landing;
CREATE POLICY "Only admins can update landing content"
  ON public.contenido_landing FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));

DROP POLICY IF EXISTS "Only admins can insert landing content" ON public.contenido_landing;
CREATE POLICY "Only admins can insert landing content"
  ON public.contenido_landing FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND rol = 'admin'));
