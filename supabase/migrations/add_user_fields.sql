-- Add activo status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Remove redundant text column if it exists (cleanup)
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS nivel_educativo;

COMMENT ON COLUMN public.profiles.activo IS 'Estado de la cuenta: true = activa, false = deshabilitada/baneada';
