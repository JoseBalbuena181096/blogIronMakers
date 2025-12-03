-- Add is_paid column to cursos table
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.cursos.is_paid IS 'Indica si el curso es de pago (acceso restringido) o público';
