-- Tabla para almacenar preguntas de quiz por entrada/lección
CREATE TABLE IF NOT EXISTS public.quiz_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL, -- Array de 4 opciones: [{"texto": "...", "es_correcta": boolean}]
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar intentos de quiz de usuarios
CREATE TABLE IF NOT EXISTS public.quiz_intentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entrada_id UUID NOT NULL REFERENCES public.entradas(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL, -- 0-100
  respuestas JSONB NOT NULL, -- {"pregunta_id": "respuesta_seleccionada"}
  fecha_intento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_quiz_preguntas_entrada ON public.quiz_preguntas(entrada_id);
CREATE INDEX IF NOT EXISTS idx_quiz_intentos_user_entrada ON public.quiz_intentos(user_id, entrada_id);

-- Habilitar RLS
ALTER TABLE public.quiz_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_intentos ENABLE ROW LEVEL SECURITY;

-- Políticas para quiz_preguntas
-- Todos pueden leer las preguntas (pero solo texto y opciones sin respuesta correcta)
CREATE POLICY "Cualquiera puede ver preguntas"
  ON public.quiz_preguntas
  FOR SELECT
  USING (true);

-- Solo admins pueden crear/editar/eliminar preguntas
CREATE POLICY "Solo admins pueden gestionar preguntas"
  ON public.quiz_preguntas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para quiz_intentos
-- Usuarios pueden ver solo sus propios intentos
CREATE POLICY "Usuarios ven sus propios intentos"
  ON public.quiz_intentos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden insertar sus propios intentos
CREATE POLICY "Usuarios pueden registrar intentos"
  ON public.quiz_intentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todos los intentos
CREATE POLICY "Admins ven todos los intentos"
  ON public.quiz_intentos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

COMMENT ON TABLE public.quiz_preguntas IS 'Preguntas de quiz de opción múltiple para cada lección';
COMMENT ON TABLE public.quiz_intentos IS 'Historial de intentos de quiz por usuario';
