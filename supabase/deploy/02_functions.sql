-- 02_functions.sql
-- Database functions

-- Function for RAG vector search
-- Includes security fix: explicit search_path
CREATE OR REPLACE FUNCTION public.match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_entrada_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entrada_id UUID,
  content_chunk TEXT,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.id,
    ev.entrada_id,
    ev.content_chunk,
    1 - (ev.embedding <=> query_embedding) AS similarity
  FROM public.entradas_vectors ev
  WHERE 1 - (ev.embedding <=> query_embedding) > match_threshold
  AND (filter_entrada_id IS NULL OR ev.entrada_id = filter_entrada_id)
  ORDER BY ev.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Handle new user creation (Profile + Admin check)
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

-- Function: Check course completion and generate certificate
CREATE OR REPLACE FUNCTION public.check_curso_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_lecciones INTEGER;
  lecciones_completadas INTEGER;
  v_curso_id UUID;
  v_curso_titulo TEXT;
  v_user_email TEXT;
BEGIN
  -- Only execute if lesson marked as completed
  IF NEW.completado = FALSE THEN
    RETURN NEW;
  END IF;

  -- Get curso_id from entry
  SELECT curso_id INTO v_curso_id 
  FROM public.entradas 
  WHERE id = NEW.entrada_id;
  
  IF v_curso_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count total lessons
  SELECT COUNT(*) INTO total_lecciones
  FROM public.entradas
  WHERE curso_id = v_curso_id;
  
  -- Count completed lessons
  SELECT COUNT(*) INTO lecciones_completadas
  FROM public.progreso_lecciones pl
  JOIN public.entradas e ON pl.entrada_id = e.id
  WHERE pl.user_id = NEW.user_id 
    AND e.curso_id = v_curso_id 
    AND pl.completado = TRUE;
  
  -- If all lessons completed
  IF lecciones_completadas >= total_lecciones AND total_lecciones > 0 THEN
    
    -- Update enrollment to completed
    UPDATE public.inscripciones
    SET 
      estado = 'completado', 
      fecha_completado = NOW()
    WHERE user_id = NEW.user_id 
      AND curso_id = v_curso_id
      AND estado = 'inscrito';
    
    -- Get info for certificate
    SELECT titulo INTO v_curso_titulo
    FROM public.cursos
    WHERE id = v_curso_id;
    
    -- Generate certificate if not exists
    -- Note: Certificates table must exist (created in schema)
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

-- Function: Update modified timestamp
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_modificacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-enroll on first lesson
CREATE OR REPLACE FUNCTION public.auto_inscribir_curso()
RETURNS TRIGGER AS $$
DECLARE
  v_curso_id UUID;
BEGIN
  -- Get curso_id
  SELECT curso_id INTO v_curso_id 
  FROM public.entradas 
  WHERE id = NEW.entrada_id;
  
  -- If course exists, enroll if not exists
  IF v_curso_id IS NOT NULL THEN
    INSERT INTO public.inscripciones (user_id, curso_id)
    VALUES (NEW.user_id, v_curso_id)
    ON CONFLICT (user_id, curso_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
