#!/bin/bash

# Script de verificación del setup
# Ejecuta: chmod +x scripts/verify-setup.sh && ./scripts/verify-setup.sh

echo "🔍 Verificando configuración del proyecto..."
echo ""

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js no encontrado"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm instalado: $NPM_VERSION"
else
    echo "❌ npm no encontrado"
    exit 1
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencias instaladas"
else
    echo "❌ node_modules no encontrado. Ejecuta: npm install"
    exit 1
fi

# Verificar .env.local
if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local existe"
    
    # Verificar si está configurado
    if grep -q "tu_url_de_supabase_aqui" .env.local; then
        echo "⚠️  .env.local necesita configuración"
        echo "   → Actualiza NEXT_PUBLIC_SUPABASE_URL"
        echo "   → Actualiza NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   → Actualiza ADMIN_EMAIL"
    else
        echo "✅ Variables de entorno configuradas"
    fi
else
    echo "❌ .env.local no encontrado"
    echo "   → Copia .env.local.example a .env.local"
    exit 1
fi

# Verificar archivos críticos
echo ""
echo "📁 Verificando archivos del proyecto..."

FILES=(
    "app/layout.tsx"
    "app/page.tsx"
    "app/globals.css"
    "lib/supabase/client.ts"
    "lib/supabase/server.ts"
    "types/database.ts"
    "supabase/schema.sql"
    "supabase/policies.sql"
    "supabase/triggers.sql"
    "next.config.js"
    "tailwind.config.ts"
    "tsconfig.json"
)

ALL_FOUND=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file no encontrado"
        ALL_FOUND=false
    fi
done

echo ""
if [ "$ALL_FOUND" = true ]; then
    echo "🎉 ¡Todos los archivos en su lugar!"
else
    echo "⚠️  Algunos archivos faltan"
fi

# Verificar TypeScript
echo ""
echo "🔧 Verificando compilación TypeScript..."
npx tsc --noEmit 2>&1 | head -5

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Paso 1: Setup inicial - COMPLETADO"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Lee SETUP.md"
echo "   2. Crea proyecto en supabase.com"
echo "   3. Configura .env.local con tus credenciales"
echo "   4. Ejecuta scripts SQL en Supabase"
echo "   5. Crea buckets de Storage"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
