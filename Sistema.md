# Sistema de Blog Educativo para Cursos de IA y Robótica

Necesito construir un sistema completo de blog educativo con las siguientes especificaciones:

## Stack Tecnológico
- **Frontend/Backend**: Next.js 14+ (App Router)
- **Hosting**: Vercel
- **Base de datos**: Supabase (PostgreSQL + Auth)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS

## Estructura del Proyecto

### 1. Landing Page Pública
Debe incluir:
- Sección "Quiénes somos" (editable por admin)
- Galería de integrantes del equipo (con fotos, nombres, roles)
- Proyectos destacados de la empresa
- Call-to-action para explorar cursos
- Diseño moderno y responsivo

### 2. Sistema de Cursos y Entradas de Blog

#### Modelo de Datos:
**Cursos:**
- id, título, descripción, imagen_portada, slug, fecha_creación, duración_estimada

**Entradas/Lecciones:**
- id, título, curso_id (foreign key), slug, orden_en_curso, fecha_publicación, duración_estimada
- Contenido rico que soporta:
  - Texto formateado (rich text)
  - Imágenes (con upload a Supabase Storage)
  - Bloques de código con syntax highlighting (C++, Python, TypeScript, JavaScript, etc.)
  - Ecuaciones matemáticas en LaTeX (usar KaTeX o MathJax)
  - Videos embebidos de YouTube
  - Secciones en Markdown para contenido técnico

**Usuarios:**
- id, email, rol (user/admin), nombre, avatar, fecha_registro

**Inscripciones:**
- id, user_id, curso_id, fecha_inscripción, fecha_completado, estado (inscrito/completado)

**Progreso de Lecciones:**
- id, user_id, entrada_id, completado (boolean), fecha_completado, tiempo_dedicado

**Certificados:**
- id, user_id, curso_id, fecha_emision, codigo_verificacion (único), url_certificado

### 3. Funcionalidades por Rol

#### Usuario No Autenticado:
- Ver landing page
- **Acceso COMPLETO a todos los cursos y lecciones** (contenido público)
- Leer todas las entradas sin restricción
- Ver videos, código, ecuaciones LaTeX
- Explorar estructura completa de cursos
- **Banner/CTA animado invitando a crear cuenta para:**
  - "Lleva el control de tu progreso"
  - "Obtén certificados al completar cursos"
  - "Guarda tus cursos favoritos"

#### Usuario Autenticado (user):
- Todo lo anterior +
- **Inscribirse formalmente a cursos** (botón "Inscribirme" en cada curso)
- **Sistema de seguimiento de progreso:**
  - Checkbox en cada lección para marcar como completada
  - Barra de progreso visual por curso (ej: 7/15 lecciones completadas - 47%)
  - Historial de lecciones completadas con fechas
- **Panel "Mis Cursos"** mostrando:
  - Cursos inscritos
  - Porcentaje de avance de cada curso
  - Próxima lección recomendada
  - Tiempo estimado restante
  - Cursos completados con opción de descargar certificado
- **Certificados automáticos:**
  - Al completar el 100% de un curso, generar certificado PDF
  - Certificado incluye: nombre del estudiante, curso completado, fecha, código de verificación único
  - Galería de certificados obtenidos en perfil de usuario
  - Opción de compartir certificado (link público de verificación)

#### Administrador (admin):
- Todo lo anterior +
- Panel de administración completo con:
  - **Gestión de Cursos**: Crear, editar, eliminar cursos
  - **Gestión de Entradas**: Crear, editar, eliminar entradas/lecciones
  - Editor WYSIWYG o Markdown para crear contenido rico
  - Asignar entradas a cursos específicos
  - Reordenar lecciones dentro de cursos
  - **Gestión de Landing Page**: Editar secciones, integrantes, proyectos destacados
  - Upload de imágenes y assets
  - **Estadísticas avanzadas:**
    - Total de usuarios registrados
    - Cursos más populares (por inscripciones)
    - Tasa de completación por curso
    - Certificados emitidos
    - Gráficas de progreso
  - **Gestión de Certificados:**
    - Ver todos los certificados emitidos
    - Personalizar plantilla de certificados
    - Validar código de verificación

### 4. Sistema de Certificados (NUEVO - CRÍTICO)

#### Generación Automática:
- Cuando usuario completa 100% de lecciones de un curso:
  - Trigger automático que crea registro en tabla `certificados`
  - Generar código de verificación único (ej: CERT-2025-AI-A1B2C3)
  - Mostrar modal de felicitación: "¡Felicidades! Has completado [Nombre Curso]"
  - Botón para descargar certificado inmediatamente

#### Diseño del Certificado (PDF):
Usar librería como `@react-pdf/renderer` o `puppeteer` para generar:
- **Header:** Logo de la empresa + "Certificado de Finalización"
- **Cuerpo:**
```
  Se certifica que
  [NOMBRE DEL ESTUDIANTE]
  
  Ha completado satisfactoriamente el curso
  [NOMBRE DEL CURSO]
  
  Con una duración de [X] horas
  Finalizado el [FECHA]
  
  Código de Verificación: [CÓDIGO]
  Verificar en: [URL]/verificar/[CÓDIGO]
```
- **Footer:** Firma digital (nombre del director/admin) + fecha de emisión
- **Diseño:** Borde elegante, colores corporativos, marca de agua sutil

#### Verificación Pública:
- Ruta pública: `/certificados/verificar/[codigo]`
- Cualquier persona puede ingresar código y ver:
  - Nombre del estudiante
  - Curso completado
  - Fecha de emisión
  - Estado: "Certificado Válido ✓"
- Si código no existe: "Certificado No Encontrado"

#### Almacenamiento:
- PDFs guardados en Supabase Storage: `/certificados/{user_id}/{curso_slug}.pdf`
- URL permanente para descarga
- Opción de regenerar certificado si se pierde

### 5. Características Técnicas Requeridas

#### Editor de Contenido (Admin):
- Debe soportar bloques modulares tipo Notion/Medium:
  - Bloque de texto
  - Bloque de imagen (con upload)
  - Bloque de código (con selector de lenguaje)
  - Bloque de LaTeX
  - Bloque de video YouTube
  - Bloque Markdown
- Drag & drop para reordenar bloques
- Preview en tiempo real

#### Sistema de Progreso (Frontend):
```jsx
// Ejemplo de componente de lección con tracking
<LeccionViewer>
  <ContenidoLeccion />
  
  {isAuthenticated && (
    <CompletarLeccionButton 
      onComplete={() => {
        // Marcar como completada
        // Actualizar progreso del curso
        // Si es última lección → trigger generación certificado
      }}
    />
  )}
  
  {!isAuthenticated && (
    <InvitacionRegistro>
      📊 Regístrate para llevar el control de tu progreso y obtener certificados
    </InvitacionRegistro>
  )}
</LeccionViewer>
```

#### Autenticación:
- Login con email/password via Supabase Auth
- Verificar rol en middleware de Next.js
- Proteger solo rutas /admin y /mis-cursos (NO proteger /cursos ni /entradas)
- Detectar si email === 'admin@tudominio.com' para otorgar permisos admin

#### Base de Datos Supabase:
```sql
-- Schema completo:

-- Usuarios (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  avatar_url TEXT,
  rol TEXT DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Cursos
CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  imagen_portada TEXT,
  duracion_estimada INTEGER, -- en minutos
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Entradas/Lecciones
CREATE TABLE entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  contenido JSONB, -- bloques de contenido rico
  orden_en_curso INTEGER NOT NULL,
  duracion_estimada INTEGER, -- en minutos
  fecha_publicacion TIMESTAMP DEFAULT NOW()
);

-- Inscripciones (NUEVO)
CREATE TABLE inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  fecha_completado TIMESTAMP,
  estado TEXT DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'completado')),
  UNIQUE(user_id, curso_id)
);

-- Progreso de Lecciones (NUEVO)
CREATE TABLE progreso_lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entrada_id UUID REFERENCES entradas(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP,
  tiempo_dedicado INTEGER, -- en minutos
  UNIQUE(user_id, entrada_id)
);

-- Certificados (NUEVO - CRÍTICO)
CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  fecha_emision TIMESTAMP DEFAULT NOW(),
  codigo_verificacion TEXT UNIQUE NOT NULL,
  url_pdf TEXT, -- URL en Supabase Storage
  UNIQUE(user_id, curso_id)
);

-- Contenido Landing Page
CREATE TABLE contenido_landing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion TEXT UNIQUE NOT NULL, -- 'quienes_somos', 'mision', etc.
  contenido JSONB,
  ultima_modificacion TIMESTAMP DEFAULT NOW()
);

-- Integrantes del Equipo
CREATE TABLE integrantes_equipo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  rol TEXT,
  bio TEXT,
  foto_url TEXT,
  linkedin_url TEXT,
  orden INTEGER DEFAULT 0
);

-- Proyectos Destacados
CREATE TABLE proyectos_destacados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  url_proyecto TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  destacado BOOLEAN DEFAULT TRUE
);

-- Índices para performance
CREATE INDEX idx_entradas_curso ON entradas(curso_id);
CREATE INDEX idx_inscripciones_user ON inscripciones(user_id);
CREATE INDEX idx_progreso_user ON progreso_lecciones(user_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_verificacion);

-- Row Level Security (RLS)
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios solo ven su propio progreso
CREATE POLICY "Users can view own inscripciones"
  ON inscripciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progreso"
  ON progreso_lecciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificados"
  ON certificados FOR SELECT
  USING (auth.uid() = user_id);

-- Certificados son verificables públicamente por código
CREATE POLICY "Anyone can verify certificados by code"
  ON certificados FOR SELECT
  USING (true); -- pero solo expondremos por código en la app
```

#### Funciones de Trigger (Supabase):
```sql
-- Función para verificar si curso está completado y generar certificado
CREATE OR REPLACE FUNCTION check_curso_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_lecciones INTEGER;
  lecciones_completadas INTEGER;
  v_curso_id UUID;
BEGIN
  -- Obtener curso_id de la lección
  SELECT curso_id INTO v_curso_id 
  FROM entradas 
  WHERE id = NEW.entrada_id;
  
  -- Contar lecciones totales del curso
  SELECT COUNT(*) INTO total_lecciones
  FROM entradas
  WHERE curso_id = v_curso_id;
  
  -- Contar lecciones completadas por el usuario
  SELECT COUNT(*) INTO lecciones_completadas
  FROM progreso_lecciones pl
  JOIN entradas e ON pl.entrada_id = e.id
  WHERE pl.user_id = NEW.user_id 
    AND e.curso_id = v_curso_id 
    AND pl.completado = TRUE;
  
  -- Si completó todas, actualizar inscripción y generar certificado
  IF lecciones_completadas = total_lecciones THEN
    UPDATE inscripciones
    SET estado = 'completado', fecha_completado = NOW()
    WHERE user_id = NEW.user_id AND curso_id = v_curso_id;
    
    -- Generar certificado si no existe
    INSERT INTO certificados (user_id, curso_id, codigo_verificacion)
    SELECT NEW.user_id, v_curso_id, 
           'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
    WHERE NOT EXISTS (
      SELECT 1 FROM certificados 
      WHERE user_id = NEW.user_id AND curso_id = v_curso_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función
CREATE TRIGGER trigger_check_completion
AFTER INSERT OR UPDATE ON progreso_lecciones
FOR EACH ROW
WHEN (NEW.completado = TRUE)
EXECUTE FUNCTION check_curso_completion();
```

#### Optimizaciones:
- ISR (Incremental Static Regeneration) para páginas de cursos y entradas
- Image optimization con next/image
- SEO metadata dinámico
- Carga lazy de videos y componentes pesados
- Cache de progreso del usuario en localStorage (sync con DB)

## Entregables Esperados

1. **Configuración inicial del proyecto:**
   - Setup de Next.js + Supabase
   - Configuración de variables de entorno
   - Schema de base de datos SQL completo
   - Setup de Supabase Storage para certificados

2. **Componentes principales:**
   - Layout y navegación (con indicador de progreso si está autenticado)
   - Landing page editable
   - Listado de cursos públicos (grid/cards con preview)
   - Página de curso individual con lista de lecciones y barra de progreso
   - Página de entrada/lección con:
     - Renderizado de contenido rico
     - Botón "Marcar como completada" (solo autenticados)
     - Navegación prev/next entre lecciones
   - Editor de contenido para admin (bloques modulares)
   - Panel de administración completo
   - **Dashboard "Mis Cursos"** con:
     - Cursos inscritos y progreso visual
     - Certificados obtenidos (galería)
     - Estadísticas personales
   - **Componente de Certificado PDF**
   - **Página de verificación pública de certificados**
   - Modal de felicitación al completar curso

3. **Lógica de negocio:**
   - Sistema de autenticación completo
   - CRUD de cursos y entradas
   - Sistema de inscripción a cursos
   - **Sistema de tracking de progreso:**
     - Marcar lecciones como completadas
     - Calcular porcentaje de avance
     - Detectar completación de curso
   - **Sistema de generación automática de certificados:**
     - Trigger en completación
     - Generación de PDF
     - Upload a Supabase Storage
     - Código de verificación único
   - Renderizado de LaTeX, código, videos
   - Upload de imágenes a Supabase Storage

4. **Deployment:**
   - Configuración para Vercel
   - Variables de entorno en Vercel
   - Conexión con Supabase en producción
   - Setup de Supabase Storage buckets (público para certificados)

## Flujo de Trabajo Recomendado

Construye el sistema en este orden:
1. Setup inicial (Next.js + Supabase + Auth)
2. Schema de base de datos COMPLETO (incluir tablas de progreso y certificados)
3. Landing page básica
4. Sistema de autenticación
5. Listado público de cursos (acceso sin login)
6. Visualización de contenido rico de lecciones (público)
7. Sistema de inscripciones (requiere login)
8. **Sistema de tracking de progreso** (checkboxes, porcentajes)
9. Panel "Mis Cursos" con progreso visual
10. **Sistema de certificados:**
    - Generación automática al completar
    - Diseño de plantilla PDF
    - Descarga y almacenamiento
    - Página de verificación pública
11. Panel de administración (CRUD + estadísticas)
12. Editor de contenido avanzado
13. Optimizaciones y deployment

## Consideraciones Importantes

- **Acceso Público:** TODO el contenido es público. No hay paywall ni restricciones de contenido.
- **Valor del Registro:** El incentivo para registrarse es:
  - Seguimiento de progreso
  - Certificados oficiales
  - Experiencia personalizada
- **Gamificación:** Considera agregar:
  - Badges por hitos (primera lección, primer curso completado)
  - Racha de días consecutivos estudiando
  - Leaderboard opcional (top estudiantes del mes)
- **Seguridad**: Usar Row Level Security (RLS) en Supabase
- **UX**: Diseño limpio, intuitivo, mobile-first
- **Performance**: Optimizar carga de imágenes, videos y PDFs
- **Escalabilidad**: Diseñar schema pensando en miles de usuarios
- **Accesibilidad**: Semántica HTML correcta, contraste adecuado en certificados
- **Certificados Profesionales:** Deben verse premium y ser verificables

## Ejemplo de Flujo de Usuario:

### Usuario No Registrado:
1. Llega a landing → ve cursos disponibles
2. Entra a "Curso de Python" → ve todas las 15 lecciones
3. Lee "Lección 1: Variables" completa
4. Ve banner: "💡 Regístrate para guardar tu progreso y obtener certificado"
5. Continúa leyendo sin restricción

### Usuario Registrado:
1. Login → ve mismo contenido público
2. En "Curso de Python" ve botón "Inscribirme a este curso"
3. Se inscribe → ahora aparece en "Mis Cursos"
4. Abre "Lección 1: Variables" → al final aparece ✓ "Marcar como completada"
5. La marca → progreso del curso pasa de 0% a 6.7% (1/15)
6. Completa las 15 lecciones → progreso llega a 100%
7. ✨ Modal automático: "¡Felicidades! Completaste Python Básico"
8. Descarga certificado PDF con código CERT-2025-PY-A1B2C3
9. Puede compartir código para que otros verifiquen en /certificados/verificar/CERT-2025-PY-A1B2C3

---

Por favor, comienza con:
1. Setup inicial del proyecto Next.js + Supabase
2. Schema de base de datos COMPLETO (copiar SQL de arriba)
3. Configuración de autenticación básica

Luego construiremos los componentes paso a paso, priorizando el sistema de progreso y certificados.