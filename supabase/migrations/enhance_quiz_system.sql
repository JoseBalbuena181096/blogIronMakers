-- Migration: Enhance Quiz System
-- Add passing score to entradas (lessons)
ALTER TABLE public.entradas 
ADD COLUMN IF NOT EXISTS calificacion_minima INTEGER DEFAULT 100;

-- Add question type and evaluation criteria to quiz_preguntas
ALTER TABLE public.quiz_preguntas 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multiple' CHECK (tipo IN ('multiple', 'verdadero_falso', 'abierta')),
ADD COLUMN IF NOT EXISTS criterios_evaluacion TEXT;

-- Comment on columns
COMMENT ON COLUMN public.entradas.calificacion_minima IS 'Puntuación mínima (0-100) para aprobar el quiz de esta lección';
COMMENT ON COLUMN public.quiz_preguntas.tipo IS 'Tipo de pregunta: multiple, verdadero_falso, abierta';
COMMENT ON COLUMN public.quiz_preguntas.criterios_evaluacion IS 'Criterios para que la IA evalúe preguntas abiertas';
