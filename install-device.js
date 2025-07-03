#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 Instalando El Borracho en dispositivo Android...\n');

try {
  // Verificar si ADB está disponible
  console.log('🔍 Verificando ADB...');
  try {
    execSync('adb version', { stdio: 'pipe' });
    console.log('✅ ADB encontrado');
  } catch (error) {
    console.log('❌ ADB no encontrado');
    console.log('   Instala Android Platform Tools:');
    console.log('   https://developer.android.com/studio/releases/platform-tools');
    process.exit(1);
  }

  // Verificar dispositivos conectados
  console.log('🔍 Buscando dispositivos conectados...');
  const devices = execSync('adb devices', { encoding: 'utf8' });
  console.log(devices);

  if (!devices.includes('device')) {
    console.log('❌ No se encontraron dispositivos conectados');
    console.log('\n📱 Para conectar tu dispositivo:');
    console.log('   1. Habilita "Opciones de desarrollador" en Configuración');
    console.log('   2. Habilita "Depuración USB"');
    console.log('   3. Conecta el dispositivo por USB');
    console.log('   4. Acepta el diálogo de depuración USB');
    process.exit(1);
  }

  // Verificar si el APK existe
  const apkPath = path.join(__dirname, 'el-borracho.apk');
  if (!fs.existsSync(apkPath)) {
    console.log('❌ APK no encontrado');
    console.log('   Ejecuta primero: npm run build-apk');
    process.exit(1);
  }

  // Instalar APK
  console.log('📦 Instalando APK en dispositivo...');
  execSync(`adb install -r "${apkPath}"`, { stdio: 'inherit' });

  console.log('\n✅ ¡Aplicación instalada exitosamente!');
  console.log('📱 Busca "EL BORRACHO" en tu dispositivo');
  
  // Opcional: Abrir la aplicación
  console.log('\n🚀 Iniciando aplicación...');
  try {
    execSync('adb shell am start -n com.elborracho.app/.MainActivity', { stdio: 'inherit' });
    console.log('✅ Aplicación iniciada');
  } catch (error) {
    console.log('⚠️  No se pudo iniciar automáticamente, abre manualmente');
  }

} catch (error) {
  console.error('❌ Instalación fallida:', error.message);
  console.error('\n🔧 Posibles soluciones:');
  console.error('   1. Verificar que el dispositivo tenga depuración USB habilitada');
  console.error('   2. Verificar que el dispositivo esté conectado por USB');
  console.error('   3. Aceptar el diálogo de depuración USB en el dispositivo');
  console.error('   4. Verificar que el APK exista (npm run build-apk)');
  process.exit(1);
}