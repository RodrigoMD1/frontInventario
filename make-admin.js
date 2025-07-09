// Script para convertir un usuario existente en administrador
import fetch from 'node-fetch';

// Configuración
const API_URL = 'http://localhost:3000';
const EMAIL = 'rodrigo.martinez224@gmail.com'; // Reemplaza con el email del usuario a convertir en admin
const PASSWORD = '123456'; // Contraseña del usuario

async function makeUserAdmin() {
  console.log('🔄 Iniciando proceso para convertir usuario en administrador...');

  try {
    // PASO 1: Login para obtener token
    console.log(`1️⃣ Intentando login con ${EMAIL}...`);
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
    console.log('📋 Datos del usuario:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Rol actual: ${user.role}`);

    // PASO 2: Mostrar instrucciones SQL para actualizar manualmente
    console.log('\n===== INSTRUCCIONES PARA ACTUALIZAR A ADMIN =====');
    console.log('Ejecuta el siguiente comando SQL en tu base de datos:');
    console.log('\nOpción 1: Usando psql directamente:');
    console.log('```');
    console.log(`psql -U postgres -d globaloffice -c "UPDATE \\\"user\\\" SET role = 'admin' WHERE id = '${user.id}'"`);
    console.log('```');
    
    console.log('\nOpción 2: Conectándote primero a PostgreSQL:');
    console.log('```');
    console.log('psql -U postgres -d globaloffice');
    console.log(`UPDATE "user" SET role = 'admin' WHERE id = '${user.id}';`);
    console.log('```');
    
    console.log('\nOpción 3: Usando pgAdmin o cualquier otra herramienta SQL:');
    console.log('```');
    console.log(`UPDATE "user" SET role = 'admin' WHERE id = '${user.id}';`);
    console.log('```');
    
    console.log('\nPara verificar el cambio:');
    console.log('```');
    console.log(`SELECT id, email, role FROM "user" WHERE id = '${user.id}';`);
    console.log('```');

    // Si hay un endpoint para verificar el rol, lo usaríamos aquí
    console.log('\nDespués de ejecutar el comando SQL, vuelve a iniciar sesión para que los cambios surtan efecto.');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Ejecutar el script
makeUserAdmin();
