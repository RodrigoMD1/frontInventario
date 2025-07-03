# 🧪 Cómo Probar los Pagos con MercadoPago - GlobalOffice

Este documento te guía paso a paso para probar completamente la integración de pagos con MercadoPago.

## ✅ Estado Actual

El sistema está configurado con:
- ✅ Integración completa con MercadoPago SDK
- ✅ Flujo de pagos con planes de suscripción
- ✅ Páginas de resultado (éxito, fallo, pendiente)
- ✅ Verificación de estado de pagos
- ✅ Simulación de pagos para desarrollo
- ✅ Herramientas de testing incluidas

## 🚀 Pasos para Configurar y Probar

### Paso 1: Configurar Credenciales de MercadoPago

1. **Crear cuenta en MercadoPago:**
   - Ve a https://www.mercadopago.com.mx/
   - Crea una cuenta gratuita

2. **Crear aplicación:**
   - Ve a https://www.mercadopago.com.mx/developers/
   - Crea una nueva aplicación
   - Elige "Checkout Pro" como modelo de integración

3. **Obtener credenciales de prueba:**
   - En tu aplicación, ve a "Credenciales"
   - **IMPORTANTE**: Usa la pestaña "Pruebas" (NO "Producción")
   - Copia tu Public Key (comienza con TEST-)
   - Copia tu Access Token (comienza con TEST-)

4. **Configurar .env:**
   ```properties
   VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
   VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui
   ```

### Paso 2: Verificar Configuración

```bash
# Ejecutar verificación automática
node check-mercadopago.cjs
```

Deberías ver todos los elementos marcados como ✅.

### Paso 3: Iniciar la Aplicación

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar desarrollo
npm run dev
```

### Paso 4: Probar el Flujo Completo

#### Opción A: Prueba en la Aplicación
1. Ve a http://localhost:5173
2. Regístrate/inicia sesión
3. Ve a "Planes de Suscripción"
4. Selecciona un plan de pago (Básico o Premium)
5. Haz clic en "Elegir Plan"
6. Serás redirigido a MercadoPago

#### Opción B: Prueba Rápida (Standalone)
1. Abre `test-mercadopago.html` en tu navegador
2. Configura tus credenciales
3. Selecciona un plan
4. Haz clic en "Probar Pago"

### Paso 5: Simular Diferentes Tipos de Pago

Usa estas tarjetas de prueba en el checkout de MercadoPago:

#### ✅ Pago Aprobado
- **Tarjeta:** 4170 0688 1010 8732
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** APRO

#### ❌ Pago Rechazado
- **Tarjeta:** 4013 5406 8274 6260
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** OTHE

#### ⏳ Pago Pendiente
- **Tarjeta:** 4013 5406 8274 6260
- **CVV:** 123
- **Fecha:** 11/25
- **Nombre:** CONT

### Paso 6: Verificar Resultados

Después de completar el pago, verificar:

1. **Redirección correcta** a las páginas de resultado
2. **Información del pago** mostrada correctamente
3. **Actualización del plan** del usuario (en caso de éxito)
4. **Logs en consola** para debugging

## 🛠️ Herramientas de Testing Incluidas

### 1. Script de Verificación
```bash
node check-mercadopago.cjs
```
Verifica que todo esté configurado correctamente.

### 2. Página de Pruebas Standalone
`test-mercadopago.html` - Interface web para probar pagos sin necesidad de la app completa.

### 3. Backend Testing
```bash
node test-backend.js
```
Prueba los endpoints del backend (registro, login, etc.).

### 4. Simulación de Pagos
En `SubscriptionPlans.tsx` hay un botón "Simular Pago" que no requiere MercadoPago real.

## 🔍 Debugging y Logs

### Consola del Navegador
- Abre herramientas de desarrollador (F12)
- Ve a la pestaña "Console"
- Los logs usan emojis para fácil identificación:
  - 💰 = Creación de pago
  - ✅ = Operación exitosa
  - ❌ = Error
  - 🔄 = Simulación/desarrollo

### Network Tab
- Ve a "Network" en herramientas de desarrollador
- Filtra por "XHR" para ver las llamadas a la API
- Revisa las respuestas de MercadoPago

## 🚨 Problemas Comunes y Soluciones

### ❌ "Credenciales inválidas"
- Verifica que las credenciales comiencen con "TEST-"
- Asegúrate de estar en la pestaña "Pruebas" en MercadoPago
- No uses credenciales de "Producción"

### ❌ "Error al crear preferencia"
- Verifica tu conexión a internet
- Confirma que las credenciales sean correctas
- Revisa la consola para errores específicos

### ❌ "Pago no redirige"
- Verifica que las URLs de callback sean correctas
- Asegúrate de que el servidor esté corriendo en puerto 5173
- Revisa que no haya bloqueadores de pop-ups

### ❌ CORS errors
- Los pagos reales van directamente a MercadoPago (no hay CORS)
- Si ves errores CORS, puede ser por desarrollo local

## 🎯 Flujos de Prueba Recomendados

### Flujo 1: Pago Exitoso Completo
1. Seleccionar plan Premium ($59)
2. Usar tarjeta APRO (4170 0688 1010 8732)
3. Completar pago
4. Verificar redirección a /payment/success
5. Confirmar actualización del plan de usuario

### Flujo 2: Pago Rechazado
1. Seleccionar plan Básico ($29)
2. Usar tarjeta OTHE (4013 5406 8274 6260)
3. Intentar pago
4. Verificar redirección a /payment/failure
5. Confirmar que no se actualiza el plan

### Flujo 3: Pago Pendiente
1. Seleccionar cualquier plan
2. Usar tarjeta CONT (4013 5406 8274 6260)
3. Completar flujo
4. Verificar redirección a /payment/pending
5. Plan queda en estado original

## 📈 Próximos Pasos (Backend)

Una vez que el frontend funcione correctamente:

1. **Implementar endpoints de pago en NestJS:**
   - POST /payments/create-preference
   - POST /payments/webhook
   - GET /payments/verify/:id

2. **Actualizar usuario tras pago exitoso:**
   - Webhook para recibir notificaciones de MercadoPago
   - Actualizar campo `plan` en la base de datos
   - Notificar al usuario por email

3. **Seguridad:**
   - Mover credenciales de acceso al backend
   - Validar webhooks con firma de MercadoPago
   - Rate limiting en endpoints de pago

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador
2. Ejecuta `node check-mercadopago.cjs`
3. Verifica los logs del backend
4. Consulta la documentación oficial de MercadoPago

## 🎉 ¡A Probar!

Todo está listo para probar. Sigue los pasos y podrás ver el flujo completo de pagos funcionando con cuentas de prueba reales de MercadoPago.

**Recuerda:** Estás usando credenciales de prueba, no se procesará dinero real. ¡Puedes hacer tantas pruebas como quieras!
