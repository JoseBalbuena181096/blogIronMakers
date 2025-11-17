#!/bin/bash

# Script para ejecutar scripts SQL en Supabase
# Ejecuta: chmod +x scripts/setup-database.sh && ./scripts/setup-database.sh

echo "🗄️  Setup de Base de Datos de Supabase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}OPCIÓN 1: SQL Editor Web (Recomendado)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/zksisjytdffzxjtplwsd"
echo "2. Abre el SQL Editor (menú lateral)"
echo "3. Ejecuta cada script en ESTE ORDEN:"
echo ""
echo "   ${GREEN}✓${NC} supabase/schema.sql"
echo "   ${GREEN}✓${NC} supabase/policies.sql"
echo "   ${GREEN}✓${NC} supabase/triggers.sql"
echo "   ${GREEN}✓${NC} supabase/seed.sql (opcional - datos de ejemplo)"
echo ""
echo "Para cada script:"
echo "  - Click 'New query'"
echo "  - Copia y pega el contenido del archivo"
echo "  - Click 'Run' (esquina inferior derecha)"
echo "  - Verifica: 'Success. No rows returned'"
echo ""

echo -e "${YELLOW}OPCIÓN 2: CLI de Supabase${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Si prefieres usar la terminal:"
echo ""
echo "# 1. Instalar CLI"
echo "npm install -g supabase"
echo ""
echo "# 2. Login"
echo "supabase login"
echo ""
echo "# 3. Link al proyecto"
echo "supabase link --project-ref zksisjytdffzxjtplwsd"
echo ""
echo "# 4. Ejecutar scripts"
echo "supabase db execute -f supabase/schema.sql"
echo "supabase db execute -f supabase/policies.sql"
echo "supabase db execute -f supabase/triggers.sql"
echo "supabase db execute -f supabase/seed.sql"
echo ""

echo -e "${YELLOW}VERIFICACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Después de ejecutar los scripts, verifica en Supabase:"
echo ""
echo "1. Table Editor → Deberías ver 9 tablas:"
echo "   - profiles"
echo "   - cursos"
echo "   - entradas"
echo "   - inscripciones"
echo "   - progreso_lecciones"
echo "   - certificados"
echo "   - contenido_landing"
echo "   - integrantes_equipo"
echo "   - proyectos_destacados"
echo ""
echo "2. Si ejecutaste seed.sql, deberías ver datos de ejemplo"
echo ""
echo "3. Vuelve a http://localhost:3000 y verifica la conexión"
echo ""

echo -e "${GREEN}¡Listo! Una vez completado, continúa con el Paso 4: Storage${NC}"
echo ""
