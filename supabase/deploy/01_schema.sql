-- 01_schema.sql
-- Consolidated schema definition for Iron Makers Blog System

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tables

-- Niveles Educativos
CREATE TABLE IF NOT EXISTS public.niveles_educativos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    grupo TEXT NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.niveles_educativos ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  avatar_url TEXT,
  rol TEXT DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_nacimiento DATE,
  telefono TEXT,
  bio TEXT,
  nivel_educativo_id INTEGER REFERENCES public.niveles_educativos(id),
  activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cursos
CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_portada TEXT,
  duracion_estimada INTEGER, -- minutos
  orden INTEGER DEFAULT 0,
  responsable_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  publicado BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Entradas (Lecciones)
CREATE TABLE IF NOT EXISTS public.entradas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  contenido JSONB, -- Array de bloques
  orden_en_curso INTEGER DEFAULT 0,
  duracion_estimada INTEGER, -- minutos
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  publicado BOOLEAN DEFAULT FALSE,
  calificacion_minima INTEGER DEFAULT 100,
  UNIQUE(slug, curso_id)
);

ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;

-- Inscripciones
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completado TIMESTAMP WITH TIME ZONE,
  estado TEXT DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'completado')),
  UNIQUE(user_id, curso_id)
);

ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Progreso Lecciones
CREATE TABLE IF NOT EXISTS public.progreso_lecciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  tiempo_dedicado INTEGER DEFAULT 0, -- segundos
  UNIQUE(user_id, entrada_id)
);

ALTER TABLE public.progreso_lecciones ENABLE ROW LEVEL SECURITY;

-- Entradas Vectors (RAG)
CREATE TABLE IF NOT EXISTS public.entradas_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.entradas_vectors ENABLE ROW LEVEL SECURITY;

-- Quiz Preguntas
CREATE TABLE IF NOT EXISTS public.quiz_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  tipo TEXT DEFAULT 'multiple' CHECK (tipo IN ('multiple', 'verdadero_falso', 'abierta')),
  criterios_evaluacion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_preguntas_entrada ON public.quiz_preguntas(entrada_id);
ALTER TABLE public.quiz_preguntas ENABLE ROW LEVEL SECURITY;

-- Quiz Intentos
CREATE TABLE IF NOT EXISTS public.quiz_intentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL,
  respuestas JSONB NOT NULL,
  fecha_intento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_intentos_user_entrada ON public.quiz_intentos(user_id, entrada_id);
ALTER TABLE public.quiz_intentos ENABLE ROW LEVEL SECURITY;

-- Redes Sociales
CREATE TABLE IF NOT EXISTS public.redes_sociales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  icono TEXT,
  orden INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.redes_sociales ENABLE ROW LEVEL SECURITY;

-- Proyectos Destacados
CREATE TABLE IF NOT EXISTS public.proyectos_destacados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  url_proyecto TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tecnologias TEXT[] DEFAULT '{}',
  orden INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.proyectos_destacados ENABLE ROW LEVEL SECURITY;

-- 3. Triggers
-- Triggers are defined in 05_triggers.sql
