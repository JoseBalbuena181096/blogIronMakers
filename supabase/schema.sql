-- Schema completo del Blog Educativo
-- Ejecutar en Supabase SQL Editor

-- ======================
-- TABLAS PRINCIPALES
-- ======================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  avatar_url TEXT,
  rol TEXT DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  imagen_portada TEXT,
  duracion_estimada INTEGER, -- en minutos
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entradas/lecciones
CREATE TABLE IF NOT EXISTS public.entradas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  contenido JSONB, -- bloques de contenido rico
  orden_en_curso INTEGER NOT NULL,
  duracion_estimada INTEGER, -- en minutos
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completado TIMESTAMP WITH TIME ZONE,
  estado TEXT DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'completado')),
  UNIQUE(user_id, curso_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS public.progreso_lecciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entrada_id UUID REFERENCES public.entradas(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  tiempo_dedicado INTEGER, -- en minutos
  UNIQUE(user_id, entrada_id)
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
  fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  codigo_verificacion TEXT UNIQUE NOT NULL,
  url_pdf TEXT, -- URL en Supabase Storage
  UNIQUE(user_id, curso_id)
);

-- ======================
-- TABLAS DE CONTENIDO LANDING PAGE
-- ======================

-- Contenido de secciones de la landing
CREATE TABLE IF NOT EXISTS public.contenido_landing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seccion TEXT UNIQUE NOT NULL, -- 'quienes_somos', 'mision', etc.
  contenido JSONB,
  ultima_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrantes del equipo
CREATE TABLE IF NOT EXISTS public.integrantes_equipo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rol TEXT,
  bio TEXT,
  foto_url TEXT,
  linkedin_url TEXT,
  orden INTEGER DEFAULT 0
);

-- Proyectos destacados
CREATE TABLE IF NOT EXISTS public.proyectos_destacados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  url_proyecto TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  destacado BOOLEAN DEFAULT TRUE
);

-- ======================
-- ÍNDICES PARA PERFORMANCE
-- ======================

CREATE INDEX IF NOT EXISTS idx_entradas_curso ON public.entradas(curso_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_user ON public.inscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso ON public.inscripciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_progreso_user ON public.progreso_lecciones(user_id);
CREATE INDEX IF NOT EXISTS idx_progreso_entrada ON public.progreso_lecciones(entrada_id);
CREATE INDEX IF NOT EXISTS idx_certificados_user ON public.certificados(user_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON public.certificados(codigo_verificacion);
CREATE INDEX IF NOT EXISTS idx_cursos_slug ON public.cursos(slug);
CREATE INDEX IF NOT EXISTS idx_entradas_slug ON public.entradas(slug);

-- ======================
-- COMENTARIOS EN TABLAS
-- ======================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios extendidos desde auth.users';
COMMENT ON TABLE public.cursos IS 'Catálogo de cursos disponibles';
COMMENT ON TABLE public.entradas IS 'Lecciones/entradas de blog asociadas a cursos';
COMMENT ON TABLE public.inscripciones IS 'Relación de usuarios inscritos en cursos';
COMMENT ON TABLE public.progreso_lecciones IS 'Tracking de lecciones completadas por usuario';
COMMENT ON TABLE public.certificados IS 'Certificados emitidos al completar cursos';
