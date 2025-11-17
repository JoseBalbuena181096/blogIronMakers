# 🚀 Blog Educativo - Cursos de IA y Robótica

Sistema completo de blog educativo con seguimiento de progreso, certificados automáticos y panel de administración.

## 📋 Stack Tecnológico

- **Frontend/Backend**: Next.js 14+ (App Router)
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Certificados**: @react-pdf/renderer
- **Syntax Highlighting**: react-syntax-highlighter
- **Matemáticas**: KaTeX

## 🛠️ Setup Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.local.example` a `.env.local` y actualiza con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
ADMIN_EMAIL=admin@tudominio.com
```

### 3. Configurar Base de Datos

Ve a la carpeta `supabase/` y ejecuta los scripts SQL en tu proyecto de Supabase:

1. `schema.sql` - Crea todas las tablas
2. `policies.sql` - Configura Row Level Security
3. `triggers.sql` - Configura triggers para certificados automáticos

### 4. Configurar Storage

En Supabase, crear dos buckets:
- `imagenes` (público)
- `certificados` (público)

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Panel de administración
│   ├── cursos/            # Páginas de cursos públicas
│   ├── mis-cursos/        # Dashboard de usuario
│   ├── certificados/      # Verificación de certificados
│   └── api/               # API routes
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuraciones
│   └── supabase/         # Cliente de Supabase
├── types/                # Definiciones de TypeScript
└── public/               # Assets estáticos
```

## 🎯 Características Principales

### ✅ Completadas (Paso 1)
- [x] Setup de Next.js 14+ con App Router
- [x] Configuración de TypeScript
- [x] Configuración de Tailwind CSS
- [x] Cliente de Supabase (cliente y servidor)
- [x] Tipos de base de datos TypeScript
- [x] Estructura de carpetas

### 📝 Por Implementar
- [ ] Schema de base de datos completo
- [ ] Sistema de autenticación
- [ ] Landing page
- [ ] Listado público de cursos
- [ ] Visualizador de lecciones con contenido rico
- [ ] Sistema de inscripciones
- [ ] Tracking de progreso
- [ ] Generación automática de certificados
- [ ] Panel de administración
- [ ] Editor de contenido rico

## 🚦 Próximos Pasos

**Paso 2: Configurar Supabase**
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener URL y anon key
3. Actualizar `.env.local`

**Paso 3: Crear Schema de Base de Datos**
- Ejecutar SQL para crear tablas, policies y triggers

## 📚 Documentación

Para más detalles sobre la arquitectura y especificaciones, ver `Sistema.md`

## 🤝 Contribuir

Este es un proyecto educativo. Para contribuir:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT
