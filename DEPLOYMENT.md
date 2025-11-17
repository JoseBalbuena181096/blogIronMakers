# 🚀 Guía de Deployment a Vercel

## Pasos para Deployment

### 1. Preparar el Proyecto

```bash
# Asegurar que todo compile sin errores
npm run build

# Verificar que no haya warnings críticos
npm run lint
```

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit - Blog Educativo completo"
git branch -M main
git remote add origin <tu-repositorio-github>
git push -u origin main
```

### 3. Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com) y hacer login
2. Click en "Add New" → "Project"
3. Importar tu repositorio de GitHub
4. Configurar el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4. Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=tu@email.com
```

**Importante:** Agregar para todos los entornos (Production, Preview, Development)

### 5. Verificar Supabase

En Supabase Dashboard → Authentication → URL Configuration:

Agregar tu dominio de Vercel:
- `https://tu-proyecto.vercel.app`
- `https://tu-dominio-personalizado.com` (si usas uno)

### 6. Deploy

Click en "Deploy" y esperar ~2 minutos

Tu sitio estará en: `https://tu-proyecto.vercel.app`

## Redeploys Automáticos

Cada push a `main` desplegará automáticamente:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

## Dominio Personalizado (Opcional)

1. Vercel Dashboard → Settings → Domains
2. Agregar tu dominio
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación DNS (~24h máximo)

## Verificación Post-Deploy

✅ **Checklist:**

- [ ] Landing page carga correctamente
- [ ] Login/Registro funciona
- [ ] Se pueden ver cursos
- [ ] Se puede inscribir a un curso (con cuenta)
- [ ] Progreso se guarda correctamente
- [ ] Panel admin accesible (con cuenta admin)
- [ ] Se pueden crear cursos desde admin
- [ ] Se pueden crear lecciones desde admin
- [ ] Imágenes se suben a Storage
- [ ] Dark mode funciona

## Troubleshooting

### Error: "Invalid supabase URL"
- Verificar variables de entorno en Vercel
- Asegurar que empiezan con `NEXT_PUBLIC_`

### Error: "Failed to fetch"
- Verificar CORS en Supabase
- Agregar dominio de Vercel en Authentication

### Error 500 en producción
- Ver logs en Vercel Dashboard → Deployments → Logs
- Verificar que todas las variables estén configuradas

### Imágenes no cargan
- Verificar políticas de Storage en Supabase
- Confirmar que buckets sean públicos

## Monitoreo

### Analytics (Vercel)
- Dashboard → Analytics
- Ver páginas más visitadas
- Tiempo de carga
- Errores

### Base de Datos (Supabase)
- Dashboard → Database → Query Performance
- Ver queries lentas
- Optimizar índices si es necesario

## Optimizaciones Post-Deploy

1. **Configurar caché de imágenes:**
   ```js
   // next.config.js
   images: {
     domains: ['*.supabase.co'],
   }
   ```

2. **Habilitar Edge Functions (opcional):**
   - Para mejor performance global

3. **Configurar revalidación:**
   ```tsx
   // En páginas estáticas
   export const revalidate = 3600; // 1 hora
   ```

## Backup

**Supabase:**
- Settings → Database → Backups
- Habilitar backups automáticos diarios

**Código:**
- GitHub mantiene histórico completo
- Tags para versiones importantes:
  ```bash
  git tag -a v1.0.0 -m "Primera versión estable"
  git push origin v1.0.0
  ```

## Soporte

- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)

---

**¡Tu plataforma educativa está en producción! 🎉**
