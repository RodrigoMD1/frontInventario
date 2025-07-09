# GlobalOffice - Solución Temporal para Error de Creación de Productos

## Problema actual

Actualmente estás experimentando un error al intentar crear productos en el sistema:

```
QueryFailedError: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store"
```

Este error se produce porque el backend está intentando usar un ID de tienda específico (`8efc03a2-f607-4b49-9373-47dba85f86c6`) que no existe en la tabla `store` de la base de datos.

## Soluciones implementadas

Hemos implementado las siguientes soluciones temporales mientras se corrige el backend:

### 1. Hook de creación de productos con estrategias múltiples

Hemos creado un hook llamado `useProductCreation` que intenta múltiples estrategias para crear productos:

- Estrategia 1: Usar el ID de tienda verificado del usuario
- Estrategia 2: Usar el ID del usuario como ID de tienda
- Estrategia 3: Usar el ID fijo que causa el error (para depuración)
- Estrategia 4: No proporcionar un ID de tienda y dejar que el backend lo determine

### 2. Almacenamiento local de productos

Los productos se almacenan temporalmente en `localStorage` cuando la creación falla en el backend, permitiendo que los usuarios sigan trabajando incluso con errores en el servidor.

### 3. Scripts de diagnóstico y corrección

Hemos proporcionado dos scripts para diagnosticar y corregir el problema:

- `fix-store-database.sh`: Para entornos Unix/Linux con PostgreSQL instalado
- `fix-store-database.js`: Para cualquier entorno con Node.js

Estos scripts te permitirán:
- Verificar la estructura de la base de datos
- Comprobar si la tienda problemática existe
- Verificar las relaciones entre usuarios, tiendas y productos
- Crear manualmente la tienda con el ID problemático si es necesario

### 4. Documento de solución para el backend

También hemos creado el documento `SOLUCION_ERROR_STORE_DATABASE.md` con instrucciones detalladas para que el equipo de backend pueda solucionar el problema de raíz.

## Cómo usar los scripts de corrección

### Usando el script Bash (Linux/Mac/WSL)

```bash
# Modificar el script para ajustar las credenciales de base de datos
nano fix-store-database.sh

# Hacer ejecutable el script
chmod +x fix-store-database.sh

# Ejecutar
./fix-store-database.sh
```

### Usando el script Node.js (Cualquier SO)

```bash
# Instalar dependencias si es necesario
npm install pg readline

# Modificar el script para ajustar las credenciales de base de datos
# Editar el archivo fix-store-database.js

# Ejecutar
node fix-store-database.js
```

## Solución definitiva

La solución definitiva debe implementarse en el backend:

1. Asegurarse de que se respeta el ID de tienda enviado desde el frontend
2. Corregir la creación y asociación de tiendas con usuarios
3. No generar IDs fijos en el backend, sino usar los enviados desde el cliente

Una vez que el backend esté corregido, puedes eliminar el código temporal agregado en:
- `src/hooks/useProductCreation.js`
- Las modificaciones temporales en `src/components/Products/AddProduct.tsx`

## Contacto para soporte

Si tienes problemas al usar estas soluciones temporales o necesitas ayuda adicional, contacta con el equipo de desarrollo.
