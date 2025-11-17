# Migración de Proyectos Destacados

## Problema
La tabla `proyectos_destacados` no tiene los campos necesarios (`tecnologias`, `orden`, `visible`) que el componente de administración espera.

## Solución
Ejecutar la migración en Supabase SQL Editor.

## Pasos para aplicar la migración:

1. **Abrir Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ir al SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"

3. **Ejecutar la migración**
   - Copia el contenido del archivo `supabase/migrations/add_proyectos_fields.sql`
   - Pégalo en el SQL Editor
   - Haz clic en "Run" o presiona `Ctrl + Enter`

4. **Verificar**
   - Ve a "Table Editor" → "proyectos_destacados"
   - Verifica que las columnas `tecnologias`, `orden` y `visible` existan

## Alternativa rápida (ejecutar directamente):

Puedes copiar y pegar este SQL en Supabase SQL Editor:

```sql
-- Agregar campos faltantes a la tabla proyectos_destacados

ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS tecnologias TEXT[] DEFAULT '{}';

ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

ALTER TABLE public.proyectos_destacados 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;

-- Actualizar proyectos existentes
UPDATE public.proyectos_destacados 
SET 
  tecnologias = ARRAY['Python', 'AI', 'Machine Learning']::TEXT[],
  orden = 1,
  visible = TRUE
WHERE tecnologias = '{}' OR tecnologias IS NULL;
```

## Después de la migración

Una vez ejecutada la migración, recarga la página de administración y podrás:
- Ver todos los proyectos existentes
- Editarlos completamente
- Agregar nuevos proyectos
- Eliminar proyectos
- Controlar su visibilidad
