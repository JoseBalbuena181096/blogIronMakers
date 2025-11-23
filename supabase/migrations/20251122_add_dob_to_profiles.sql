-- Add fecha_nacimiento to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

COMMENT ON COLUMN public.profiles.fecha_nacimiento IS 'Fecha de nacimiento del usuario';
