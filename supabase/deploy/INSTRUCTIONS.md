# 🚀 Guía Completa de Despliegue - Iron Makers Blog System

Esta guía te llevará paso a paso para desplegar un sistema completo e idéntico al proyecto actual en un nuevo proyecto de Supabase.

**Tiempo estimado:** 30-45 minutos

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))
- [ ] Supabase CLI instalado (opcional, pero recomendado para Edge Functions)
- [ ] Acceso a estos 5 archivos SQL en orden:
  - `01_schema.sql`
  - `02_functions.sql`
  - `03_policies.sql`
  - `04_data.sql`
  - `05_triggers.sql`

---

## 🏗️ PARTE 1: Crear Nuevo Proyecto en Supabase

### Paso 1.1: Crear Proyecto
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name:** `[nombre-proyecto-cliente]` (ej: "Blog Cliente ABC")
   - **Database Password:** Genera una contraseña segura y **guárdala en un lugar seguro**
   - **Region:** `East US (North Virginia)` (o la más cercana a tu cliente)
   - **Pricing Plan:** Free (o Pro según necesidad)
4. Haz clic en **"Create new project"**
5. ⏳ Espera 2-3 minutos mientras se crea el proyecto

---

## 💾 PARTE 2: Desplegar Base de Datos

### Paso 2.1: Abrir SQL Editor
1. En tu nuevo proyecto, ve al menú lateral izquierdo
2. Haz clic en **"SQL Editor"** (ícono de `</>`  )
3. Haz clic en **"New query"**

### Paso 2.2: Ejecutar Script 1 - Schema (Estructura)
1. Abre el archivo `01_schema.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **"Run"** (o presiona `Ctrl+Enter`)
5. ✅ Verifica que diga "Success. No rows returned" (esto es normal)

**¿Qué hace este script?**
- Crea la extensión `vector` para IA
- Crea todas las tablas: profiles, cursos, entradas, inscripciones, progreso, quiz, vectores, proyectos, redes sociales
- Habilita Row Level Security (RLS) en todas las tablas

### Paso 2.3: Ejecutar Script 2 - Functions (Funciones)
1. En SQL Editor, haz clic en **"New query"** nuevamente
2. Abre el archivo `02_functions.sql`
3. Copia **TODO** el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**
6. ✅ Verifica que diga "Success"

**¿Qué hace este script?**
- Función `match_documents` para búsqueda semántica con IA
- Función `handle_new_user` para crear perfiles automáticamente
- Función `check_curso_completion` para generar certificados
- Función `update_modified_column` para timestamps
- Función `auto_inscribir_curso` para inscripciones automáticas

### Paso 2.4: Ejecutar Script 3 - Policies (Seguridad)
1. Nueva query → `03_policies.sql`
2. Copia y pega **TODO** el contenido
3. **Run**
4. ✅ Verifica que diga "Success"

**¿Qué hace este script?**
- Aplica 30+ políticas de seguridad optimizadas
- Define quién puede ver/editar/borrar cada tabla
- Configura permisos de admin y usuarios

### Paso 2.5: Ejecutar Script 4 - Data (Datos Iniciales)
1. Nueva query → `04_data.sql`
2. Copia y pega **TODO** el contenido
3. **Run**
4. ✅ Verifica que diga "Success"

**¿Qué hace este script?**
- Inserta niveles educativos (Preescolar → Doctorado)
- Inserta redes sociales iniciales (Facebook, TikTok)

### Paso 2.6: Ejecutar Script 5 - Triggers (Automatizaciones)
1. Nueva query → `05_triggers.sql`
2. Copia y pega **TODO** el contenido
3. **Run**
4. ✅ Verifica que diga "Success"

**¿Qué hace este script?**
- Trigger para crear perfil al registrarse
- Trigger para generar certificados al completar cursos
- Trigger para auto-inscribir usuarios
- Trigger para actualizar timestamps

---

## ⚙️ PARTE 3: Configuraciones Importantes

### Paso 3.1: Configurar Email de Admin
**Muy importante para que el primer usuario sea admin**

1. En SQL Editor, crea una **nueva query**
2. Copia y pega este comando (reemplaza con tu email):
   ```sql
   ALTER DATABASE postgres SET app.admin_email = 'tu.email@admin.com';
   ```
3. **Run**
4. ✅ Verifica que diga "Success"

**⚠️ Importante:** El primer usuario que se registre con este email será automáticamente admin.

### Paso 3.2: Obtener Credenciales del Proyecto
Necesitarás estas credenciales para configurar el frontend y Edge Functions:

1. Ve a **Settings** → **API**
2. Copia y guarda:
   - **Project URL** (ej: `https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ NUNCA la expongas en el frontend)

---

## 🔧 PARTE 4: Edge Functions (Funciones de IA)

### Paso 4.1: Preparar Variables de Entorno

En tu proyecto de Supabase:
1. Ve a **Settings** → **Edge Functions**
2. Haz clic en **"Manage secrets"**
3. Agrega estas variables:
   - `BACKEND_URL` → URL de tu backend de Python IA (ej: Railway)
   - `SUPABASE_URL` → Tu Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` → Tu service_role key

### Paso 4.2: Desplegar Funciones

Desde tu terminal en el directorio `blog`:

```bash
# Asegúrate de tener Supabase CLI instalado
supabase --version

# Si no está instalado:
# npm install -g supabase

# Vincular al proyecto (solo la primera vez)
supabase link

# Desplegar chat-proxy
supabase functions deploy chat-proxy --no-verify-jwt

# Desplegar ingest-proxy
supabase functions deploy ingest-proxy --no-verify-jwt
```

✅ Verifica que ambas funciones aparezcan en **Edge Functions** en el dashboard.

---

## 🎨 PARTE 5: Configurar Frontend

### Paso 5.1: Actualizar Variables de Entorno

En tu proyecto Next.js, crea/actualiza `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Paso 5.2: Desplegar Frontend
```bash
# Si usas Vercel
vercel --prod

# Si usas otro servicio, sigue sus instrucciones
```

---

## ✅ PARTE 6: Verificación Final

### Checklist de Verificación:

- [ ] Puedo ver las tablas en **Database** → **Tables**
- [ ] Puedo registrar un usuario nuevo
- [ ] El primer usuario con el email configurado es admin
- [ ] Puedo ver niveles educativos en la tabla `niveles_educativos`
- [ ] Las Edge Functions aparecen en **Edge Functions**
- [ ] El frontend se conecta correctamente a Supabase

### Pruebas Importantes:

1. **Registro de Usuario:**
   - Registra un usuario con el email configurado como admin
   - Verifica que aparezca en `profiles` con `rol = 'admin'`

2. **Creación de Curso:**
   - Como admin, crea un curso de prueba
   - Verifica que aparezca en la tabla `cursos`

3. **Chat IA:**
   - Prueba el chat en una lección
   - Verifica que la función `chat-proxy` funcione

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
- **Causa:** No ejecutaste los scripts en orden
- **Solución:** Ejecuta `01_schema.sql` primero

### Error: "permission denied"
- **Causa:** Las políticas RLS no se aplicaron
- **Solución:** Verifica que `03_policies.sql` se ejecutó correctamente

### Error: "operator does not exist: extensions.vector"
- **Causa:** La función `match_documents` no tiene `search_path` correcto
- **Solución:** Ya está corregido en `02_functions.sql` con `SET search_path = public, extensions`

### El primer usuario NO es admin
- **Causa:** No configuraste `app.admin_email`
- **Solución:** Ejecuta el comando del Paso 3.1

### Edge Functions no funcionan
- **Causa:** Variables de entorno no configuradas
- **Solución:** Verifica las secrets en **Settings** → **Edge Functions**

---

## 📊 Siguiente: Migrar Datos (Opcional)

Si necesitas migrar datos del proyecto original:

### Opción 1: Export/Import Manual
1. Exporta datos de tablas específicas usando SQL Editor
2. Importa en el nuevo proyecto

### Opción 2: pg_dump
```bash
# En el proyecto ORIGINAL, exporta datos
pg_dump --data-only "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > data_backup.sql

# En el proyecto NUEVO, importa datos
psql "postgresql://postgres:[PASSWORD]@db.[NEW-PROJECT-REF].supabase.co:5432/postgres" < data_backup.sql
```

---

## 📝 Notas Finales

- Este paquete de despliegue representa el **estado actual** del proyecto original
- NO incluye datos de usuarios, cursos, o contenido
- Incluye **toda la estructura, funcionalidad y seguridad**
- Puedes usarlo para múltiples clientes, cada uno con su propio contenido

**Tiempo total estimado:** 30-45 minutos ⏱️

---

## 📮 Soporte

Si encuentras problemas:
1. Verifica que seguiste todos los pasos en orden
2. Revisa la sección de Troubleshooting
3. Verifica los logs en Supabase Dashboard → **Logs**
