// Script para verificar la conexión entre store y product
import fetch from 'node-fetch';

// Configuración
const API_URL = 'http://localhost:3000';
// Usa las credenciales reales de tu sistema
const EMAIL = 'rodrigo.martinez224@gmail.com'; // Actualiza con tu email real
const PASSWORD = '123456'; // Actualiza con tu contraseña real

// Función para realizar las pruebas
async function testStoreProductRelation() {
  console.log('🔄 Iniciando prueba de relación Tienda-Producto...');

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

    // PASO 2: Obtener tiendas del usuario
    console.log('2️⃣ Obteniendo tiendas del usuario...');
    const storesResponse = await fetch(`${API_URL}/stores`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    let storeId;
    let storeName;
    
    if (!storesResponse.ok) {
      console.warn('⚠️ No se pudieron obtener tiendas, intentando crear una nueva');
    } else {
      const stores = await storesResponse.json();
      console.log('📋 Tiendas encontradas:', stores);
      
      if (Array.isArray(stores) && stores.length > 0) {
        storeId = stores[0].id;
        storeName = stores[0].name;
        console.log('✅ Usando tienda existente:', { id: storeId, name: storeName });
      } else {
        console.log('❌ No se encontraron tiendas para este usuario');
      }
    }

    // PASO 3: Si no hay tienda, crear una
    if (!storeId) {
      console.log('3️⃣ Creando nueva tienda...');
      const createStoreResponse = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          name: `Test Store ${Date.now()}`,
        }),
      });

      if (!createStoreResponse.ok) {
        const error = await createStoreResponse.text();
        throw new Error(`Error al crear tienda: ${error}`);
      }

      const newStore = await createStoreResponse.json();
      storeId = newStore.id;
      storeName = newStore.name;
      console.log('✅ Tienda creada exitosamente:', { id: storeId, name: storeName });
    }

    // PASO 4: Crear un producto usando la tienda
    console.log('4️⃣ Creando producto con storeId:', storeId);
    
    // Verificar antes de enviar que el storeId sea un UUID válido
    console.log('🔍 Validación storeId:');
    console.log('   - Tipo:', typeof storeId);
    console.log('   - Formato UUID válido:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId) ? 'Sí' : 'No');
    console.log('   - Longitud:', storeId.length);
    
    // Crear el payload con el storeId
    const productPayload = {
      name: `Producto de prueba ${Date.now()}`,
      price: 100,
      stock: 10,
      category: 'Test',
      description: 'Producto creado por script de prueba',
      storeId: storeId,
      isActive: true,
    };
    
    // Mostrar el payload exacto que se envía
    console.log('📦 Payload del producto a enviar:', JSON.stringify(productPayload));
    
    // Realizar la solicitud
    const createProductResponse = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(productPayload),
    });

    if (!createProductResponse.ok) {
      const errorText = await createProductResponse.text();
      
      // Intentar parsear como JSON, si no, usar el texto
      let errorInfo;
      try {
        errorInfo = JSON.parse(errorText);
      } catch (e) {
        errorInfo = errorText;
      }
      
      console.error('❌ Error al crear producto:', errorInfo);
      
      // Verificar explícitamente si es un error de clave foránea
      if (errorText.includes('foreign key constraint') || 
          errorText.includes('FK_32eaa54ad96b26459158464379a')) {
        console.error('🔍 ERROR DE CLAVE FORÁNEA DETECTADO!');
        console.error('🔍 Esto significa que el storeId enviado no existe en la base de datos!');
        console.error('🔍 storeId enviado:', storeId);
        console.error('🔍 Formato UUID válido:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId) ? 'Sí' : 'No');
        
        // Intentar verificar si la tienda existe directamente
        try {
          console.log('🔍 Verificando si la tienda realmente existe...');
          const storeCheckResponse = await fetch(`${API_URL}/stores/${storeId}`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          });
          
          if (storeCheckResponse.ok) {
            console.log('✅ La tienda SÍ existe en el backend!');
          } else {
            console.error('❌ La tienda NO existe en el backend!');
          }
        } catch (e) {
          console.error('❌ Error al verificar tienda:', e);
        }
      }
      
      throw new Error(`Error al crear producto: ${errorText}`);
    }

    const newProduct = await createProductResponse.json();
    console.log('✅ Producto creado exitosamente:', newProduct);

    // PASO 5: Verificar que el producto se haya asociado correctamente a la tienda
    console.log('5️⃣ Verificando relación producto-tienda...');
    const productResponse = await fetch(`${API_URL}/products/${newProduct.id}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!productResponse.ok) {
      const error = await productResponse.text();
      throw new Error(`Error al obtener producto: ${error}`);
    }

    const productDetails = await productResponse.json();
    console.log('📋 Detalles del producto:', productDetails);

    // Verificar que el storeId del producto coincida con el esperado
    if (productDetails.storeId === storeId) {
      console.log('✅ ÉXITO: El storeId del producto coincide con el esperado');
    } else {
      console.error('❌ ERROR: El storeId del producto NO coincide con el esperado');
      console.error('   storeId esperado:', storeId);
      console.error('   storeId del producto:', productDetails.storeId);
    }

  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
  }
}

// Ejecutar las pruebas
testStoreProductRelation();
