-- 04_data.sql
-- Seed data for the application

-- Niveles Educativos
INSERT INTO public.niveles_educativos (nombre, grupo, orden) VALUES
    -- Preescolar
    ('Preescolar 1', 'Preescolar', 10),
    ('Preescolar 2', 'Preescolar', 11),
    ('Preescolar 3', 'Preescolar', 12),
    -- Primaria
    ('Primaria 1°', 'Primaria', 20),
    ('Primaria 2°', 'Primaria', 21),
    ('Primaria 3°', 'Primaria', 22),
    ('Primaria 4°', 'Primaria', 23),
    ('Primaria 5°', 'Primaria', 24),
    ('Primaria 6°', 'Primaria', 25),
    -- Secundaria
    ('Secundaria 1°', 'Secundaria', 30),
    ('Secundaria 2°', 'Secundaria', 31),
    ('Secundaria 3°', 'Secundaria', 32),
    -- Preparatoria / Bachillerato
    ('Preparatoria 1er Semestre', 'Preparatoria', 40),
    ('Preparatoria 2do Semestre', 'Preparatoria', 41),
    ('Preparatoria 3er Semestre', 'Preparatoria', 42),
    ('Preparatoria 4to Semestre', 'Preparatoria', 43),
    ('Preparatoria 5to Semestre', 'Preparatoria', 44),
    ('Preparatoria 6to Semestre', 'Preparatoria', 45),
    -- Superior
    ('Universidad / Licenciatura', 'Superior', 50),
    ('Maestría', 'Superior', 60),
    ('Doctorado', 'Superior', 70)
ON CONFLICT DO NOTHING;

-- Redes Sociales
INSERT INTO public.redes_sociales (nombre, url, icono, orden, visible) VALUES
('Facebook', 'https://www.facebook.com/ironmakersmex/', 'facebook', 1, true),
('TikTok', 'https://www.tiktok.com/@iron.makers.mx', 'tiktok', 2, true)
ON CONFLICT DO NOTHING;
