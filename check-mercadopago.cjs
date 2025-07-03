// Script para verificar la configuración de MercadoPago
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de MercadoPago...\n');

// Verificar archivo .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('✅ Archivo .env encontrado');
  
  // Verificar credenciales de MercadoPago
  const mpPublicKey = envContent.match(/VITE_MERCADOPAGO_PUBLIC_KEY=(.+)/);
  const mpAccessToken = envContent.match(/VITE_MERCADOPAGO_ACCESS_TOKEN=(.+)/);
  
  if (mpPublicKey && mpAccessToken) {
    const publicKey = mpPublicKey[1].trim();
    const accessToken = mpAccessToken[1].trim();
    
    if (publicKey.includes('REEMPLAZA') || accessToken.includes('REEMPLAZA')) {
      console.log('⚠️  Credenciales de MercadoPago: NECESITAN CONFIGURACIÓN');
      console.log('   📝 Sigue estos pasos:');
      console.log('   1. Ve a https://www.mercadopago.com.mx/developers/');
      console.log('   2. Crea una aplicación');
      console.log('   3. Ve a "Credenciales" > pestaña "Pruebas"');
      console.log('   4. Reemplaza los valores en .env con tus credenciales TEST-');
    } else if (publicKey.startsWith('TEST-') && accessToken.startsWith('TEST-')) {
      console.log('✅ Credenciales de MercadoPago: CONFIGURADAS (modo prueba)');
    } else {
      console.log('❌ Credenciales de MercadoPago: NO son de prueba (deben comenzar con TEST-)');
    }
  } else {
    console.log('❌ Credenciales de MercadoPago: NO encontradas en .env');
  }
  
  // Verificar URLs de callback
  const successUrl = envContent.match(/VITE_PAYMENT_SUCCESS_URL=(.+)/);
  const failureUrl = envContent.match(/VITE_PAYMENT_FAILURE_URL=(.+)/);
  const pendingUrl = envContent.match(/VITE_PAYMENT_PENDING_URL=(.+)/);
  
  if (successUrl && failureUrl && pendingUrl) {
    console.log('✅ URLs de callback: CONFIGURADAS');
  } else {
    console.log('❌ URLs de callback: INCOMPLETAS');
  }
  
} else {
  console.log('❌ Archivo .env: NO encontrado');
  console.log('   📝 Crear archivo .env con las variables de MercadoPago');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = {...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {})};
  
  const mpDeps = [
    '@mercadopago/sdk-react',
    '@mercadopago/sdk-js',
    'mercadopago'
  ];
  
  mpDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep}: NO instalado`);
    }
  });
}

// Verificar archivos de integración
console.log('\n📁 Verificando archivos de integración...');
const files = [
  'src/utils/payments.ts',
  'src/components/Payment/PaymentSuccess.tsx',
  'src/components/Payment/PaymentFailure.tsx',
  'src/components/Payment/PaymentPending.tsx',
  'test-mercadopago.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}: NO encontrado`);
  }
});

console.log('\n🚀 Próximos pasos:');
console.log('1. Configura tus credenciales reales de prueba en .env');
console.log('2. Ejecuta: npm run dev');
console.log('3. Abre: http://localhost:5173/subscription/plans');
console.log('4. Selecciona un plan y prueba el pago');
console.log('5. Usa tarjetas de prueba de MercadoPago para simular pagos');

console.log('\n🃏 Tarjetas de prueba:');
console.log('✅ Aprobado: 4170 0688 1010 8732 (APRO)');
console.log('❌ Rechazado: 4013 5406 8274 6260 (OTHE)');
console.log('⏳ Pendiente: 4013 5406 8274 6260 (CONT)');
console.log('📅 Expiración: 11/25, CVV: 123');

console.log('\n📖 Para más información, revisa:');
console.log('- MERCADOPAGO_GUIDE.md');
console.log('- test-mercadopago.html (para pruebas rápidas)');
