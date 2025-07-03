# Configuración de MercadoPago para Pruebas

Esta guía te ayudará a configurar MercadoPago con cuentas de prueba reales para poder probar el flujo completo de pagos.

## Paso 1: Crear Cuenta en MercadoPago

1. Ve a https://www.mercadopago.com.mx/
2. Crea una cuenta gratuita de desarrollador
3. Confirma tu email

## Paso 2: Crear Aplicación

1. Ve a https://www.mercadopago.com.mx/developers/
2. Haz clic en "Crear aplicación"
3. Llena los datos:
   - **Nombre**: GlobalOffice Inventario
   - **Modelo de integración**: Checkout Pro
   - **URL de la aplicación**: http://localhost:5173
4. Guarda la aplicación

## Paso 3: Obtener Credenciales de Prueba

1. En el panel de desarrolladores, ve a tu aplicación
2. Haz clic en "Credenciales"
3. **IMPORTANTE**: Asegúrate de estar en la pestaña "Pruebas" (NO Producción)
4. Copia las siguientes credenciales:
   - **Public Key**: Comienza con `TEST-` (ej: TEST-a1b2c3d4...)
   - **Access Token**: Comienza con `TEST-` (ej: TEST-1234567890...)

## Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto y reemplaza:

```properties
# MercadoPago - Credenciales REALES de PRUEBA
VITE_MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY_DE_PRUEBA_AQUI
VITE_MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_PRUEBA_AQUI
```

## Paso 5: Cuentas de Prueba para Pagos

MercadoPago te proporciona usuarios de prueba para simular pagos:

### Comprador de Prueba (Para simular compras)
- **Email**: test_user_123456@testuser.com
- **Password**: qatest123456
- **País**: México

### Vendedor de Prueba (Para recibir pagos)
- **Email**: test_user_789012@testuser.com
- **Password**: qatest789012
- **País**: México

## Paso 6: Tarjetas de Prueba

Para simular diferentes tipos de pago, usa estas tarjetas:

### Pagos Aprobados
- **Visa**: 4170068810108732
- **Mastercard**: 5031433215406351
- **CVV**: 123
- **Fecha de expiración**: 11/25
- **Nombre**: APRO (para aprobado)

### Pagos Rechazados
- **Visa**: 4013540682746260
- **CVV**: 123
- **Fecha de expiración**: 11/25
- **Nombre**: OTHE (para otros errores)

### Pagos Pendientes
- **Visa**: 4013540682746260
- **CVV**: 123
- **Fecha de expiración**: 11/25
- **Nombre**: CONT (para contingencia)

## Paso 7: Probar el Flujo

1. Inicia el frontend: `npm run dev`
2. Ve a la página de suscripciones
3. Selecciona un plan de pago
4. Completa el proceso con las tarjetas de prueba
5. Verifica que regrese a las URLs de callback correctas

## URLs de Callback

El sistema está configurado para redirigir a:
- **Éxito**: http://localhost:5173/payment/success
- **Fallo**: http://localhost:5173/payment/failure
- **Pendiente**: http://localhost:5173/payment/pending

## Logs y Debugging

- Abre las herramientas de desarrollador en el navegador
- Ve a la consola para ver los logs del proceso de pago
- Los errores aparecerán con emojis para fácil identificación

## Notas Importantes

- **NUNCA** uses credenciales de producción en desarrollo
- Las credenciales de prueba siempre comienzan con `TEST-`
- Los pagos de prueba NO implican dinero real
- Puedes hacer tantas pruebas como quieras sin costo

## Problemas Comunes

### Error: "Credenciales inválidas"
- Verifica que uses credenciales de PRUEBA (comienzan con TEST-)
- Asegúrate de no tener espacios extra en el .env

### Error: "No se puede crear la preferencia"
- Verifica tu conexión a internet
- Comprueba que las credenciales sean correctas
- Revisa la consola del navegador para más detalles

### Pago no redirige correctamente
- Verifica que las URLs de callback estén correctas
- Asegúrate de que el servidor local esté corriendo en el puerto correcto

## Siguiente Paso: Integración Backend

Una vez que funcione el frontend, necesitarás:
1. Implementar endpoints en el backend para crear preferencias
2. Configurar webhooks para recibir notificaciones de pago
3. Actualizar el estado de suscripción del usuario tras pago exitoso
