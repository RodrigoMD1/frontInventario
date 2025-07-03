// Script de pruebas automatizadas para el backend
const API_BASE = 'http://localhost:3000';

// Test 1: Registro de usuario
async function testRegister() {
  console.log('🧪 Test 1: Registro de usuario');
  
  const testUser = {
    email: `test-${Date.now()}@empresa.com`,
    password: '123456',
    role: 'store'
  };
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.text();
    console.log('✅ Registro exitoso:', result);
    return testUser;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return null;
  }
}

// Test 2: Login de usuario
async function testLogin(user) {
  console.log('🧪 Test 2: Login de usuario');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });
    
    const result = await response.json();
    console.log('✅ Login exitoso:', result);
    return result.access_token;
  } catch (error) {
    console.error('❌ Error en login:', error);
    return null;
  }
}

// Test 3: Crear tienda
async function testCreateStore(token) {
  console.log('🧪 Test 3: Crear tienda');
  
  try {
    const response = await fetch(`${API_BASE}/stores`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: `Tienda Test ${Date.now()}`
      })
    });
    
    const result = await response.json();
    console.log('✅ Tienda creada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creando tienda:', error);
    return null;
  }
}

// Test 4: Listar productos
async function testGetProducts(token) {
  console.log('🧪 Test 4: Listar productos');
  
  try {
    const response = await fetch(`${API_BASE}/products`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('✅ Productos obtenidos:', result);
    return result;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    return null;
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas del backend...\n');
  
  // Test 1: Registro
  const user = await testRegister();
  if (!user) return;
  
  console.log('');
  
  // Test 2: Login
  const token = await testLogin(user);
  if (!token) return;
  
  console.log('');
  
  // Test 3: Crear tienda
  const store = await testCreateStore(token);
  
  console.log('');
  
  // Test 4: Listar productos
  const products = await testGetProducts(token);
  
  console.log('\n🎉 Todas las pruebas completadas!');
}

// Ejecutar si es llamado directamente
if (typeof window === 'undefined') {
  runAllTests();
}

// Exportar para uso en browser
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
}
