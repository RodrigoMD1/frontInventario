// Script para probar la conexión frontend-backend con proxy
console.log('🔗 Probando conexión frontend-backend...');

// Función para probar el endpoint de salud
async function testConnection() {
  try {
    console.log('📡 Probando conexión con proxy...');
    
    // Usar la misma lógica que el frontend
    const isDev = true; // Simular modo desarrollo
    const API_BASE = isDev ? '/api' : 'http://localhost:3000';
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-connection-${Date.now()}@test.com`,
        password: '123456',
        role: 'store'
      })
    });
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Conexión exitosa!', result);
      return true;
    } else {
      console.log('❌ Error de respuesta:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    
    // Sugerencias basadas en el error
    if (error.message.includes('CORS')) {
      console.log('💡 Solución CORS:');
      console.log('1. Configura CORS en el backend NestJS');
      console.log('2. O usa el proxy de Vite configurado');
    }
    
    if (error.message.includes('Failed to fetch')) {
      console.log('💡 Posibles soluciones:');
      console.log('1. Verifica que el backend esté corriendo en http://localhost:3000');
      console.log('2. Verifica que el frontend esté corriendo con npm run dev');
      console.log('3. Usa el proxy configurado en vite.config.ts');
    }
    
    return false;
  }
}

// Solo ejecutar en browser
if (typeof window !== 'undefined') {
  window.testConnection = testConnection;
  console.log('🌐 Ejecuta testConnection() en la consola del navegador para probar');
}

export { testConnection };
