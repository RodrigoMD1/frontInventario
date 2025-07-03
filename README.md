# GlobalOffice - Sistema de Inventario

GlobalOffice es una plataforma moderna y completa para la gestión de inventarios empresariales. Desarrollada con React + TypeScript + Vite, ofrece una solución cloud para pequeñas, medianas y grandes empresas.

## 🚀 Características principales

- 🏢 **Gestión completa de inventario**: Control total de productos, stock y movimientos
- 📊 **Dashboard en tiempo real**: Reportes y métricas actualizadas instantáneamente  
- 🔐 **Sistema de autenticación**: Acceso seguro con JWT y roles de usuario
- 💳 **Pagos integrados**: Suscripciones con MercadoPago (modo prueba)
- 💼 **Multi-empresa**: Cada usuario gestiona su propio inventario independiente
- 📱 **Responsive Design**: Funciona perfectamente en todos los dispositivos
- ⚡ **Alto rendimiento**: Interfaz rápida y optimizada

## 🛠️ Tecnologías utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **TailwindCSS** para estilos
- **React Router DOM** para navegación
- **React Hook Form** + **Zod** para formularios
- **JWT Decode** para autenticación

### Integración de Pagos
- **MercadoPago SDK** para React
- **Sistema de suscripciones** con planes múltiples
- **Webhook handling** para confirmación de pagos

### Herramientas de Desarrollo
- **ESLint** + **TypeScript** para calidad de código
- **SweetAlert2** para notificaciones
- **Scripts de testing** automatizados

## 📦 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Backend
VITE_API_URL=http://localhost:3000

# MercadoPago - Credenciales de PRUEBA
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui

# URLs de callback para pagos
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment/success
VITE_PAYMENT_FAILURE_URL=http://localhost:5173/payment/failure
VITE_PAYMENT_PENDING_URL=http://localhost:5173/payment/pending
```

### 3. Configurar MercadoPago (Modo Prueba)

**IMPORTANTE**: Configura credenciales reales de prueba para probar pagos.

1. Ve a https://www.mercadopago.com.mx/developers/
2. Crea una aplicación
3. Obtén tus credenciales de **prueba** (comienzan con TEST-)
4. Reemplaza los valores en el `.env`

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🧪 Testing y Verificación

### Verificar configuración de MercadoPago
```bash
node check-mercadopago.cjs
```

### Probar endpoints del backend
```bash
node test-backend.js
```

### Probar pagos (modo standalone)
Abre `test-mercadopago.html` en tu navegador para pruebas rápidas de pago.

## 💳 Probar Pagos con MercadoPago

### Tarjetas de Prueba

#### ✅ Pago Aprobado
- **Tarjeta:** 4170 0688 1010 8732
- **CVV:** 123 | **Fecha:** 11/25 | **Nombre:** APRO

#### ❌ Pago Rechazado  
- **Tarjeta:** 4013 5406 8274 6260
- **CVV:** 123 | **Fecha:** 11/25 | **Nombre:** OTHE

#### ⏳ Pago Pendiente
- **Tarjeta:** 4013 5406 8274 6260  
- **CVV:** 123 | **Fecha:** 11/25 | **Nombre:** CONT

### Flujo de Prueba
1. Ve a `/subscription/plans`
2. Selecciona un plan de pago
3. Completa el checkout con las tarjetas de prueba
4. Verifica la redirección a las páginas de resultado

## 📚 Documentación Adicional

- **[COMO_PROBAR_PAGOS.md](./COMO_PROBAR_PAGOS.md)** - Guía completa para probar pagos
- **[MERCADOPAGO_GUIDE.md](./MERCADOPAGO_GUIDE.md)** - Configuración detallada de MercadoPago
- **[MERCADOPAGO_SETUP.md](./MERCADOPAGO_SETUP.md)** - Setup técnico de la integración

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción  
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código
- `node check-mercadopago.cjs` - Verificar configuración de MercadoPago
- `node test-backend.js` - Probar endpoints del backend

## 🌟 Características del Sistema

### Autenticación y Usuarios
- Registro e inicio de sesión con JWT
- Roles de usuario (store, admin)
- Protección de rutas por autenticación
- Gestión de perfiles de usuario

### Sistema de Suscripciones
- **Plan Gratuito**: Hasta 50 productos
- **Plan Básico**: Hasta 500 productos ($29 MXN/mes)
- **Plan Premium**: Productos ilimitados ($59 MXN/mes)

### Gestión de Inventario
- CRUD completo de productos
- Control de stock en tiempo real
- Dashboard con métricas
- Reportes y analytics

### Integración de Pagos
- Checkout nativo de MercadoPago
- Procesamiento de webhooks
- Actualización automática de suscripciones
- Manejo de diferentes estados de pago

## 🚀 Próximas Características

- [ ] Webhooks del backend para MercadoPago
- [ ] Notificaciones por email
- [ ] Panel de administración avanzado
- [ ] API REST completa
- [ ] Integraciones con terceros
- [ ] Reportes exportables
- [ ] Multi-idioma
- [ ] Modo oscuro

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Abrir un issue en GitHub
- Revisar la documentación en `/docs`
- Ejecutar scripts de verificación incluidos

---

**¡GlobalOffice está listo para producción!** 🎉
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
