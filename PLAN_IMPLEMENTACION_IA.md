# 📝 Plan de Implementación: Arquitectura Mínima (Python FaaS)

Este documento detalla el plan de acción para integrar capacidades de IA (RAG) utilizando un servicio Serverless externo (FaaS), **alineado completamente con la estructura existente del proyecto (ver `README.md`)**.

## FASE 1: Preparación del Terreno (Supabase Existente)
**Objetivo:** Adaptar el esquema actual para soportar vectores y perfiles enriquecidos.

1.  **Verificación de Extensión**:
    - [ ] Confirmar que la extensión `vector` esté activada en Supabase.
2.  **Adaptación de Tablas Existentes**:
    - [ ] **`profiles`** (Ya existe):
        - *Acción*: Crear migración para agregar el campo `educational_level` (TEXT) si se requiere para personalizar la IA.
    - [ ] **`entradas`** (Ya existe):
        - *Nota*: No se requieren cambios estructurales. La relación se hará mediante `entradas_vectors.entrada_id`.
3.  **Creación de Nuevas Tablas**:
    - [ ] **`entradas_vectors`** (Nueva):
        - *Propósito*: Almacenar los embeddings de los bloques de contenido de `entradas`.
        - *Relación*: Foreign Key a `entradas(id)`.
        - *Campos*: `id`, `entrada_id`, `content_chunk` (texto), `embedding` (vector), `metadata` (JSONB).
4.  **Generación de Claves**:
    - [ ] Obtener `NEXT_PUBLIC_SUPABASE_URL`.
    - [ ] Obtener `SUPABASE_SERVICE_ROLE_KEY`.

## FASE 2: Ingesta de Datos (RAG) - Desde Admin
**Objetivo:** Poblar la tabla `entradas_vectors` bajo demanda desde el Panel de Administración.

1.  **Endpoint de Ingesta (Python FaaS)**:
    - [ ] Crear un endpoint `/ingest` en el servicio Python FaaS.
    - [ ] **Lógica**:
        - Recibe `entrada_id`.
        - Lee el contenido de la tabla `entradas`.
        - Procesa texto y **videos (YouTube)**.
        - Genera embeddings y guarda en `entradas_vectors`.
        - *Nota*: La existencia de registros en `entradas_vectors` indicará que está procesada.
    - [ ] **Respuesta al Frontend**:
        - `success`: Booleano.
        - `message`: Texto descriptivo.
        - `data`: Objeto con detalles adicionales (opcional).
2.  **Verificación**:
    - [ ] El endpoint debe devolver éxito/error al frontend.

## FASE 3: El Ejecutor de Python (Local -> Railway)
**Objetivo:** Desarrollar, probar localmente y finalmente desplegar la lógica de IA en Railway.

1.  **Desarrollo Local (FastAPI)**:
    - [ ] Crear proyecto Python con `FastAPI` y `LangGraph`.
    - [ ] **Endpoints Principales**: `/chat` (RAG) y `/ingest` (Admin).
    - [ ] **Endpoints de Prueba (Diagnóstico)**:
        - Crear `/health`: Retorna `{"status": "ok"}` para verificar que el servidor corre.
        - Crear `/test-db`: Consulta simple a Supabase (`SELECT count(*) FROM profiles`) para verificar conexión.
        - Crear `/test-ai`: Envía un "Hola" a OpenAI para verificar API Key.
    - [ ] **Proceso de Prueba Local**:
        1.  Ejecutar servidor: `uvicorn main:app --reload`.
        2.  Verificar salud: `curl http://localhost:8000/health`.
        3.  Verificar credenciales: `curl http://localhost:8000/test-db` y `curl http://localhost:8000/test-ai`.
        4.  Probar flujo completo: Usar Postman para enviar POST a `/chat` con un JSON `{"query": "..."}`.

2.  **Despliegue en Railway**:
    - [ ] Una vez probado localmente, subir el código a un repositorio GitHub.
    - [ ] Conectar repositorio a **Railway**.
    - [ ] Configurar variables de entorno en Railway (`SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`).
    - [ ] Obtener la URL de producción (ej. `https://mi-api-ia.up.railway.app`).

## FASE 4: El Proxy de Conexión (Edge Function en Supabase)
**Objetivo:** Túnel seguro entre Next.js y Python FaaS.

1.  **Creación de Edge Function**:
    - [ ] Crear función `chat-proxy` en Supabase.
2.  **Código TypeScript**:
    - [ ] Recibir: `query`, `user_id`, `entrada_id` (opcional, para contexto específico de una lección).
    - [ ] Validar auth con Supabase Auth (usando `auth.users` y `profiles`).
    - [ ] Forward request al Python FaaS.
3.  **Secretos**:
    - [ ] Configurar URL del servicio Python:
        - *Desarrollo*: `http://host.docker.internal:8000` (si usas Supabase local) o tu IP local.
        - *Producción*: URL de Railway.

## FASE 5: Conexión Final (Next.js en Vercel)
**Objetivo:** Integrar en la UI del Blog (Admin y Usuario) con componentes robustos.

1.  **Frontend - Admin (Botón de Ingesta)**:
    - [ ] **Componente**: `IngestButton.tsx` en `/components/admin/`.
    - [ ] **Lógica**:
        - Recibe `entrada_id`.
        - Verifica estado inicial: Consulta `entradas_vectors` (count > 0).
        - **Interacción**:
            - Click -> Estado `loading` (Spinner).
            - Llamada a API -> `POST /api/ingest` (que llama a Edge Function).
            - Éxito -> Mostrar Toast "Procesado correctamente" y deshabilitar botón.
            - Error -> Mostrar Toast de error.

2.  **Frontend - Admin (Gestión de Usuarios)**:
    - [ ] **Página**: `/app/admin/usuarios/page.tsx`.
    - [ ] **Componente**: `UsersTable.tsx`.
    - [ ] **Funcionalidad**:
        - Fetch de `profiles` con Supabase Client.
        - Columna "Nivel Educativo" con un `Select` (ComboBox).
        - **Update**: Al cambiar el valor, ejecutar `supabase.from('profiles').update(...)`.
        - Feedback visual inmediato (Optimistic UI o Toast).

3.  **Frontend - Usuario (Chat)**:
    - [ ] **Componente**: `AIChatWidget.tsx` (Flotante en la esquina inferior derecha).
    - [ ] **Estado**:
        - `isOpen`: Minimizado/Maximizado.
        - `messages`: Array de objetos `{role: 'user' | 'ai', content: string}`.
        - `isTyping`: Para mostrar indicador de "Escribiendo...".
    - [ ] **Contexto**:
        - Al abrirse en una lección, capturar `entrada_id` y `user_id`.
    - [ ] **Flujo**:
        - Usuario envía mensaje -> Add to `messages`.
        - Fetch a Edge Function -> Esperar respuesta.
        - Recibir respuesta -> Add to `messages` + Auto-scroll al final.

4.  **Variables**:
    - [ ] Configurar `NEXT_PUBLIC_AI_API_URL` apuntando a la Edge Function.

---

### Siguientes Pasos
Recomendamos comenzar por la **Fase 1**, creando la migración para `entradas_vectors` y el campo extra en `profiles`.
