-- 05_triggers.sql
-- Database Triggers

-- 1. Create profile on new user signup
-- Note: handle_new_user function is defined in 01_schema.sql (it's a special case)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Check course completion
DROP TRIGGER IF EXISTS trigger_check_completion ON public.progreso_lecciones;
CREATE TRIGGER trigger_check_completion
  AFTER INSERT OR UPDATE ON public.progreso_lecciones
  FOR EACH ROW
  WHEN (NEW.completado = TRUE)
  EXECUTE FUNCTION public.check_curso_completion();

-- 3. Update landing content timestamp
-- Note: contenido_landing table must exist
DROP TRIGGER IF EXISTS update_landing_modified ON public.contenido_landing;
CREATE TRIGGER update_landing_modified
  BEFORE UPDATE ON public.contenido_landing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();

-- 4. Auto-enroll on first lesson progress
DROP TRIGGER IF EXISTS trigger_auto_inscribir ON public.progreso_lecciones;
CREATE TRIGGER trigger_auto_inscribir
  BEFORE INSERT ON public.progreso_lecciones
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_inscribir_curso();
