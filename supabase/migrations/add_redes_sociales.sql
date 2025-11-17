-- Tabla para redes sociales
CREATE TABLE IF NOT EXISTS public.redes_sociales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  icono TEXT, -- Nombre del icono o clase
  orden INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar las redes sociales iniciales
INSERT INTO public.redes_sociales (nombre, url, icono, orden, visible) VALUES
('Facebook', 'https://www.facebook.com/ironmakersmex/', 'facebook', 1, true),
('TikTok', 'https://www.tiktok.com/@iron.makers.mx', 'tiktok', 2, true);

COMMENT ON TABLE public.redes_sociales IS 'Redes sociales mostradas en la landing page';
