-- Agregar columna publicado a cursos
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT FALSE;

-- Actualizar cursos existentes a publicado = true (opcional, para no ocultar los actuales)
-- UPDATE public.cursos SET publicado = true;

-- Actualizar política de visualización de cursos
DROP POLICY IF EXISTS "Cursos are viewable by everyone" ON public.cursos;

CREATE POLICY "Cursos are viewable by everyone"
  ON public.cursos FOR SELECT
  USING (
    publicado = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
