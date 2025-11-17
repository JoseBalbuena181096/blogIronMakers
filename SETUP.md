# 📝 Instrucciones para Configurar Supabase

## ✅ Paso 1 Completado

Has completado exitosamente el setup inicial del proyecto:
- ✅ Next.js 14+ instalado y funcionando
- ✅ TypeScript configurado
- ✅ Tailwind CSS configurado
- ✅ Dependencias instaladas (@supabase/ssr, @react-pdf/renderer, etc.)
- ✅ Cliente de Supabase preparado
- ✅ Tipos de TypeScript definidos
- ✅ Scripts SQL listos (schema, policies, triggers, seed)
- ✅ Servidor corriendo en http://localhost:3000

## 🚀 Paso 2: Configurar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Completa los datos:
   - **Name**: blog-educativo
   - **Database Password**: [genera una contraseña segura]
   - **Region**: elige la más cercana a ti
   - **Plan**: Free (para empezar)
5. Click en "Create new project"
6. Espera 2-3 minutos a que se inicialice

### 2. Obtener Credenciales

Una vez creado el proyecto:

1. En el dashboard, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como: https://xxxxx.supabase.co)
   - **anon public key** (empieza con eyJ...)

### 3. Configurar Variables de Entorno

1. Abre el archivo `.env.local` en tu proyecto
2. Reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_EMAIL=tu-email@ejemplo.com
```

**IMPORTANTE**: El `ADMIN_EMAIL` debe ser el email que usarás para el administrador principal. Este usuario tendrá permisos de admin automáticamente.

### 4. Ejecutar Scripts SQL

Ahora vamos a crear las tablas en Supabase:

#### Opción A: SQL Editor (Recomendado)

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Ejecuta cada archivo en orden:

   **a) schema.sql**
   - Click en "New query"
   - Copia y pega todo el contenido de `supabase/schema.sql`
   - Click en "Run" (esquina inferior derecha)
   - Deberías ver "Success. No rows returned"

   **b) policies.sql**
   - Nueva query
   - Copia y pega `supabase/policies.sql`
   - Run
   
   **c) triggers.sql**
   - Nueva query
   - Copia y pega `supabase/triggers.sql`
   - Run

   **d) seed.sql (OPCIONAL)**
   - Nueva query
   - Copia y pega `supabase/seed.sql`
   - Run
   - Esto crea datos de ejemplo para desarrollo

#### Opción B: Línea de comandos (Avanzado)

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Login
supabase login

# Ejecutar scripts
supabase db execute -f supabase/schema.sql
supabase db execute -f supabase/policies.sql
supabase db execute -f supabase/triggers.sql
supabase db execute -f supabase/seed.sql
```

### 5. Configurar Storage

Necesitamos dos buckets para almacenar archivos:

1. En el dashboard, ve a **Storage**
2. Click en "Create a new bucket"

   **Bucket 1: imagenes**
   - Name: `imagenes`
   - Public bucket: ✅ SÍ (activar)
   - Click "Create bucket"
   
   **Bucket 2: certificados**
   - Name: `certificados`
   - Public bucket: ✅ SÍ (activar)
   - Click "Create bucket"

3. Configurar políticas de acceso:

   Para cada bucket, click en los 3 puntos > "Edit Policies":
   
   **Para imagenes:**
   ```sql
   -- Policy: Public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'imagenes');

   -- Policy: Authenticated users can upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'imagenes' AND auth.role() = 'authenticated');
   ```

   **Para certificados:**
   ```sql
   -- Policy: Public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'certificados');

   -- Policy: System can upload certificates
   CREATE POLICY "System can upload certificates"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'certificados');
   ```

### 6. Configurar Autenticación

1. Ve a **Authentication** > **Providers**
2. Habilita "Email" provider (debería estar activo por defecto)
3. Configura opciones:
   - **Enable Email Confirmations**: OFF (para desarrollo)
   - En producción, actívalo y configura un servicio de email

### 7. Verificar Configuración

Reinicia tu servidor de desarrollo:

```bash
# Ctrl+C para detener
npm run dev
```

Visita http://localhost:3000 - deberías ver la página de inicio con el checklist actualizado.

### 8. Crear Usuario Admin de Prueba

1. Ve a **Authentication** > **Users** en Supabase
2. Click en "Add user" > "Create new user"
3. Email: el mismo que pusiste en `ADMIN_EMAIL`
4. Password: una contraseña temporal
5. Click "Create user"
6. Auto-confirm user: ✅ SÍ

Ahora este usuario tendrá permisos de administrador automáticamente (gracias al trigger que creamos).

## ✅ Verificación

Para verificar que todo funciona:

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas estas tablas:
   - profiles
   - cursos
   - entradas
   - inscripciones
   - progreso_lecciones
   - certificados
   - contenido_landing
   - integrantes_equipo
   - proyectos_destacados

3. Si ejecutaste `seed.sql`, deberías ver datos de ejemplo en las tablas.

## 🎯 Siguiente Paso

Una vez completado todo esto, estaremos listos para:

**Paso 3: Implementar Sistema de Autenticación**
- Crear páginas de login/register
- Middleware para proteger rutas
- Componente de navegación con estado de usuario

---

## 🆘 Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste correctamente la URL y la anon key
- Asegúrate de que no hay espacios extra
- Reinicia el servidor después de cambiar `.env.local`

### Error: "relation does not exist"
- Verifica que ejecutaste todos los scripts SQL
- Revisa el SQL Editor por errores
- Asegúrate de ejecutar en orden: schema → policies → triggers

### Error: "permission denied for table"
- Verifica que las RLS policies se crearon correctamente
- Ejecuta `policies.sql` nuevamente
- Revisa que el email del admin coincida con `ADMIN_EMAIL`

### Storage no funciona
- Verifica que los buckets son públicos
- Revisa las políticas de acceso
- Asegúrate de que el nombre del bucket es correcto

---

## 📚 Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

¿Listo para continuar? Avísame cuando hayas completado la configuración de Supabase y continuaremos con el Paso 3.
