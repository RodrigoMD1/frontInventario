#!/bin/bash

echo "🚀 Iniciando servidor de desarrollo..."
echo "⚡ Limpiando caché de Vite..."

# Limpiar caché
rm -rf node_modules/.vite
rm -rf dist
rm -f tsconfig.tsbuildinfo

echo "✅ Caché limpiado"
echo "🔄 Iniciando servidor..."

# Iniciar servidor
npm run dev
