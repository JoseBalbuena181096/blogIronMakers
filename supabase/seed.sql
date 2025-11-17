-- Datos de ejemplo para desarrollo
-- OPCIONAL: Ejecutar para poblar la base de datos con contenido de prueba

-- ======================
-- CONTENIDO LANDING PAGE
-- ======================

INSERT INTO public.contenido_landing (seccion, contenido) VALUES
('hero', '{
  "titulo": "Aprende IA y Robótica",
  "subtitulo": "Cursos prácticos con seguimiento de progreso y certificados oficiales",
  "cta_texto": "Explorar Cursos",
  "cta_url": "/cursos"
}'::jsonb),
('quienes_somos', '{
  "titulo": "Quiénes Somos",
  "contenido": "Somos un equipo de expertos en Inteligencia Artificial y Robótica dedicados a compartir conocimiento de manera accesible y práctica. Nuestra misión es formar a la próxima generación de innovadores tecnológicos."
}'::jsonb);

-- ======================
-- INTEGRANTES DEL EQUIPO
-- ======================

INSERT INTO public.integrantes_equipo (nombre, rol, bio, orden) VALUES
('Dr. Ana García', 'Directora Académica', 'PhD en Machine Learning con 15 años de experiencia en investigación y docencia.', 1),
('Ing. Carlos Ruiz', 'Instructor de Robótica', 'Especialista en sistemas autónomos y visión por computadora.', 2),
('María López', 'Desarrolladora AI', 'Experta en Deep Learning y procesamiento de lenguaje natural.', 3);

-- ======================
-- PROYECTOS DESTACADOS
-- ======================

INSERT INTO public.proyectos_destacados (titulo, descripcion, destacado) VALUES
('Robot Autónomo de Navegación', 'Sistema de navegación autónoma usando visión por computadora y deep learning.', true),
('Chatbot Educativo', 'Asistente virtual inteligente para responder dudas de estudiantes usando NLP.', true),
('Sistema de Reconocimiento Facial', 'Aplicación de seguridad con detección y reconocimiento facial en tiempo real.', true);

-- ======================
-- CURSOS DE EJEMPLO
-- ======================

INSERT INTO public.cursos (titulo, slug, descripcion, duracion_estimada, orden) VALUES
('Introducción a Python para IA', 'python-ia', 'Aprende los fundamentos de Python enfocados en Inteligencia Artificial. Desde variables hasta librerías como NumPy y Pandas.', 300, 1),
('Machine Learning Básico', 'machine-learning-basico', 'Domina los conceptos fundamentales de Machine Learning y crea tus primeros modelos predictivos.', 480, 2),
('Robótica con Arduino', 'robotica-arduino', 'Construye y programa robots desde cero usando Arduino y sensores.', 360, 3);

-- ======================
-- ENTRADAS/LECCIONES DE EJEMPLO
-- ======================

-- Curso: Python para IA
INSERT INTO public.entradas (titulo, slug, curso_id, orden_en_curso, duracion_estimada, contenido) 
SELECT 
  'Variables y Tipos de Datos', 
  'variables-tipos-datos',
  id,
  1,
  20,
  '[
    {
      "id": "1",
      "tipo": "texto",
      "orden": 1,
      "contenido": {
        "texto": "# Variables y Tipos de Datos en Python\n\nEn esta lección aprenderás los conceptos básicos de variables en Python.",
        "formato": "titulo"
      }
    },
    {
      "id": "2",
      "tipo": "codigo",
      "orden": 2,
      "contenido": {
        "codigo": "# Ejemplo de variables\nnombre = \"Juan\"\nedad = 25\naltura = 1.75\nes_estudiante = True\n\nprint(f\"Hola, soy {nombre} y tengo {edad} años\")",
        "lenguaje": "python",
        "mostrarLineas": true
      }
    }
  ]'::jsonb
FROM public.cursos WHERE slug = 'python-ia';

INSERT INTO public.entradas (titulo, slug, curso_id, orden_en_curso, duracion_estimada, contenido) 
SELECT 
  'Estructuras de Control', 
  'estructuras-control',
  id,
  2,
  25,
  '[
    {
      "id": "1",
      "tipo": "texto",
      "orden": 1,
      "contenido": {
        "texto": "# Estructuras de Control\n\nLas estructuras de control permiten tomar decisiones en tu código.",
        "formato": "titulo"
      }
    },
    {
      "id": "2",
      "tipo": "codigo",
      "orden": 2,
      "contenido": {
        "codigo": "# Condicionales\nedad = 18\n\nif edad >= 18:\n    print(\"Eres mayor de edad\")\nelse:\n    print(\"Eres menor de edad\")\n\n# Bucles\nfor i in range(5):\n    print(f\"Iteración {i}\")",
        "lenguaje": "python",
        "mostrarLineas": true
      }
    }
  ]'::jsonb
FROM public.cursos WHERE slug = 'python-ia';

INSERT INTO public.entradas (titulo, slug, curso_id, orden_en_curso, duracion_estimada, contenido) 
SELECT 
  'Funciones en Python', 
  'funciones-python',
  id,
  3,
  30,
  '[
    {
      "id": "1",
      "tipo": "texto",
      "orden": 1,
      "contenido": {
        "texto": "# Funciones en Python\n\nLas funciones son bloques de código reutilizables.",
        "formato": "titulo"
      }
    },
    {
      "id": "2",
      "tipo": "codigo",
      "orden": 2,
      "contenido": {
        "codigo": "def saludar(nombre):\n    return f\"Hola, {nombre}!\"\n\ndef suma(a, b):\n    return a + b\n\n# Uso de funciones\nprint(saludar(\"Ana\"))\nresultado = suma(5, 3)\nprint(f\"La suma es: {resultado}\")",
        "lenguaje": "python",
        "mostrarLineas": true
      }
    },
    {
      "id": "3",
      "tipo": "latex",
      "orden": 3,
      "contenido": {
        "formula": "f(x) = mx + b",
        "inline": false
      }
    }
  ]'::jsonb
FROM public.cursos WHERE slug = 'python-ia';

-- Curso: Machine Learning
INSERT INTO public.entradas (titulo, slug, curso_id, orden_en_curso, duracion_estimada, contenido) 
SELECT 
  '¿Qué es Machine Learning?', 
  'que-es-ml',
  id,
  1,
  25,
  '[
    {
      "id": "1",
      "tipo": "texto",
      "orden": 1,
      "contenido": {
        "texto": "# ¿Qué es Machine Learning?\n\nMachine Learning es una rama de la IA que permite a las computadoras aprender de datos.",
        "formato": "titulo"
      }
    },
    {
      "id": "2",
      "tipo": "video",
      "orden": 2,
      "contenido": {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "tipo": "youtube",
        "videoId": "dQw4w9WgXcQ"
      }
    }
  ]'::jsonb
FROM public.cursos WHERE slug = 'machine-learning-basico';

-- ======================
-- COMENTARIOS
-- ======================

-- Estos datos son solo para desarrollo/pruebas
-- En producción, el contenido se creará desde el panel de administración
