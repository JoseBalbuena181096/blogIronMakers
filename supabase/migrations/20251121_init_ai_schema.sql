-- Migración: Inicialización de Esquema para IA (RAG) - V2
-- Fecha: 2025-11-21
-- Descripción: Habilita vector, crea catálogo de niveles educativos (México) y tabla de embeddings.

-- 1. Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Crear tabla de Niveles Educativos (Sistema Mexicano)
CREATE TABLE IF NOT EXISTS public.niveles_educativos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    grupo TEXT NOT NULL, -- Para agrupar en el UI (Preescolar, Primaria, etc.)
    orden INTEGER NOT NULL, -- Para ordenar correctamente en selectores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar lectura pública para que el frontend pueda llenar los selectores
ALTER TABLE public.niveles_educativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for educational levels"
    ON public.niveles_educativos FOR SELECT
    USING (true);

-- Insertar catálogo de datos (Semilla)
INSERT INTO public.niveles_educativos (nombre, grupo, orden) VALUES
    -- Preescolar
    ('Preescolar 1', 'Preescolar', 10),
    ('Preescolar 2', 'Preescolar', 11),
    ('Preescolar 3', 'Preescolar', 12),
    -- Primaria
    ('Primaria 1°', 'Primaria', 20),
    ('Primaria 2°', 'Primaria', 21),
    ('Primaria 3°', 'Primaria', 22),
    ('Primaria 4°', 'Primaria', 23),
    ('Primaria 5°', 'Primaria', 24),
    ('Primaria 6°', 'Primaria', 25),
    -- Secundaria
    ('Secundaria 1°', 'Secundaria', 30),
    ('Secundaria 2°', 'Secundaria', 31),
    ('Secundaria 3°', 'Secundaria', 32),
    -- Preparatoria / Bachillerato
    ('Preparatoria 1er Semestre', 'Preparatoria', 40),
    ('Preparatoria 2do Semestre', 'Preparatoria', 41),
    ('Preparatoria 3er Semestre', 'Preparatoria', 42),
    ('Preparatoria 4to Semestre', 'Preparatoria', 43),
    ('Preparatoria 5to Semestre', 'Preparatoria', 44),
    ('Preparatoria 6to Semestre', 'Preparatoria', 45),
    -- Superior
    ('Universidad / Licenciatura', 'Superior', 50),
    ('Maestría', 'Superior', 60),
    ('Doctorado', 'Superior', 70)
ON CONFLICT DO NOTHING; -- Evitar duplicados si se corre varias veces

-- 3. Actualizar tabla 'profiles'
-- Reemplazamos el campo de texto simple por una llave foránea
DO $$
BEGIN
    -- Si existía la columna anterior (de la versión v1 del script), la borramos o migramos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'educational_level') THEN
        ALTER TABLE public.profiles DROP COLUMN educational_level;
    END IF;

    -- Agregar la nueva columna vinculada
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nivel_educativo_id') THEN
        ALTER TABLE public.profiles ADD COLUMN nivel_educativo_id INTEGER REFERENCES public.niveles_educativos(id);
        COMMENT ON COLUMN public.profiles.nivel_educativo_id IS 'Referencia al nivel educativo del usuario';
    END IF;
END $$;

-- 4. Crear tabla 'entradas_vectors'
CREATE TABLE IF NOT EXISTS public.entradas_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Seguridad (RLS) para vectores
ALTER TABLE public.entradas_vectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on vectors"
    ON public.entradas_vectors FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read vectors"
    ON public.entradas_vectors FOR SELECT TO authenticated
    USING (true);

COMMENT ON TABLE public.entradas_vectors IS 'Almacena fragmentos de texto y sus embeddings vectoriales para RAG';

-- 6. Función para búsqueda de vectores (RAG) con filtro por entrada
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_entrada_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entrada_id UUID,
  content_chunk TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.id,
    ev.entrada_id,
    ev.content_chunk,
    1 - (ev.embedding <=> query_embedding) AS similarity
  FROM public.entradas_vectors ev
  WHERE 1 - (ev.embedding <=> query_embedding) > match_threshold
  AND (filter_entrada_id IS NULL OR ev.entrada_id = filter_entrada_id)
  ORDER BY ev.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
