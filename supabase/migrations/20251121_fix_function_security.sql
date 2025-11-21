-- Migración para corregir warnings de seguridad: Function Search Path Mutable
-- Fecha: 2025-11-21

-- ==============================================================================
-- FIJAR SEARCH_PATH EN FUNCIONES
-- ==============================================================================
-- Es una buena práctica de seguridad fijar el search_path en funciones, 
-- especialmente aquellas con SECURITY DEFINER, para evitar que código malicioso 
-- intercepte llamadas a objetos.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.check_curso_completion() SET search_path = public;
ALTER FUNCTION public.update_modified_column() SET search_path = public;
ALTER FUNCTION public.auto_inscribir_curso() SET search_path = public;

-- ==============================================================================
-- NOTA SOBRE LEAKED PASSWORD PROTECTION
-- ==============================================================================
-- El warning "Leaked Password Protection Disabled" no se puede corregir via SQL estándar
-- en el esquema public. Debes activarlo manualmente en el Dashboard de Supabase:
-- Ir a: Authentication -> Security -> Password protection -> Enable "Leaked password protection"
