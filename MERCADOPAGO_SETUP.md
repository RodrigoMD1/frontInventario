# 🏦 Configuración de MercadoPago para GlobalOffice

## 📋 Pasos para Configurar Credenciales Reales de Prueba

### 1. 🔗 Crear Cuenta en MercadoPago Developers
1. Ve a: https://www.mercadopago.com.mx/developers/
2. Inicia sesión o crea una cuenta nueva
3. Acepta los términos como desarrollador

### 2. 🚀 Crear una Aplicación
1. Ve a "Tus integraciones" o "Your integrations"
2. Haz clic en "Crear aplicación"
3. Completa los datos:
   - **Nombre**: GlobalOffice
   - **Descripción**: Sistema de inventario empresarial con suscripciones
   - **Sitio web**: http://localhost:5176 (para desarrollo)
   - **Categoría**: SaaS/Software
4. Guarda la aplicación

### 3. 🔑 Obtener Credenciales de Prueba
1. Ve a la sección "Credenciales" de tu aplicación
2. **IMPORTANTE**: Asegúrate de estar en la pestaña "**Pruebas**" (NO Producción)
3. Copia las siguientes credenciales:
   - **Public Key** (empieza con `TEST-...`)
   - **Access Token** (empieza con `TEST-...`)

### 4. ⚙️ Configurar Variables de Entorno
Edita el archivo `.env` en la raíz del proyecto:

```env
# MercadoPago - Credenciales de PRUEBA
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui
```

### 5. 💳 Tarjetas de Prueba de MercadoPago

Para probar pagos, usa estas tarjetas de prueba:

#### ✅ **Tarjetas que APRUEBAN el pago:**
```
Visa: 4170 0688 1010 8020
Mastercard: 5031 7557 3453 0604
American Express: 3711 8030 3257 522
```

#### ❌ **Tarjetas que RECHAZAN el pago:**
```
Visa: 4000 0000 0000 0002
Mastercard: 5555 5555 5555 4444
```

#### ⏳ **Tarjetas que quedan PENDIENTES:**
```
Visa: 4000 0000 0000 0101
```

**Datos adicionales para todas las tarjetas:**
- **CVV**: 123 (cualquier número de 3 dígitos)
- **Fecha de expiración**: 12/25 (cualquier fecha futura)
- **Nombre**: APRO (para aprobadas) o OTHE (para rechazadas)
- **Documento**: 12345678901

### 6. 🌐 URLs de Retorno (Ya configuradas)
```
Éxito: http://localhost:5176/payment/success
Error: http://localhost:5176/payment/failure
Pendiente: http://localhost:5176/payment/pending
```

### 7. 🧪 Probar la Integración

1. **Inicia el proyecto:**
   ```bash
   npm run dev
   ```

2. **Ve a:** http://localhost:5176/subscription/plans

3. **Selecciona un plan de pago** (Básico o Premium)

4. **Opciones de prueba:**
   - **🌐 "Ir a MercadoPago"**: Te lleva al checkout real de MP
   - **💳 "Simular Pago"**: Simula un pago aprobado (para desarrollo)

### 8. 📊 Monitorear Pagos
1. Ve a tu dashboard de MercadoPago
2. Sección "Actividad" → "Pagos"
3. Ahí verás todos los pagos de prueba procesados

### 9. 🔒 Seguridad - ¡IMPORTANTE!

- ✅ **Solo usa credenciales de PRUEBA** en desarrollo
- ❌ **NUNCA** commits credenciales reales al repositorio
- 🔄 **Cambia** las credenciales antes de producción
- 🚫 **No uses** credenciales de producción en desarrollo

### 10. 🚀 Para Producción (Futuro)
1. Completa la verificación de tu cuenta MercadoPago
2. Configura certificaciones de seguridad
3. Cambia a credenciales de **Producción**
4. Actualiza URLs de retorno a tu dominio real
5. Implementa webhooks para notificaciones automáticas

---

## 💡 Flujo Implementado

1. **Usuario selecciona plan** → SubscriptionPlans.tsx
2. **Se crea preferencia** → PaymentService.createSubscriptionPayment()
3. **Redirección a MercadoPago** → Checkout externo
4. **Usuario paga** → Procesamiento en MercadoPago
5. **Redirección de vuelta** → PaymentSuccess/Failure/Pending
6. **Actualización del plan** → AuthContext.updateUser()

¡Tu integración con MercadoPago está lista para pruebas! 🎉
