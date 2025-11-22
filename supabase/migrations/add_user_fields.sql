-- Add nivel_educativo to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nivel_educativo TEXT,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.profiles.nivel_educativo IS 'Nivel educativo del usuario (e.g., Secundaria, Preparatoria, Universidad)';
COMMENT ON COLUMN public.profiles.activo IS 'Estado de la cuenta: true = activa, false = deshabilitada/baneada';
