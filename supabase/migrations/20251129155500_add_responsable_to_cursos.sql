-- Add responsable_id to cursos table
ALTER TABLE public.cursos
ADD COLUMN responsable_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.cursos.responsable_id IS 'Usuario responsable del curso';
