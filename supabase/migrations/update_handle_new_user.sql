-- Update handle_new_user function to include new fields
-- This function is triggered when a new user is created in auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nombre,
    rol,
    fecha_registro,
    activo,
    fecha_nacimiento,
    telefono,
    nivel_educativo_id,
    bio
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', new.email),
    COALESCE(new.raw_user_meta_data->>'rol', 'user'),
    NOW(),
    TRUE,
    (new.raw_user_meta_data->>'fecha_nacimiento')::DATE,
    new.raw_user_meta_data->>'telefono',
    (new.raw_user_meta_data->>'nivel_educativo_id')::INTEGER,
    new.raw_user_meta_data->>'bio'
  );
  RETURN new;
END;
$$;
