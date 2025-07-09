// Script para probar la API de productos con el backend
console.log('🔍 Probando API de productos...');

// Función para obtener token JWT (se necesita para las operaciones autenticadas)
async function getAuthToken() {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Usa un usuario real que ya exista
        password: '123456'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.access_token || data.token;
    } else {
      console.error('❌ Error al obtener token:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error.message);
    return null;
  }
}

// Función para probar la creación de productos
async function testCreateProduct() {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('❌ No se pudo obtener token de autenticación');
      return false;
    }
    
    // Crear producto de prueba
    const testProduct = {
      name: `Producto de prueba ${Date.now()}`,
      price: 100.50,
      stock: 10,
      category: "Pruebas",
      description: "Producto creado para probar la API",
      isActive: true
    };
    
    console.log('📦 Enviando producto:', testProduct);
    
    // Intenta crear el producto
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });
    
    // Ver la respuesta completa
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Producto creado exitosamente!', responseText);
      return true;
    } else {
      console.error(`❌ Error ${response.status} al crear producto:`, responseText);
      
      // Mostrar sugerencias según el error
      if (response.status === 500) {
        console.log('💡 Posible problema en el servidor:');
        console.log('- Verifica los logs del backend');
        console.log('- Comprueba si faltan campos obligatorios en la solicitud');
        console.log('- Asegúrate que la estructura de datos sea la esperada por el backend');
      }
      
      if (response.status === 400) {
        console.log('💡 Error de validación:');
        console.log('- Revisa la estructura de la solicitud');
        console.log('- Verifica que todos los campos obligatorios estén presentes');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión al crear producto:', error.message);
    return false;
  }
}

// Función para probar la obtención de productos
async function testGetProducts() {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('❌ No se pudo obtener token de autenticación');
      return false;
    }
    
    // Intenta obtener los productos
    const response = await fetch('/api/products', {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Productos obtenidos exitosamente!', products);
      return true;
    } else {
      console.error('❌ Error al obtener productos:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión al obtener productos:', error.message);
    return false;
  }
}

// Solo ejecutar en browser
if (typeof window !== 'undefined') {
  window.testCreateProduct = testCreateProduct;
  window.testGetProducts = testGetProducts;
  console.log('🌐 Ejecuta testCreateProduct() o testGetProducts() en la consola del navegador para probar');
}

export { testCreateProduct, testGetProducts };
