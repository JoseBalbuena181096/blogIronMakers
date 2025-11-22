-- Add personal data fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS edad INTEGER,
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

COMMENT ON COLUMN public.profiles.edad IS 'Edad del usuario';
COMMENT ON COLUMN public.profiles.telefono IS 'Número de teléfono de contacto';
COMMENT ON COLUMN public.profiles.bio IS 'Breve biografía o descripción del usuario';
