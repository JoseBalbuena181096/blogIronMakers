-- Políticas de Row Level Security (RLS)
-- Ejecutar después de schema.sql

-- ======================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ======================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contenido_landing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrantes_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos_destacados ENABLE ROW LEVEL SECURITY;

-- ======================
-- POLÍTICAS PARA PROFILES
-- ======================

-- Todos pueden ver perfiles públicos
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ======================
-- POLÍTICAS PARA CURSOS (PÚBLICO)
-- ======================

-- Todos pueden ver cursos
CREATE POLICY "Cursos are viewable by everyone"
  ON public.cursos FOR SELECT
  USING (true);

-- Solo admins pueden crear/editar/eliminar cursos
CREATE POLICY "Only admins can insert cursos"
  ON public.cursos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can update cursos"
  ON public.cursos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can delete cursos"
  ON public.cursos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA ENTRADAS (PÚBLICO)
-- ======================

-- Todos pueden ver entradas
CREATE POLICY "Entradas are viewable by everyone"
  ON public.entradas FOR SELECT
  USING (true);

-- Solo admins pueden crear/editar/eliminar entradas
CREATE POLICY "Only admins can insert entradas"
  ON public.entradas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can update entradas"
  ON public.entradas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can delete entradas"
  ON public.entradas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA INSCRIPCIONES
-- ======================

-- Usuarios ven solo sus propias inscripciones
CREATE POLICY "Users can view own inscripciones"
  ON public.inscripciones FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propias inscripciones
CREATE POLICY "Users can create own inscripciones"
  ON public.inscripciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todas las inscripciones
CREATE POLICY "Admins can view all inscripciones"
  ON public.inscripciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA PROGRESO DE LECCIONES
-- ======================

-- Usuarios ven solo su propio progreso
CREATE POLICY "Users can view own progreso"
  ON public.progreso_lecciones FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear/actualizar su propio progreso
CREATE POLICY "Users can insert own progreso"
  ON public.progreso_lecciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progreso"
  ON public.progreso_lecciones FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins pueden ver todo el progreso
CREATE POLICY "Admins can view all progreso"
  ON public.progreso_lecciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA CERTIFICADOS
-- ======================

-- Usuarios ven solo sus propios certificados
CREATE POLICY "Users can view own certificados"
  ON public.certificados FOR SELECT
  USING (auth.uid() = user_id);

-- Verificación pública de certificados por código (sin autenticación)
CREATE POLICY "Anyone can verify certificados by code"
  ON public.certificados FOR SELECT
  USING (true);

-- Solo el sistema puede insertar certificados (via trigger)
CREATE POLICY "System can insert certificados"
  ON public.certificados FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver todos los certificados
CREATE POLICY "Admins can view all certificados"
  ON public.certificados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA LANDING PAGE (PÚBLICO)
-- ======================

-- Todos pueden ver contenido de landing
CREATE POLICY "Landing content is viewable by everyone"
  ON public.contenido_landing FOR SELECT
  USING (true);

-- Solo admins pueden editar landing
CREATE POLICY "Only admins can update landing content"
  ON public.contenido_landing FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Only admins can insert landing content"
  ON public.contenido_landing FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA INTEGRANTES DEL EQUIPO (PÚBLICO)
-- ======================

-- Todos pueden ver integrantes
CREATE POLICY "Integrantes are viewable by everyone"
  ON public.integrantes_equipo FOR SELECT
  USING (true);

-- Solo admins pueden gestionar integrantes
CREATE POLICY "Only admins can manage integrantes"
  ON public.integrantes_equipo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ======================
-- POLÍTICAS PARA PROYECTOS DESTACADOS (PÚBLICO)
-- ======================

-- Todos pueden ver proyectos destacados
CREATE POLICY "Proyectos are viewable by everyone"
  ON public.proyectos_destacados FOR SELECT
  USING (destacado = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND rol = 'admin'
  ));

-- Solo admins pueden gestionar proyectos
CREATE POLICY "Only admins can manage proyectos"
  ON public.proyectos_destacados FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
