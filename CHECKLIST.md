# 📋 Checklist de Configuración

Usa este archivo para llevar el control de tu progreso. Marca cada paso cuando lo completes.

## ✅ Paso 1: Setup Inicial del Proyecto
- [x] Instalar Node.js y npm
- [x] Crear proyecto Next.js
- [x] Instalar dependencias (Supabase, Tailwind, etc.)
- [x] Configurar TypeScript
- [x] Configurar Tailwind CSS
- [x] Crear estructura de carpetas
- [x] Crear tipos de TypeScript
- [x] Preparar scripts SQL
- [x] Verificar servidor funcionando

**Fecha completada**: 2025-11-17
**Tiempo**: ~30 minutos

---

## ⏳ Paso 2: Configurar Supabase
- [ ] Crear cuenta en supabase.com
- [ ] Crear nuevo proyecto
- [ ] Copiar Project URL
- [ ] Copiar anon public key
- [ ] Actualizar `.env.local` con credenciales
- [ ] Reiniciar servidor de desarrollo
- [ ] Verificar conexión

**Instrucciones detalladas**: Ver SETUP.md

---

## ⏳ Paso 3: Crear Schema de Base de Datos
- [ ] Abrir SQL Editor en Supabase
- [ ] Ejecutar `supabase/schema.sql`
- [ ] Verificar que se crearon 9 tablas
- [ ] Ejecutar `supabase/policies.sql`
- [ ] Verificar que RLS está habilitado
- [ ] Ejecutar `supabase/triggers.sql`
- [ ] Verificar que se crearon 4 funciones
- [ ] (Opcional) Ejecutar `supabase/seed.sql`
- [ ] Verificar datos de ejemplo en Table Editor

---

## ⏳ Paso 4: Configurar Supabase Storage
- [ ] Ir a Storage en Supabase
- [ ] Crear bucket `imagenes` (público)
- [ ] Crear bucket `certificados` (público)
- [ ] Configurar políticas de acceso para `imagenes`
- [ ] Configurar políticas de acceso para `certificados`
- [ ] Verificar que los buckets están públicos

---

## ⏳ Paso 5: Implementar Autenticación
- [ ] Crear archivo `middleware.ts`
- [ ] Crear layout para rutas auth
- [ ] Crear página de login (`/auth/login`)
- [ ] Crear página de registro (`/auth/register`)
- [ ] Implementar lógica de login
- [ ] Implementar lógica de registro
- [ ] Crear componente de navegación
- [ ] Probar registro de nuevo usuario
- [ ] Probar login de usuario existente
- [ ] Verificar protección de rutas admin

---

## ⏳ Paso 6: Crear Landing Page
- [ ] Diseñar hero section
- [ ] Implementar sección "Quiénes Somos"
- [ ] Crear galería de integrantes del equipo
- [ ] Mostrar proyectos destacados
- [ ] Agregar CTA para explorar cursos
- [ ] Hacer diseño responsivo
- [ ] Optimizar imágenes

---

## ⏳ Paso 7: Listado Público de Cursos
- [ ] Crear página `/cursos`
- [ ] Fetch cursos desde Supabase
- [ ] Crear componente Card de curso
- [ ] Implementar grid responsivo
- [ ] Agregar imágenes de portada
- [ ] Mostrar duración estimada
- [ ] Implementar loading states
- [ ] Agregar metadata SEO

---

## ⏳ Paso 8: Página de Curso Individual
- [ ] Crear página dinámica `/cursos/[slug]`
- [ ] Fetch detalles del curso
- [ ] Fetch lista de lecciones
- [ ] Mostrar descripción y portada
- [ ] Listar todas las lecciones numeradas
- [ ] Implementar botón "Inscribirme"
- [ ] Mostrar barra de progreso (si inscrito)
- [ ] Banner para usuarios no autenticados
- [ ] Implementar ISR

---

## ⏳ Paso 9: Visualizador de Lecciones
- [ ] Crear página `/cursos/[slug]/[leccion]`
- [ ] Fetch contenido de la lección
- [ ] Crear componente para bloques de texto
- [ ] Crear componente para bloques de imagen
- [ ] Crear componente para bloques de código
- [ ] Crear componente para bloques de LaTeX
- [ ] Crear componente para bloques de video
- [ ] Implementar syntax highlighting
- [ ] Implementar renderizado de KaTeX
- [ ] Agregar navegación prev/next
- [ ] Hacer accesible sin login

---

## ⏳ Paso 10: Sistema de Inscripciones
- [ ] Crear API route `/api/inscripciones`
- [ ] Implementar POST para inscribirse
- [ ] Implementar GET para listar inscripciones
- [ ] Validar autenticación
- [ ] Manejar errores (ya inscrito, etc.)
- [ ] Actualizar UI al inscribirse
- [ ] Mostrar confirmación visual

---

## ⏳ Paso 11: Sistema de Tracking de Progreso
- [ ] Crear API route `/api/progreso`
- [ ] Implementar POST para marcar lección completada
- [ ] Crear componente checkbox "Completar"
- [ ] Actualizar progreso en tiempo real
- [ ] Calcular porcentaje de avance
- [ ] Mostrar indicador visual en lista de lecciones
- [ ] Persistir estado en localStorage
- [ ] Sync con Supabase

---

## ⏳ Paso 12: Dashboard "Mis Cursos"
- [ ] Crear página `/mis-cursos`
- [ ] Proteger ruta (solo autenticados)
- [ ] Fetch cursos inscritos del usuario
- [ ] Calcular progreso de cada curso
- [ ] Mostrar barras de progreso visuales
- [ ] Mostrar próxima lección recomendada
- [ ] Listar certificados obtenidos
- [ ] Agregar estadísticas personales

---

## ⏳ Paso 13: Sistema de Generación de Certificados
- [ ] Crear API route `/api/certificados/generate`
- [ ] Diseñar plantilla de certificado con @react-pdf
- [ ] Implementar lógica de generación
- [ ] Generar código de verificación único
- [ ] Upload PDF a Supabase Storage
- [ ] Guardar URL en base de datos
- [ ] Trigger verificación en completación
- [ ] Crear modal de felicitación
- [ ] Implementar botón de descarga

---

## ⏳ Paso 14: Página de Verificación de Certificados
- [ ] Crear página `/certificados/verificar/[codigo]`
- [ ] Fetch certificado por código
- [ ] Mostrar datos del estudiante
- [ ] Mostrar nombre del curso
- [ ] Mostrar fecha de emisión
- [ ] Agregar marca de verificación visual
- [ ] Manejar certificado no encontrado
- [ ] Hacer página pública (sin auth)

---

## ⏳ Paso 15: Panel de Administración
- [ ] Crear layout `/admin`
- [ ] Proteger con middleware (solo admins)
- [ ] Crear dashboard con estadísticas
- [ ] Implementar CRUD de cursos
- [ ] Implementar CRUD de entradas
- [ ] Implementar gestión de landing page
- [ ] Implementar gestión de equipo
- [ ] Implementar gestión de proyectos
- [ ] Crear gráficas de progreso
- [ ] Listar certificados emitidos

---

## ⏳ Paso 16: Editor de Contenido Rico
- [ ] Crear componente editor base
- [ ] Implementar sistema de bloques
- [ ] Agregar bloque de texto
- [ ] Agregar bloque de imagen con upload
- [ ] Agregar bloque de código
- [ ] Agregar bloque de LaTeX
- [ ] Agregar bloque de video
- [ ] Agregar bloque de Markdown
- [ ] Implementar drag & drop
- [ ] Agregar preview en tiempo real
- [ ] Serializar a JSONB

---

## ⏳ Paso 17: Optimizaciones y SEO
- [ ] Implementar ISR en páginas de cursos
- [ ] Configurar revalidación (1 hora)
- [ ] Agregar metadata dinámica
- [ ] Implementar Open Graph tags
- [ ] Optimizar todas las imágenes
- [ ] Implementar lazy loading de videos
- [ ] Agregar robots.txt
- [ ] Agregar sitemap.xml
- [ ] Implementar cache de progreso
- [ ] Optimizar bundle size

---

## ⏳ Paso 18: Deployment a Vercel
- [ ] Crear repositorio en GitHub
- [ ] Push código a GitHub
- [ ] Crear cuenta en Vercel
- [ ] Conectar repositorio
- [ ] Configurar variables de entorno
- [ ] Configurar dominio (opcional)
- [ ] Verificar build exitoso
- [ ] Probar en producción
- [ ] Configurar auto-deploy desde main
- [ ] Documentar proceso de deploy

---

## 🎉 ¡Proyecto Completado!

Cuando todos los pasos estén marcados, tendrás:
- ✅ Sistema completo de blog educativo
- ✅ Autenticación con roles
- ✅ Contenido público accesible
- ✅ Sistema de progreso personalizado
- ✅ Certificados automáticos
- ✅ Panel de administración
- ✅ Editor de contenido rico
- ✅ Deployment en producción

---

## 📊 Progreso Actual

**Completados**: 1/18 pasos (6%)
**Siguiente**: Configurar Supabase

**Tiempo estimado total**: 20-30 horas
**Tiempo invertido**: ~30 minutos

---

**Última actualización**: 2025-11-17
