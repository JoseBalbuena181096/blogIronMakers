# Configuración de Edge Functions en Supabase

## Problema Actual
El chat de IA muestra el error: "Lo siento, hubo un error al procesar tu mensaje"

## Causa
La Edge Function `chat-proxy` necesita la URL del backend de Railway configurada.

## Solución

### Paso 1: Obtener la URL del Backend de Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Busca el proyecto `backend_python_ia`
3. Copia la URL pública (ejemplo: `https://tu-proyecto.railway.app`)

### Paso 2: Configurar la variable en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Ve a **Settings** → **Edge Functions**
3. En la sección **Secrets**, agrega:
   - **Key**: `RAILWAY_BACKEND_URL`
   - **Value**: La URL de Railway (sin slash al final)
   - Ejemplo: `https://backend-python-ia-production.railway.app`

### Paso 3: Redesplegar las Edge Functions

Desde tu terminal local:

```bash
cd /home/jose/sistema_iron_makers/blog

# Login en Supabase (si no lo has hecho)
npx supabase login

# Link al proyecto
npx supabase link --project-ref TU_PROJECT_REF

# Deploy la función
npx supabase functions deploy chat-proxy

# Deploy también ingest-proxy si existe
npx supabase functions deploy ingest-proxy
```

### Paso 4: Verificar que el Backend esté funcionando

```bash
# Test del backend de Railway
curl https://TU-BACKEND.railway.app/health

# Debería responder:
# {"status":"ok"}
```

## Estructura de las Edge Functions

### chat-proxy
- **Ubicación**: `supabase/functions/chat-proxy/index.ts`
- **Función**: Proxy seguro entre el frontend y el backend de Railway
- **Variables requeridas**:
  - `RAILWAY_BACKEND_URL` (ejemplo: `https://backend.railway.app`)
  - `SUPABASE_URL` (auto-configurada)
  - `SUPABASE_ANON_KEY` (auto-configurada)

### ingest-proxy
- **Ubicación**: `supabase/functions/ingest-proxy/index.ts`
- **Función**: Proxy para ingestar contenido educativo
- **Variables requeridas**: Las mismas que chat-proxy

## Verificación

Después de configurar:

1. Refresca la página del blog
2. Inicia sesión
3. Abre el chat de IA
4. Envía un mensaje de prueba
5. Verifica en la consola del navegador (F12) si hay errores específicos

## Troubleshooting

### Error: FunctionsRelayError
- La función Edge no puede alcanzar el backend
- Verifica que `RAILWAY_BACKEND_URL` esté configurada correctamente
- Verifica que el backend esté desplegado y respondiendo

### Error: Unauthorized
- Problema con la autenticación
- Cierra sesión y vuelve a iniciar sesión
- Verifica que el token JWT sea válido

### Error: FunctionsFetchError
- Problema de red
- Verifica tu conexión a internet
- Verifica que Supabase esté funcionando

## Comandos útiles

```bash
# Ver logs de la función Edge
npx supabase functions logs chat-proxy --tail

# Test local de la función
npx supabase functions serve chat-proxy

# Ver todas las funciones desplegadas
npx supabase functions list
```
