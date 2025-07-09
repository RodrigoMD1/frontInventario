// Script para verificar el mapeo de tienda-usuario
import fetch from 'node-fetch';

// Configuración
const API_URL = 'http://localhost:3000';
// Usa las credenciales reales de tu sistema
const EMAIL = 'rodrigo.martinez224@gmail.com'; // Actualiza con tu email real
const PASSWORD = '123456'; // Actualiza con tu contraseña real

// Función para realizar las pruebas
async function testUserStoreMapping() {
  console.log('🔄 Iniciando verificación de mapeo usuario-tienda...');

  try {
    // PASO 1: Login para obtener token y datos de usuario
    console.log('1️⃣ Intentando login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Error en login: ${error}`);
    }

    const { access_token, user } = await loginResponse.json();
    console.log('✅ Login exitoso');
    console.log('👤 Datos del usuario:');
    console.log('   - ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);

    // PASO 2: Verificar el usuario actual con /auth/profile
    console.log('2️⃣ Verificando perfil del usuario...');
    const profileResponse = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.warn('⚠️ No se pudo obtener el perfil:', await profileResponse.text());
    } else {
      const profile = await profileResponse.json();
      console.log('👤 Perfil del usuario:');
      console.log(JSON.stringify(profile, null, 2));
    }

    // PASO 3: Obtener tiendas del usuario
    console.log('3️⃣ Obteniendo tiendas del usuario...');
    const storesResponse = await fetch(`${API_URL}/stores`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!storesResponse.ok) {
      console.warn('⚠️ No se pudieron obtener tiendas:', await storesResponse.text());
    } else {
      const stores = await storesResponse.json();
      console.log(`📋 El usuario tiene ${stores.length} tiendas`);
      
      if (stores.length > 0) {
        console.log('🏪 Lista de tiendas:');
        stores.forEach((store, index) => {
          console.log(`   ${index + 1}. ID: ${store.id}, Nombre: ${store.name}`);
          
          // Verificar si el ID de la tienda coincide con el ID del usuario
          if (store.id === user.id) {
            console.log('   ⚠️ ¡ATENCIÓN! El ID de la tienda coincide con el ID del usuario');
          }
          
          // Verificar si el ID coincide con el del error
          const errorId = '8efc03a2-f607-4b49-9373-47dba85f86c6';
          if (store.id === errorId) {
            console.log('   ✅ Esta tienda tiene el ID que causa el error');
          }
        });
      } else {
        // Si no hay tiendas, crear una
        console.log('⚠️ El usuario no tiene tiendas, intentando crear una...');
        
        const createStoreResponse = await fetch(`${API_URL}/stores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            name: `Tienda de Test ${Date.now()}`,
          }),
        });
        
        if (!createStoreResponse.ok) {
          console.error('❌ Error al crear tienda:', await createStoreResponse.text());
        } else {
          const newStore = await createStoreResponse.json();
          console.log('✅ Tienda creada exitosamente:', newStore);
          console.log('   ID de la tienda:', newStore.id);
          
          // Verificar si el ID de la tienda coincide con el ID del usuario
          if (newStore.id === user.id) {
            console.log('   ⚠️ ¡ATENCIÓN! El ID de la tienda coincide con el ID del usuario');
          }
        }
      }
    }
    
    // PASO 4: Obtener el ID específico que causa el error
    const errorId = '8efc03a2-f607-4b49-9373-47dba85f86c6';
    console.log(`4️⃣ Buscando tienda con el ID específico del error: ${errorId}`);
    
    try {
      const specificStoreResponse = await fetch(`${API_URL}/stores/${errorId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (!specificStoreResponse.ok) {
        console.log(`❌ No existe tienda con ID ${errorId}`);
      } else {
        const specificStore = await specificStoreResponse.json();
        console.log('✅ ¡Tienda encontrada!');
        console.log('   Nombre:', specificStore.name);
        console.log('   ID:', specificStore.id);
        console.log('   Activa:', specificStore.isActive);
      }
    } catch (e) {
      console.error('❌ Error al buscar tienda específica:', e);
    }
    
    // PASO 5: Resumir diagnóstico
    console.log('\n🔍 DIAGNÓSTICO:');
    console.log('   ID del usuario:', user.id);
    console.log('   ID del error:', errorId);
    console.log('   ¿Son iguales?', user.id === errorId ? 'SÍ' : 'NO');
    
    console.log('\n🔧 POSIBLE SOLUCIÓN:');
    console.log('   1. Si la tienda con ID del error existe: usar ese ID');
    console.log('   2. Si no existe: el backend podría estar usando el ID del usuario como storeId');
    console.log('   3. Verificar la implementación del controlador de productos en el backend');

  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
  }
}

// Ejecutar la verificación
testUserStoreMapping();
