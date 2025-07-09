#!/bin/bash

# Script para probar la API con curl
echo "🧪 Probador de API de productos con curl"
echo "========================================"

# URL del backend (ajústala según tu configuración)
API_URL="http://localhost:3000"
# Si estás usando el proxy de Vite, usa esto en su lugar:
# API_URL="http://localhost:5173/api"

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para obtener token
get_token() {
  echo -e "${BLUE}Obteniendo token de autenticación...${NC}"
  
  local EMAIL="test@example.com"
  local PASSWORD="123456"
  
  # Intenta hacer login
  local RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    $API_URL/auth/login)
  
  # Extrae el token de la respuesta
  TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: No se pudo obtener token${NC}"
    echo "Respuesta: $RESPONSE"
    return 1
  else
    echo -e "${GREEN}Token obtenido correctamente${NC}"
    return 0
  fi
}

# Función para obtener productos
get_products() {
  echo -e "\n${BLUE}Obteniendo lista de productos...${NC}"
  
  # Hace la petición
  local RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    $API_URL/products)
  
  # Muestra la respuesta formateada
  echo "$RESPONSE" | python -m json.tool 2>/dev/null || echo "$RESPONSE"
}

# Función para crear un producto
create_product() {
  echo -e "\n${BLUE}Creando producto de prueba...${NC}"
  
  # Datos del producto
  local PRODUCT_DATA='{
    "name": "Producto de prueba curl",
    "price": 99.99,
    "stock": 10,
    "category": "Test",
    "description": "Producto creado desde script de curl",
    "isActive": true
  }'
  
  # Hace la petición con verbose para ver headers
  echo "Enviando petición a $API_URL/products"
  echo "Datos: $PRODUCT_DATA"
  curl -v -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$PRODUCT_DATA" \
    $API_URL/products
}

# Ejecutar pruebas
echo "🔑 Paso 1: Autenticación"
get_token

if [ $? -eq 0 ]; then
  echo "🧾 Paso 2: Listar productos"
  get_products
  
  echo "➕ Paso 3: Crear producto"
  create_product
else
  echo -e "${RED}No se pudo continuar sin token${NC}"
fi

echo -e "\n✅ Pruebas completadas"
