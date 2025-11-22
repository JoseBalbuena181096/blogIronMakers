-- Agregar columna activo a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Asegurar que los usuarios existentes estén activos
UPDATE public.profiles SET activo = TRUE WHERE activo IS NULL;
