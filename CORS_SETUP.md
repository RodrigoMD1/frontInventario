# Configuración CORS para el backend NestJS

El frontend está corriendo en http://localhost:5173 pero el backend en http://localhost:3000 no está configurado para permitir conexiones CORS desde el frontend.

## Solución 1: Configurar CORS en el backend (Recomendado)

En el backend NestJS, agrega la configuración CORS en el archivo `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración CORS para desarrollo
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Frontend Vite
      'http://localhost:5174',  // Frontend alternativo
      'http://localhost:3001',  // Si usas otro puerto
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  await app.listen(3000);
  console.log('🚀 Backend corriendo en http://localhost:3000');
  console.log('✅ CORS configurado para frontend en http://localhost:5173');
}
bootstrap();
```

## Solución 2: Configurar proxy en Vite (Alternativa)

Si no puedes modificar el backend, puedes configurar un proxy en `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

Y cambiar la URL base en el frontend a '/api' en lugar de 'http://localhost:3000'.

## Solución 3: Usar extensión CORS (Solo para desarrollo)

Temporalmente, puedes usar una extensión del navegador como "CORS Unblock" o iniciar Chrome con flags deshabilitados:

```bash
chrome.exe --user-data-dir=/tmp/chrome_dev_test --disable-web-security
```

**NOTA: Solo para desarrollo, nunca en producción.**

## Verificación

Después de aplicar cualquiera de las soluciones, reinicia:
1. El backend (si usaste Solución 1)
2. El frontend (si usaste Solución 2)

## Solución Recomendada: Configurar CORS en Backend

La mejor práctica es configurar CORS correctamente en el backend NestJS como se muestra en la Solución 1.
