# 🚀 Guía Completa de Despliegue en Vercel

Esta guía te llevará paso a paso para desplegar el proyecto Iron Makers Blog en Vercel.

**Tiempo estimado:** 15-20 minutos

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de GitHub con el repositorio del proyecto
- [ ] Cuenta de Vercel (gratis en [vercel.com](https://vercel.com))
- [ ] Proyecto de Supabase creado y configurado
- [ ] Variables de entorno de Supabase listas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔧 PARTE 1: Preparar Proyecto Localmente

### Paso 1.1: Verificar que el Proyecto Funciona Localmente

```bash
# Navega al directorio del proyecto
cd /ruta/a/blog

# Instala dependencias (si no lo has hecho)
npm install

# Crea archivo .env.local con tus variables
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
EOF

# Ejecuta el proyecto en desarrollo
npm run dev

# Abre http://localhost:3000 y verifica que funcione
```

✅ Verifica que:
- La página carga sin errores
- Puedes navegar entre páginas
- La conexión a Supabase funciona

### Paso 1.2: Verificar Build de Producción

```bash
# Construye el proyecto para producción
npm run build

# Si hay errores, corrígelos antes de continuar
# Si build es exitoso, continúa
```

### Paso 1.3: Subir Cambios a GitHub

```bash
# Asegúrate de tener .env.local en .gitignore
# (NUNCA subas tus keys a GitHub)

# Verifica .gitignore
cat .gitignore | grep ".env.local"

# Si no está, agrégalo
echo ".env.local" >> .gitignore

# Commitea y sube cambios
git add .
git commit -m "feat: preparar proyecto para deployment en Vercel"
git push origin main
```

---

## 🌐 PARTE 2: Configurar Vercel

### Paso 2.1: Crear Cuenta e Importar Proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** (si no tienes cuenta)
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tus repositorios
5. Una vez autenticado, haz clic en **"Add New..."** → **"Project"**

### Paso 2.2: Importar Repositorio

1. Busca tu repositorio: `sistema_iron_makers/blog` o el nombre de tu repo
2. Haz clic en **"Import"**

### Paso 2.3: Configurar Proyecto

En la pantalla de configuración:

**Framework Preset:**
- Vercel debería detectar automáticamente **"Next.js"** ✅
- Si no, selecciónalo manualmente

**Root Directory:**
- Deja como está: `./` (raíz del proyecto)

**Build and Output Settings:**
- Vercel automáticamente usa:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
- ✅ No necesitas cambiar nada aquí

---

## 🔐 PARTE 3: Variables de Entorno en Vercel

### Paso 3.1: Agregar Variables de Entorno

**Muy importante:** Agrega tus variables de entorno ANTES de hacer deploy.

1. En la pantalla de configuración, busca la sección **"Environment Variables"**
2. Haz clic para expandirla

### Paso 3.2: Agregar Variables una por una

**Variable 1: NEXT_PUBLIC_SUPABASE_URL**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://xxx.supabase.co` (tu URL de Supabase)
- **Environment:** Selecciona **Production**, **Preview**, y **Development** (todas)
- Haz clic en **"Add"**

**Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `tu_clave_anon_publica_de_supabase`
- **Environment:** Selecciona **Production**, **Preview**, y **Development** (todas)
- Haz clic en **"Add"**

**⚠️ Importante:** 
- Usa la clave `anon` (pública), NO la `service_role` (privada)
- Verifica que no haya espacios extra al copiar las claves

### Paso 3.3: Verificar Variables

Antes de continuar, verifica que tienes:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 PARTE 4: Deploy Inicial

### Paso 4.1: Iniciar Deployment

1. Después de agregar las variables de entorno, haz clic en **"Deploy"**
2. ⏳ Espera mientras Vercel:
   - Clona el repositorio
   - Instala dependencias
   - Construye el proyecto
   - Despliega en su CDN

**Tiempo estimado:** 2-5 minutos

### Paso 4.2: Monitorear el Build

Verás una pantalla de logs en tiempo real:

```
Running "npm install"
...
Running "npm run build"
...
Collecting page data
...
Build completed successfully ✓
```

✅ Si todo sale bien, verás:
- "Build completed successfully" ✓
- Un mensaje de celebración 🎉
- Un link a tu sitio web

❌ Si hay errores:
- Lee el error en los logs
- Ve a la sección de Troubleshooting al final

---

## 🎯 PARTE 5: Verificación Post-Deployment

### Paso 5.1: Abrir tu Aplicación

1. Haz clic en el botón **"Visit"** o en la URL que aparece
2. Tu aplicación se abrirá en una nueva pestaña
3. La URL será algo como: `https://blog-xxxxx.vercel.app`

### Paso 5.2: Checklist de Verificación

Prueba lo siguiente:

- [ ] La página principal carga correctamente
- [ ] Puedes navegar entre páginas
- [ ] Puedes registrar un nuevo usuario
- [ ] Puedes iniciar sesión
- [ ] Las imágenes se cargan correctamente
- [ ] El chat de IA funciona (si lo tienes configurado)
- [ ] Los cursos se muestran correctamente

### Paso 5.3: Verificar Logs (si hay problemas)

1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en la pestaña **"Deployments"**
3. Haz clic en el deployment más reciente
4. Haz clic en **"Runtime Logs"** para ver logs en tiempo real

---

## 🔧 PARTE 6: Configuración de Dominio Personalizado (Opcional)

### Paso 6.1: Agregar Dominio

Si tienes un dominio propio (ej: `blog.midominio.com`):

1. En tu proyecto de Vercel, ve a **"Settings"** → **"Domains"**
2. Haz clic en **"Add"**
3. Ingresa tu dominio: `blog.midominio.com`
4. Haz clic en **"Add"**

### Paso 6.2: Configurar DNS

Vercel te mostrará los registros DNS que necesitas agregar:

**Opción A: CNAME (recomendado)**
```
Type: CNAME
Name: blog
Value: cname.vercel-dns.com
```

**Opción B: A Record**
```
Type: A
Name: blog
Value: 76.76.21.21
```

1. Ve a tu proveedor de dominios (GoDaddy, Namecheap, etc.)
2. Agrega los registros DNS que Vercel te indicó
3. ⏳ Espera 24-48 horas para propagación DNS (usualmente es más rápido)

### Paso 6.3: Verificar Dominio

1. Regresa a Vercel después de unas horas
2. Tu dominio debería mostrar ✅ "Valid Configuration"
3. Vercel automáticamente configurará HTTPS con certificado SSL

---

## 🔄 PARTE 7: Deployments Automáticos

### Cómo Funciona

Vercel está configurado para hacer deploy automático:

- **Push a `main`:** Deploy a producción automáticamente
- **Pull Request:** Deploy de preview automáticamente
- **Push a otras ramas:** Deploy de preview

### Ejemplo de Flujo de Trabajo

```bash
# Haciendo cambios en el proyecto
git checkout -b feature/nueva-funcionalidad

# Haces cambios
# ...

# Commiteas
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Subes a GitHub
git push origin feature/nueva-funcionalidad

# Vercel automáticamente crea un preview deployment
# Recibirás un comentario en el PR con el link del preview
```

### Desactivar Auto-Deploy (si lo necesitas)

1. Ve a **"Settings"** → **"Git"**
2. En **"Production Branch"**, puedes cambiar de `main` a otra rama
3. En **"Deploy Hooks"**, puedes configurar webhooks personalizados

---

## 🔐 PARTE 8: Configuraciones Avanzadas

### Variables de Entorno por Ambiente

Si necesitas diferentes valores para desarrollo/producción:

1. Ve a **"Settings"** → **"Environment Variables"**
2. Agrega variables seleccionando solo el ambiente específico:
   - **Production:** Solo para el sitio en vivo
   - **Preview:** Para pull requests y branches
   - **Development:** Para desarrollo local con `vercel dev`

### Build Command Personalizado

Si necesitas un comando de build diferente:

1. Ve a **"Settings"** → **"General"**
2. En **"Build & Development Settings"**:
   - **Build Command:** `npm run build` (por defecto)
   - **Install Command:** `npm install` (por defecto)
   - **Output Directory:** `.next` (por defecto)

### Configurar Redirects y Rewrites

Si necesitas redirects, crea `vercel.json` en la raíz:

```json
{
  "redirects": [
    {
      "source": "/old-route",
      "destination": "/new-route",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 🆘 Troubleshooting

### Error: "Build failed"

**Causa común:** Error en el código o dependencias faltantes

**Solución:**
1. Lee el error en los logs de Vercel
2. Verifica que el build funcione localmente: `npm run build`
3. Asegúrate de que todas las dependencias estén en `package.json`

### Error: "Module not found"

**Causa:** Dependencia no instalada o ruta incorrecta

**Solución:**
```bash
# Verifica que la dependencia esté en package.json
npm install [nombre-paquete] --save

# Commitea y push
git add package.json package-lock.json
git commit -m "fix: agregar dependencia faltante"
git push
```

### Error: "Environment variable undefined"

**Causa:** Variable de entorno no configurada

**Solución:**
1. Ve a **"Settings"** → **"Environment Variables"**
2. Verifica que la variable exista
3. Verifica el nombre exacto (case-sensitive)
4. Si la agregaste después del deploy, haz **"Redeploy"**

### Página en blanco o error 500

**Causa:** Error en tiempo de ejecución

**Solución:**
1. Ve a **"Deployments"** → tu deployment → **"Runtime Logs"**
2. Lee el error
3. Verifica conexión a Supabase
4. Verifica que las variables de entorno sean correctas

### El sitio no se actualiza después de push

**Causa:** Deploy automático deshabilitado o error de Git

**Solución:**
1. Ve a **"Deployments"** y verifica si hay un nuevo deployment
2. Si no hay, ve a **"Settings"** → **"Git"** y verifica que auto-deploy esté habilitado
3. Haz un redeploy manual: **"Deployments"** → **"..."** → **"Redeploy"**

---

## 📊 PARTE 9: Monitoreo y Analytics

### Vercel Analytics (Opcional - Requiere plan Pro)

1. Ve a **"Analytics"** en tu proyecto
2. Haz clic en **"Enable Analytics"**
3. Verás métricas de:
   - Page views
   - Visitors
   - Top pages
   - Performance scores

### Uso de Recursos

Vercel Free Tier incluye:
- ✅ 100 GB de ancho de banda por mes
- ✅ Deployments ilimitados
- ✅ Serverless function execution: 100 GB-Hrs
- ✅ 6,000 build minutes por mes

Para ver tu uso:
1. Ve a tu dashboard principal
2. En la esquina superior derecha, haz clic en tu avatar
3. **"Settings"** → **"Billing"** → **"Usage"**

---

## 🎓 PARTE 10: Comandos Útiles de Vercel CLI (Opcional)

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Comandos Útiles

```bash
# Vincular proyecto local a Vercel
vercel link

# Deploy desde la línea de comandos
vercel --prod

# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls

# Más información
vercel --help
```

---

## 📝 Checklist Final

Antes de dar por terminado el deployment:

- [ ] El sitio está accesible en la URL de Vercel
- [ ] Todas las páginas cargan correctamente
- [ ] Los usuarios pueden registrarse e iniciar sesión
- [ ] Las variables de entorno están configuradas
- [ ] Los datos de Supabase se muestran correctamente
- [ ] No hay errores en Runtime Logs
- [ ] El dominio personalizado está configurado (si aplica)
- [ ] Auto-deploy está habilitado
- [ ] El equipo tiene acceso al proyecto de Vercel

---

## 🔗 Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Dominios Personalizados](https://vercel.com/docs/concepts/projects/domains)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 🎉 ¡Felicitaciones!

Tu proyecto está ahora:
- ✅ Desplegado en producción
- ✅ Accesible desde cualquier parte del mundo
- ✅ Con HTTPS automático
- ✅ Con deployments automáticos
- ✅ Escalable y rápido en el CDN de Vercel

**Tiempo total:** ~20 minutos ⏱️

---

**Próximos pasos recomendados:**

1. Configurar dominio personalizado
2. Habilitar Vercel Analytics
3. Configurar monitoring de errores (Sentry)
4. Configurar backups automáticos de Supabase
