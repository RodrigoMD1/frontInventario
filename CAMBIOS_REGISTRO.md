# Cambios en el Sistema de Registro

## Resumen de los cambios realizados

### ✅ **Antes:**
- El usuario podía elegir entre "Tienda" o "Administrador" en el registro
- Se permitía crear múltiples administradores desde el frontend

### ✅ **Ahora:**
- **Registro simplificado**: Solo se puede crear una cuenta (internamente como 'store')
- **Sin selector de rol**: Se eliminó la opción de elegir entre tienda y administrador
- **Auto-asignación**: Todos los registros nuevos se crean automáticamente como 'store'
- **Administrador único**: El verdadero administrador se configura desde la base de datos

## Cambios técnicos implementados

### 1. **Register.tsx**
- ❌ Eliminado el campo `role` del schema de validación
- ❌ Eliminado el selector HTML de tipo de cuenta
- ✅ Registro automático como 'store' 
- ✅ Texto actualizado: "Crear cuenta de administrador"
- ✅ Creación automática de tienda con nombre "Administrador de [email]"

### 2. **Flujo de registro**
```javascript
// Antes
authAPI.register(data.email, data.password, data.role) // role elegido por usuario

// Ahora  
authAPI.register(data.email, data.password, 'store') // siempre 'store'
```

### 3. **Nombres de tienda**
```javascript
// Antes
const storeName = `Tienda de ${data.email.split('@')[0]}`

// Ahora
const storeName = `Administrador de ${data.email.split('@')[0]}`
```

## Configuración del administrador real

### En la base de datos:
```sql
-- Para convertir un usuario en administrador real
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@tudominio.com';
```

### Roles del sistema:
- **'store'**: Usuarios normales (lo que se crea desde el frontend)
- **'admin'**: Administrador real (solo se configura desde BD)

## Seguridad

✅ **Ventajas del nuevo sistema:**
1. **Control total**: Solo tú puedes crear administradores reales
2. **Simplicidad**: Interfaz más limpia sin opciones confusas
3. **Consistencia**: Todos los registros son iguales inicialmente
4. **Escalabilidad**: Fácil cambiar usuarios a admin cuando sea necesario

## Notas importantes

- Los usuarios existentes no se ven afectados
- El sistema sigue funcionando igual para usuarios 'store'
- Solo el administrador real tendrá permisos especiales
- La interfaz es más clara y directa
