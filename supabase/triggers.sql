-- Triggers y funciones para automatización
-- Ejecutar después de schema.sql y policies.sql

-- ======================
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ======================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    CASE 
      WHEN NEW.email = CURRENT_SETTING('app.admin_email', true) THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================
-- FUNCIÓN: Verificar si curso está completado y generar certificado
-- ======================

CREATE OR REPLACE FUNCTION public.check_curso_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_lecciones INTEGER;
  lecciones_completadas INTEGER;
  v_curso_id UUID;
  v_curso_titulo TEXT;
  v_user_email TEXT;
BEGIN
  -- Solo ejecutar si la lección fue marcada como completada
  IF NEW.completado = FALSE THEN
    RETURN NEW;
  END IF;

  -- Obtener curso_id de la lección
  SELECT curso_id INTO v_curso_id 
  FROM public.entradas 
  WHERE id = NEW.entrada_id;
  
  -- Si no hay curso asociado, salir
  IF v_curso_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Contar lecciones totales del curso
  SELECT COUNT(*) INTO total_lecciones
  FROM public.entradas
  WHERE curso_id = v_curso_id;
  
  -- Contar lecciones completadas por el usuario en este curso
  SELECT COUNT(*) INTO lecciones_completadas
  FROM public.progreso_lecciones pl
  JOIN public.entradas e ON pl.entrada_id = e.id
  WHERE pl.user_id = NEW.user_id 
    AND e.curso_id = v_curso_id 
    AND pl.completado = TRUE;
  
  -- Si completó todas las lecciones
  IF lecciones_completadas >= total_lecciones AND total_lecciones > 0 THEN
    
    -- Actualizar inscripción a completado
    UPDATE public.inscripciones
    SET 
      estado = 'completado', 
      fecha_completado = NOW()
    WHERE user_id = NEW.user_id 
      AND curso_id = v_curso_id
      AND estado = 'inscrito';
    
    -- Obtener información para el certificado
    SELECT titulo INTO v_curso_titulo
    FROM public.cursos
    WHERE id = v_curso_id;
    
    SELECT email INTO v_user_email
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Generar certificado si no existe
    INSERT INTO public.certificados (user_id, curso_id, codigo_verificacion)
    SELECT 
      NEW.user_id, 
      v_curso_id, 
      'CERT-' || 
      TO_CHAR(NOW(), 'YYYY') || '-' || 
      UPPER(SUBSTRING(REPLACE(v_curso_titulo, ' ', ''), 1, 3)) || '-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.user_id::TEXT), 1, 8))
    WHERE NOT EXISTS (
      SELECT 1 FROM public.certificados 
      WHERE user_id = NEW.user_id AND curso_id = v_curso_id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función al completar lecciones
DROP TRIGGER IF EXISTS trigger_check_completion ON public.progreso_lecciones;
CREATE TRIGGER trigger_check_completion
  AFTER INSERT OR UPDATE ON public.progreso_lecciones
  FOR EACH ROW
  WHEN (NEW.completado = TRUE)
  EXECUTE FUNCTION public.check_curso_completion();

-- ======================
-- FUNCIÓN: Actualizar timestamp de última modificación
-- ======================

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_modificacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar última modificación en contenido_landing
DROP TRIGGER IF EXISTS update_landing_modified ON public.contenido_landing;
CREATE TRIGGER update_landing_modified
  BEFORE UPDATE ON public.contenido_landing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();

-- ======================
-- FUNCIÓN: Auto-inscribir al marcar primera lección
-- ======================

CREATE OR REPLACE FUNCTION public.auto_inscribir_curso()
RETURNS TRIGGER AS $$
DECLARE
  v_curso_id UUID;
BEGIN
  -- Obtener curso_id de la lección
  SELECT curso_id INTO v_curso_id 
  FROM public.entradas 
  WHERE id = NEW.entrada_id;
  
  -- Si hay curso asociado, crear inscripción si no existe
  IF v_curso_id IS NOT NULL THEN
    INSERT INTO public.inscripciones (user_id, curso_id)
    VALUES (NEW.user_id, v_curso_id)
    ON CONFLICT (user_id, curso_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-inscribir
DROP TRIGGER IF EXISTS trigger_auto_inscribir ON public.progreso_lecciones;
CREATE TRIGGER trigger_auto_inscribir
  BEFORE INSERT ON public.progreso_lecciones
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_inscribir_curso();

-- ======================
-- COMENTARIOS
-- ======================

COMMENT ON FUNCTION public.handle_new_user() IS 'Crea perfil automáticamente al registrar nuevo usuario';
COMMENT ON FUNCTION public.check_curso_completion() IS 'Verifica si usuario completó curso y genera certificado automático';
COMMENT ON FUNCTION public.update_modified_column() IS 'Actualiza timestamp de última modificación';
COMMENT ON FUNCTION public.auto_inscribir_curso() IS 'Inscribe automáticamente al usuario cuando marca su primera lección';
