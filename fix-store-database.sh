#!/bin/bash
# Este script verifica y corrige la relación entre usuario y tienda
# en la base de datos para solucionar el error de clave foránea

echo "=== Diagnóstico de Relación Usuario-Tienda ==="
echo "Este script intentará corregir el problema de clave foránea"
echo "verificando y creando las relaciones necesarias en la base de datos."
echo ""

# Variables de configuración - MODIFICAR SEGÚN TU ENTORNO
DB_NAME="globaloffice"
DB_USER="postgres"
DB_HOST="localhost"
PROBLEMATIC_STORE_ID="8efc03a2-f607-4b49-9373-47dba85f86c6"

# Función para ejecutar comandos SQL
run_sql() {
  echo "Ejecutando SQL: $1"
  psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c "$1"
  return $?
}

# 1. Mostrar estructura de las tablas relevantes
echo "== 1. Mostrando estructura de tablas =="
run_sql "\d \"user\""
run_sql "\d store"
run_sql "\d product"
echo ""

# 2. Verificar si la tienda problemática existe
echo "== 2. Verificando tienda problemática =="
run_sql "SELECT * FROM store WHERE id = '$PROBLEMATIC_STORE_ID';"
echo ""

# 3. Verificar usuarios existentes
echo "== 3. Verificando usuarios existentes =="
run_sql "SELECT id, email, role FROM \"user\" LIMIT 10;"
echo ""

# 4. Verificar tiendas existentes
echo "== 4. Verificando tiendas existentes =="
run_sql "SELECT id, name, \"userId\" FROM store LIMIT 10;"
echo ""

# 5. Verificar productos existentes
echo "== 5. Verificando productos existentes =="
run_sql "SELECT id, name, \"storeId\" FROM product LIMIT 10;"
echo ""

# Preguntar si queremos crear la tienda problemática
echo "== ¿CREAR TIENDA CON ID PROBLEMÁTICO? =="
echo "¿Deseas intentar crear una tienda con el ID problemático?"
echo "Esto podría solucionar el error de clave foránea."
read -p "Responde 'si' para continuar: " RESPUESTA

if [ "$RESPUESTA" = "si" ]; then
  echo "Intentando crear la tienda problemática..."
  
  # Solicitar el ID de un usuario existente
  echo "Necesito el ID de un usuario existente de la lista anterior."
  read -p "Ingresa el ID de usuario: " USER_ID
  
  # Intentar insertar la tienda con el ID problemático
  run_sql "INSERT INTO store (id, name, \"isActive\", \"userId\") 
           VALUES ('$PROBLEMATIC_STORE_ID', 'Tienda Corregida', true, '$USER_ID');"
  
  # Verificar si se creó correctamente
  run_sql "SELECT * FROM store WHERE id = '$PROBLEMATIC_STORE_ID';"
  echo ""
else
  echo "No se realizó ninguna acción en la base de datos."
fi

echo "=== Diagnóstico completo ==="
echo "Si el problema persiste, revisa los permisos de la base de datos"
echo "y asegúrate de que la estructura de tablas sea correcta."
