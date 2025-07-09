/**
 * Script para diagnosticar y corregir el problema de clave foránea
 * entre tiendas y productos en la base de datos
 * 
 * Este script puede ejecutarse con: node fix-store-database.js
 */

const { Client } = require('pg');
const readline = require('readline');

// Configuración de la base de datos - MODIFICAR SEGÚN TU ENTORNO
const dbConfig = {
  host: 'localhost',
  database: 'globaloffice',
  user: 'postgres',
  password: '', // Completa esto con tu contraseña
  port: 5432
};

const PROBLEMATIC_STORE_ID = '8efc03a2-f607-4b49-9373-47dba85f86c6';

// Crear cliente de base de datos
const client = new Client(dbConfig);

// Crear interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para ejecutar consultas SQL
async function runQuery(query, params = []) {
  try {
    console.log(`Ejecutando SQL: ${query}`);
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error en consulta SQL:', error.message);
    return [];
  }
}

// Función principal
async function main() {
  try {
    console.log('=== Diagnóstico de Relación Usuario-Tienda ===');
    console.log('Este script intentará corregir el problema de clave foránea');
    console.log('verificando y creando las relaciones necesarias en la base de datos.\n');
    
    // Conectar a la base de datos
    await client.connect();
    console.log('Conectado a la base de datos.\n');
    
    // 1. Verificar si la tienda problemática existe
    console.log('== 1. Verificando tienda problemática ==');
    const problematicStore = await runQuery(
      `SELECT * FROM store WHERE id = $1`,
      [PROBLEMATIC_STORE_ID]
    );
    
    if (problematicStore.length > 0) {
      console.log('La tienda problemática YA EXISTE en la base de datos:');
      console.log(problematicStore[0]);
    } else {
      console.log('La tienda problemática NO EXISTE en la base de datos.');
    }
    console.log('\n');
    
    // 2. Verificar usuarios existentes
    console.log('== 2. Verificando usuarios existentes ==');
    const users = await runQuery(
      `SELECT id, email, role FROM "user" LIMIT 10`
    );
    console.table(users);
    console.log('\n');
    
    // 3. Verificar tiendas existentes
    console.log('== 3. Verificando tiendas existentes ==');
    const stores = await runQuery(
      `SELECT id, name, "userId" FROM store LIMIT 10`
    );
    console.table(stores);
    console.log('\n');
    
    // 4. Verificar productos existentes
    console.log('== 4. Verificando productos existentes ==');
    const products = await runQuery(
      `SELECT id, name, "storeId" FROM product LIMIT 10`
    );
    console.table(products);
    console.log('\n');
    
    // 5. Verificar la relación usuario-tienda
    console.log('== 5. Verificando relación usuario-tienda ==');
    const userStoreRelations = await runQuery(
      `SELECT u.id AS user_id, u.email, s.id AS store_id, s.name 
       FROM "user" u 
       LEFT JOIN store s ON u.id = s."userId"
       LIMIT 10`
    );
    console.table(userStoreRelations);
    console.log('\n');
    
    // Si la tienda problemática no existe, preguntar si desea crearla
    if (problematicStore.length === 0) {
      const answer = await new Promise(resolve => {
        rl.question('¿Deseas crear la tienda problemática? (si/no): ', answer => {
          resolve(answer.toLowerCase());
        });
      });
      
      if (answer === 'si') {
        // Pedir el ID de usuario
        const userId = await new Promise(resolve => {
          rl.question('Ingresa el ID de un usuario existente de la lista anterior: ', answer => {
            resolve(answer);
          });
        });
        
        // Crear la tienda
        try {
          await client.query(
            `INSERT INTO store (id, name, "isActive", "userId") 
             VALUES ($1, $2, $3, $4)`,
            [PROBLEMATIC_STORE_ID, 'Tienda Corregida', true, userId]
          );
          
          console.log('✅ Tienda creada exitosamente.');
          
          // Verificar que se haya creado
          const newStore = await runQuery(
            `SELECT * FROM store WHERE id = $1`,
            [PROBLEMATIC_STORE_ID]
          );
          
          console.table(newStore);
        } catch (error) {
          console.error('❌ Error al crear la tienda:', error.message);
        }
      } else {
        console.log('No se creó ninguna tienda.');
      }
    }
    
    console.log('=== Diagnóstico completo ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Cerrar la conexión a la base de datos y la interfaz de línea de comandos
    await client.end();
    rl.close();
  }
}

// Ejecutar el script
main().catch(console.error);
