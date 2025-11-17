# 🎓 Blog Educativo - Sistema de Cursos Online

Sistema completo de gestión de cursos educativos con autenticación, tracking de progreso, generación automática de certificados y panel de administración.

## 📋 Características Principales

### Frontend Público
- 🏠 **Landing Page Dinámica** - Contenido personalizable desde base de datos
- 📚 **Catálogo de Cursos** - Navegación pública de todos los cursos disponibles
- 📖 **Visualizador de Lecciones** - Renderizado de contenido rico:
  - Bloques de texto con formatos
  - Código con syntax highlighting (Python, JavaScript, TypeScript, etc.)
  - Fórmulas matemáticas con LaTeX
  - Imágenes con caption
  - Videos embebidos (YouTube, Vimeo)
- 📊 **Tracking de Progreso** - Sistema de seguimiento por lección
- 🏆 **Certificados Automáticos** - Generación al completar 100% del curso
- 👤 **Panel de Usuario** - Vista de cursos inscritos, progreso y certificados

### Panel de Administración
- 📈 **Dashboard** - Estadísticas en tiempo real (usuarios, cursos, inscripciones)
- ✏️ **Gestión de Cursos** - CRUD completo (crear, editar, eliminar, ordenar)
- 📝 **Gestión de Lecciones** - Editor de contenido con bloques JSONB
- 👥 **Actividad Reciente** - Monitoreo de inscripciones y progreso

### Seguridad y Autenticación
- 🔐 **Autenticación con Supabase** - Login/registro seguro
- 🛡️ **Row Level Security (RLS)** - Políticas de acceso por tabla
- 👮 **Roles de Usuario** - Sistema admin/user
- 🚪 **Middleware de Protección** - Rutas protegidas por rol

## 🚀 Tecnologías

- **Framework:** Next.js 16 con App Router y Turbopack
- **Lenguaje:** TypeScript 5.9
- **Estilos:** Tailwind CSS 3.x
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** @supabase/ssr v2.81
- **Renderizado:**
  - `react-syntax-highlighter` - Highlighting de código
  - `katex` y `react-katex` - Fórmulas matemáticas
  - `@react-pdf/renderer` - Generación de certificados PDF

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta de Supabase (gratuita)

### 1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd blog
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=tu@email.com
```

### 4. Configurar Base de Datos

Ejecutar los scripts SQL en Supabase en este orden:

1. `supabase/schema.sql` - Crear 9 tablas
2. `supabase/policies.sql` - Configurar RLS
3. `supabase/triggers.sql` - Funciones automáticas
4. `supabase/seed.sql` - Datos de prueba (opcional)
5. `supabase/storage-policies.sql` - Políticas de Storage

O usar el script automatizado:
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

### 5. Configurar Storage en Supabase

Crear los siguientes buckets públicos:
- `imagenes` - Para portadas e imágenes
- `certificados` - Para PDFs

### 6. Iniciar servidor
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura

```
blog/
├── app/
│   ├── auth/              # Login/Registro
│   ├── admin/            # Panel admin
│   ├── cursos/           # Páginas públicas
│   ├── mis-cursos/       # Panel usuario
│   └── page.tsx          # Landing
├── components/           # Componentes React
├── lib/supabase/        # Clientes Supabase
├── supabase/            # Scripts SQL
├── types/               # TypeScript types
└── middleware.ts        # Protección rutas
```

## 🗄️ Base de Datos

### 9 Tablas
- profiles, cursos, entradas, inscripciones
- progreso_lecciones, certificados
- contenido_landing, integrantes_equipo, proyectos_destacados

### Triggers Automáticos
- Crea perfil al registrarse
- Genera certificado al 100%

## 🎨 Formato de Contenido

Ejemplo de lección con bloques JSONB:

```json
[
  {
    "id": "bloque_1",
    "tipo": "texto",
    "orden": 0,
    "contenido": { "texto": "Introducción", "formato": "titulo" }
  },
  {
    "id": "bloque_2",
    "tipo": "codigo",
    "orden": 1,
    "contenido": {
      "codigo": "def hola():\n    print('Hola')",
      "lenguaje": "python",
      "mostrarLineas": true
    }
  },
  {
    "id": "bloque_3",
    "tipo": "latex",
    "orden": 2,
    "contenido": { "formula": "E = mc^2", "inline": false }
  }
]
```

**Tipos soportados:** texto, codigo, latex, imagen, video, markdown

## 👤 Uso

### Estudiantes
1. Registrarse en `/auth/register`
2. Explorar cursos en `/cursos`
3. Inscribirse y estudiar
4. Progreso automático
5. Certificado al finalizar

### Administradores
1. Panel en `/admin`
2. Crear cursos en `/admin/cursos/nuevo`
3. Crear lecciones en `/admin/entradas/nuevo`
4. Usar editor JSON o botones de bloques

## 🚀 Deployment en Vercel

1. Conectar repo en [vercel.com](https://vercel.com)
2. Configurar variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
3. Deploy automático

## 📝 Scripts

```bash
npm run dev    # Desarrollo
npm run build  # Build producción
npm run start  # Servidor producción
npm run lint   # ESLint
```

## 🔧 Configuración

- Primer usuario con email admin → automáticamente admin
- Triggers crean perfiles y certificados
- RLS protege todas las tablas
- Storage público lectura, autenticado escritura

## 📄 Licencia

MIT License

---

**¡Listo para enseñar! 🎓✨**
