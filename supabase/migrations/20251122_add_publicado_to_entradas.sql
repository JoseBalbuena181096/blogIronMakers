-- Agregar columna publicado a entradas
ALTER TABLE public.entradas 
ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT FALSE;

-- Actualizar entradas existentes a publicado = true (opcional)
-- UPDATE public.entradas SET publicado = true;

-- Actualizar política de visualización de entradas
DROP POLICY IF EXISTS "Entradas are viewable by everyone" ON public.entradas;

CREATE POLICY "Entradas are viewable by everyone"
  ON public.entradas FOR SELECT
  USING (
    publicado = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
