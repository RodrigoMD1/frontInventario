# 🚨 Solución Completa para Error CORS

## Problema
```
Access to fetch at 'http://localhost:3000/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución Implementada (Proxy en Frontend)

He configurado un proxy en Vite que resuelve el problema CORS:

### 1. Configuración en `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
```

### 2. Actualización en `src/utils/api.ts`:
```typescript
// En desarrollo usa proxy (/api), en producción URL completa
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000'
)
```

## 🚀 Cómo Usar

### 1. Iniciar Backend (Puerto 3000)
```bash
# En el directorio del backend
npm run start:dev
```

### 2. Iniciar Frontend (Puerto 5173 con proxy)
```bash
# En el directorio del frontend
npm run dev
```

### 3. Probar la Conexión
- El frontend automáticamente usará `/api` que se redirige a `http://localhost:3000`
- Todas las llamadas de API funcionarán sin errores CORS

## 🔧 Soluciones Alternativas

### Opción A: Configurar CORS en Backend (Recomendado para producción)

En el backend NestJS, modifica `main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  await app.listen(3000);
}
```

### Opción B: Usar Extensión CORS (Solo desarrollo)

Instala una extensión como "CORS Unblock" en Chrome/Firefox.

### Opción C: Iniciar Chrome sin seguridad (Solo desarrollo)

```bash
chrome.exe --user-data-dir=/tmp/chrome_test --disable-web-security
```

## ✅ Verificación

### 1. Verificar Backend
```bash
node test-backend.js
```
Debería mostrar todas las pruebas exitosas.

### 2. Verificar Frontend
1. Abre http://localhost:5173
2. Intenta registrarte o hacer login
3. No deberías ver errores CORS en la consola

### 3. Verificar Proxy
En la consola del navegador, ejecuta:
```javascript
// Probar conexión directa
fetch('/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: '123456', role: 'store'})
})
```

## 📝 Estado de Archivos Modificados

- ✅ `vite.config.ts` - Proxy configurado
- ✅ `src/utils/api.ts` - URL base actualizada
- ✅ `.env` - Comentarios actualizados
- ✅ `CORS_SETUP.md` - Documentación creada

## 🎯 Resultado Esperado

Después de seguir estos pasos:
- ✅ No más errores CORS
- ✅ Login y registro funcionan
- ✅ Todas las llamadas de API funcionan
- ✅ MercadoPago funciona (con credenciales configuradas)

## 🚨 Si Sigue sin Funcionar

1. **Verifica que el backend esté corriendo:**
   ```bash
   curl http://localhost:3000
   ```

2. **Verifica que el frontend use el proxy:**
   - Abre herramientas de desarrollador
   - Ve a Network tab
   - Las llamadas deberían ir a `/api/...` no `http://localhost:3000/...`

3. **Reinicia ambos servidores:**
   ```bash
   # Terminal 1: Backend
   npm run start:dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Limpia caché del navegador:**
   - Ctrl+Shift+Del
   - O usar modo incógnito

## 🎉 Resultado

Con esta configuración, el frontend y backend se comunican perfectamente sin errores CORS, y puedes probar todas las funcionalidades incluidos los pagos con MercadoPago.
