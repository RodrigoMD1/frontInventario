#!/bin/bash

# Script de corrección para la relación usuario-tienda en la base de datos
# Este script debe ejecutarse en el servidor backend

echo "===== Iniciando corrección de relación usuario-tienda ====="

# Configuración de la base de datos (ajustar según tu entorno)
DB_NAME="globaloffice"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Solicitar contraseña de forma segura
echo -n "Ingresa la contraseña de PostgreSQL para el usuario $DB_USER: "
read -s DB_PASSWORD
echo ""

# ID problemático identificado en los errores
PROBLEMATIC_ID="8efc03a2-f607-4b49-9373-47dba85f86c6"

# 1. Verificar si la tienda problemática existe
echo "1. Verificando si existe la tienda con ID problemático..."
STORE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM store WHERE id = '$PROBLEMATIC_ID';")

if [ $STORE_EXISTS -eq 0 ]; then
    echo "   ❌ La tienda problemática NO existe en la base de datos."
    
    # Buscar un usuario para asociar con esta tienda
    USER_ID=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM \"user\" LIMIT 1;")
    USER_ID=$(echo $USER_ID | xargs)  # Eliminar espacios en blanco
    
    if [ -n "$USER_ID" ]; then
        echo "   🔄 Creando tienda problemática y asociándola al usuario $USER_ID..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "INSERT INTO store (id, name, \"userId\") VALUES ('$PROBLEMATIC_ID', 'Tienda Reparada', '$USER_ID');"
        echo "   ✅ Tienda problemática creada exitosamente"
    else
        echo "   ❌ No hay usuarios en la base de datos para asociar la tienda"
    fi
else
    echo "   ✅ La tienda problemática SÍ existe en la base de datos"
fi

# 2. Verificar usuarios sin tiendas y crear tiendas para ellos
echo "2. Verificando usuarios sin tiendas..."

USERS_WITHOUT_STORES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
    SELECT u.id, u.email
    FROM \"user\" u
    LEFT JOIN store s ON u.id = s.\"userId\"
    WHERE s.id IS NULL;
")

if [ -z "$USERS_WITHOUT_STORES" ]; then
    echo "   ✅ Todos los usuarios tienen al menos una tienda asociada"
else
    echo "   ❌ Se encontraron usuarios sin tiendas asociadas. Creando tiendas..."
    
    # Guardar los resultados en un archivo temporal
    echo "$USERS_WITHOUT_STORES" > /tmp/users_without_stores.txt
    
    # Crear tiendas para cada usuario sin tienda
    while read -r USER_ID USER_EMAIL; do
        USER_ID=$(echo $USER_ID | xargs)  # Eliminar espacios en blanco
        USER_EMAIL=$(echo $USER_EMAIL | xargs)  # Eliminar espacios en blanco
        
        if [ -n "$USER_ID" ]; then
            echo "   🔄 Creando tienda para usuario $USER_ID ($USER_EMAIL)..."
            USERNAME=$(echo $USER_EMAIL | cut -d'@' -f1)
            STORE_NAME="Tienda de $USERNAME"
            
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
                INSERT INTO store (name, \"userId\")
                VALUES ('$STORE_NAME', '$USER_ID');
            "
            
            echo "   ✅ Tienda creada exitosamente para $USER_EMAIL"
        fi
    done < /tmp/users_without_stores.txt
    
    # Eliminar archivo temporal
    rm /tmp/users_without_stores.txt
fi

# 3. Verificar productos con storeIds inválidos
echo "3. Verificando productos con storeIds inválidos..."

PRODUCTS_WITH_INVALID_STORES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
    SELECT p.id, p.name, p.\"storeId\"
    FROM product p
    LEFT JOIN store s ON p.\"storeId\" = s.id
    WHERE s.id IS NULL;
")

if [ -z "$PRODUCTS_WITH_INVALID_STORES" ]; then
    echo "   ✅ Todos los productos tienen tiendas válidas asociadas"
else
    echo "   ❌ Se encontraron productos con tiendas inválidas. Corrigiendo..."
    
    # Buscar una tienda válida para asociar
    VALID_STORE_ID=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM store LIMIT 1;")
    VALID_STORE_ID=$(echo $VALID_STORE_ID | xargs)  # Eliminar espacios en blanco
    
    if [ -n "$VALID_STORE_ID" ]; then
        echo "   🔄 Usando tienda con ID $VALID_STORE_ID para asociar los productos"
        
        # Guardar los resultados en un archivo temporal
        echo "$PRODUCTS_WITH_INVALID_STORES" > /tmp/invalid_products.txt
        
        # Corregir cada producto
        while read -r PRODUCT_ID PRODUCT_NAME INVALID_STORE_ID; do
            PRODUCT_ID=$(echo $PRODUCT_ID | xargs)  # Eliminar espacios en blanco
            
            if [ -n "$PRODUCT_ID" ]; then
                echo "   🔄 Corrigiendo producto $PRODUCT_ID ($PRODUCT_NAME)..."
                
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
                    UPDATE product
                    SET \"storeId\" = '$VALID_STORE_ID'
                    WHERE id = '$PRODUCT_ID';
                "
                
                echo "   ✅ Producto corregido exitosamente"
            fi
        done < /tmp/invalid_products.txt
        
        # Eliminar archivo temporal
        rm /tmp/invalid_products.txt
    else
        echo "   ❌ No hay tiendas válidas para asociar a los productos"
    fi
fi

echo "===== Corrección de base de datos completada ====="

# Mostrar estadísticas finales
echo "Estadísticas finales:"
echo "- Usuarios: $(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"user\";") usuarios totales"
echo "- Tiendas: $(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM store;") tiendas totales"
echo "- Productos: $(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM product;") productos totales"
