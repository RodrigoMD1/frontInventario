#!/bin/bash

# Script para convertir un usuario en administrador
# Este script se conecta a la base de datos y actualiza el rol de un usuario

echo "===== Convertir usuario a administrador ====="

# Configuración de la base de datos (ajustar según tu entorno)
DB_NAME="globaloffice"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Solicitar email del usuario
echo -n "Ingresa el email del usuario que deseas convertir en administrador: "
read USER_EMAIL

# Solicitar contraseña de forma segura
echo -n "Ingresa la contraseña de PostgreSQL para el usuario $DB_USER: "
read -s DB_PASSWORD
echo ""

# Verificar si el usuario existe
echo "Verificando si el usuario existe..."
USER_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"user\" WHERE email = '$USER_EMAIL';")
USER_EXISTS=$(echo $USER_EXISTS | xargs)  # Eliminar espacios en blanco

if [ "$USER_EXISTS" -eq "0" ]; then
    echo "❌ Error: No existe un usuario con el email $USER_EMAIL"
    exit 1
fi

# Obtener el ID y rol actual del usuario
USER_INFO=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT id, role FROM \"user\" WHERE email = '$USER_EMAIL';")
USER_ID=$(echo $USER_INFO | cut -d'|' -f1 | xargs)
CURRENT_ROLE=$(echo $USER_INFO | cut -d'|' -f2 | xargs)

echo "Usuario encontrado:"
echo "- ID: $USER_ID"
echo "- Email: $USER_EMAIL"
echo "- Rol actual: $CURRENT_ROLE"

if [ "$CURRENT_ROLE" = "admin" ]; then
    echo "✅ Este usuario ya tiene rol de administrador."
    exit 0
fi

# Confirmar la acción
echo ""
echo "¿Estás seguro de que deseas cambiar el rol de este usuario a 'admin'? (s/n)"
read CONFIRMATION

if [ "$CONFIRMATION" != "s" ] && [ "$CONFIRMATION" != "S" ]; then
    echo "Operación cancelada."
    exit 0
fi

# Actualizar el rol del usuario a admin
echo "Actualizando rol de usuario a admin..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "UPDATE \"user\" SET role = 'admin' WHERE id = '$USER_ID';"

# Verificar el cambio
NEW_ROLE=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT role FROM \"user\" WHERE id = '$USER_ID';")
NEW_ROLE=$(echo $NEW_ROLE | xargs)  # Eliminar espacios en blanco

if [ "$NEW_ROLE" = "admin" ]; then
    echo "✅ Usuario convertido exitosamente a administrador."
    echo "Información actualizada:"
    echo "- ID: $USER_ID"
    echo "- Email: $USER_EMAIL"
    echo "- Nuevo rol: $NEW_ROLE"
else
    echo "❌ Error: No se pudo actualizar el rol del usuario."
fi

echo ""
echo "Recuerda que el usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto."
