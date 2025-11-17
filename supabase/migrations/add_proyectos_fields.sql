-- Agregar campos faltantes a la tabla proyectos_destacados
-- SEGURO: Usa IF NOT EXISTS para evitar conflictos con columnas existentes

-- Agregar columna tecnologias (array de strings)
ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS tecnologias TEXT[] DEFAULT '{}';

-- Agregar columna orden
ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

-- Agregar columna visible
ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;

-- Copiar valores de destacado a visible y eliminar dependencias
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proyectos_destacados' 
    AND column_name = 'destacado'
  ) THEN
    -- Copiar valores de destacado a visible
    UPDATE public.proyectos_destacados 
    SET visible = destacado 
    WHERE visible IS NULL OR visible != destacado;
    
    -- Eliminar políticas que dependen de la columna destacado
    DROP POLICY IF EXISTS "Proyectos are viewable by everyone" ON public.proyectos_destacados;
    
    -- Eliminar columna destacado con CASCADE
    ALTER TABLE public.proyectos_destacados DROP COLUMN IF EXISTS destacado CASCADE;
    
    -- Recrear la política usando la columna visible
    CREATE POLICY "Proyectos are viewable by everyone" 
    ON public.proyectos_destacados FOR SELECT 
    USING (visible = true);
  END IF;
END $$;

-- Actualizar proyectos existentes con valores por defecto
-- Solo actualiza registros que no tienen valores en los nuevos campos

-- Primero actualizar el orden usando una subconsulta
WITH numbered_proyectos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY fecha_creacion) as new_orden
  FROM public.proyectos_destacados
  WHERE orden IS NULL OR orden = 0
)
UPDATE public.proyectos_destacados p
SET orden = np.new_orden
FROM numbered_proyectos np
WHERE p.id = np.id;

-- Luego actualizar visible y tecnologias
UPDATE public.proyectos_destacados 
SET 
  visible = COALESCE(visible, TRUE),
  tecnologias = CASE 
    WHEN tecnologias IS NULL OR tecnologias = '{}' 
    THEN ARRAY['Proyecto']::TEXT[]
    ELSE tecnologias 
  END
WHERE visible IS NULL OR tecnologias IS NULL OR tecnologias = '{}';

COMMENT ON COLUMN public.proyectos_destacados.tecnologias IS 'Array de tecnologías usadas en el proyecto';
COMMENT ON COLUMN public.proyectos_destacados.orden IS 'Orden de visualización en la landing';
COMMENT ON COLUMN public.proyectos_destacados.visible IS 'Si el proyecto es visible en la landing';
