// Script para verificar el schema y la estructura de la base de datos
import fetch from 'node-fetch';

// Configuración
const API_URL = 'http://localhost:3000';
// Usa las credenciales reales de tu sistema
const EMAIL = 'rodrigo.martinez224@gmail.com'; // Actualiza con tu email real
const PASSWORD = '123456'; // Actualiza con tu contraseña real

// Función para realizar las pruebas
async function verifyDatabaseSchema() {
  console.log('🔄 Iniciando verificación del esquema de base de datos...');

  try {
    // PASO 1: Login para obtener token
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
    console.log('✅ Login exitoso para usuario:', user.email);

    // PASO 2: Verificar estructura de producto directamente (si hay un endpoint)
    try {
      console.log('2️⃣ Obteniendo metadatos del modelo Product (si está disponible)...');
      const schemaResponse = await fetch(`${API_URL}/products/schema`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        console.log('📋 Estructura del modelo Product:', schema);
      } else {
        console.log('❌ No hay endpoint de schema disponible');
      }
    } catch (e) {
      console.log('❌ No se pudo obtener el schema:', e.message);
    }

    // PASO 3: Listar productos para verificar su estructura
    console.log('3️⃣ Obteniendo productos para verificar estructura...');
    const productsResponse = await fetch(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!productsResponse.ok) {
      console.log('❌ Error al obtener productos:', await productsResponse.text());
    } else {
      const products = await productsResponse.json();
      console.log(`📋 Encontrados ${products.length} productos`);
      
      if (products.length > 0) {
        // Analizar el primer producto para ver su estructura
        const sampleProduct = products[0];
        console.log('🔍 Estructura de un producto ejemplo:');
        console.log(JSON.stringify(sampleProduct, null, 2));
        
        // Verificar específicamente el storeId
        console.log('🏪 Verificando storeId:');
        console.log('   - Propiedad existe:', sampleProduct.hasOwnProperty('storeId'));
        if (sampleProduct.hasOwnProperty('storeId')) {
          console.log('   - Valor:', sampleProduct.storeId);
          console.log('   - Tipo:', typeof sampleProduct.storeId);
        } else if (sampleProduct.store && sampleProduct.store.id) {
          console.log('   - Valor en store.id:', sampleProduct.store.id);
          console.log('   - Tipo:', typeof sampleProduct.store.id);
        }
      }
    }

    // PASO 4: Verificar tiendas para confirmar sus IDs
    console.log('4️⃣ Obteniendo tiendas para verificar IDs...');
    const storesResponse = await fetch(`${API_URL}/stores`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!storesResponse.ok) {
      console.log('❌ Error al obtener tiendas:', await storesResponse.text());
    } else {
      const stores = await storesResponse.json();
      console.log(`📋 Encontradas ${stores.length} tiendas`);
      
      if (stores.length > 0) {
        console.log('🏪 Lista de IDs de tiendas disponibles:');
        stores.forEach((store, index) => {
          console.log(`   ${index + 1}. ID: ${store.id}, Nombre: ${store.name}`);
        });
      }
    }

    console.log('✅ Verificación completada');

  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
  }
}

// Ejecutar la verificación
verifyDatabaseSchema();
