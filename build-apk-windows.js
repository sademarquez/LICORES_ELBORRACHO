#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK for Windows...\n');

try {
  // Verificar herramientas necesarias
  console.log('🔍 Verificando herramientas necesarias...');
  
  // Verificar Java
  try {
    const javaVersion = execSync('java -version', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Java encontrado');
  } catch (error) {
    console.log('❌ Java no encontrado. Instala Java 17 o superior');
    console.log('   Descarga: https://adoptium.net/temurin/releases/');
    process.exit(1);
  }

  // Verificar Android SDK
  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
    console.log('❌ Android SDK no configurado');
    console.log('   Instala Android Studio y configura ANDROID_HOME');
    console.log('   O ejecuta: npm install -g @android/sdk');
    process.exit(1);
  }

  // Step 1: Sync web assets
  console.log('📦 Syncing web assets...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  // Step 2: Fix Java versions
  console.log('🔧 Corrigiendo versiones de Java en archivos .gradle...');
  execSync('node fix-gradle-java-version.js', { stdio: 'inherit' });
  
  // Step 3: Build Android APK
  console.log('🔨 Building Android APK...');
  
  // Configurar variables de entorno para Windows
  const env = { ...process.env };
  
  // Configurar JAVA_HOME si no existe
  if (!env.JAVA_HOME) {
    const javaPaths = [
      'C:\\Users\\USUARIO\\Downloads\\jdk-17.0.15+6',
      'C:\\Program Files\\Java\\jdk-17',
      'C:\\Program Files\\Java\\jdk-11',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.8.7-hotspot',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-11.0.20.8-hotspot'
    ];
    
    for (const javaPath of javaPaths) {
      if (fs.existsSync(javaPath)) {
        env.JAVA_HOME = javaPath;
        env.PATH = `${javaPath}\\bin;${env.PATH}`;
        console.log(`✅ JAVA_HOME configurado: ${javaPath}`);
        break;
      }
    }
    
    if (!env.JAVA_HOME) {
      console.log('❌ No se encontró Java en ubicaciones comunes');
      console.log('   Configura JAVA_HOME manualmente');
      process.exit(1);
    }
  }

  // Configurar Android SDK
  if (!env.ANDROID_HOME && !env.ANDROID_SDK_ROOT) {
    const androidPaths = [
      'C:\\Users\\USUARIO\\AppData\\Local\\Android\\Sdk',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk',
      'C:\\Android\\sdk',
      'C:\\Program Files\\Android\\Sdk'
    ];
    
    for (const androidPath of androidPaths) {
      const expandedPath = androidPath.replace('%USERNAME%', process.env.USERNAME);
      if (fs.existsSync(expandedPath)) {
        env.ANDROID_HOME = expandedPath;
        env.ANDROID_SDK_ROOT = expandedPath;
        env.PATH = `${expandedPath}\\platform-tools;${expandedPath}\\tools;${env.PATH}`;
        console.log(`✅ ANDROID_HOME configurado: ${expandedPath}`);
        break;
      }
    }
  }

  // Usar gradlew.bat para Windows
  const gradleCmd = 'gradlew.bat';
  
  // Cambiar al directorio android y ejecutar gradle
  process.chdir('android');
  execSync(`${gradleCmd} clean assembleDebug`, { stdio: 'inherit', env });
  process.chdir('..');
  
  // Step 4: Copy APK to root directory
  const apkSource = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const finalApk = path.join(__dirname, 'el-borracho.apk');

  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, finalApk);
    console.log('✅ APK copiado exitosamente!');
    console.log(`📱 APK lista: ${finalApk}`);
    console.log('\n🎉 ¡Build completado exitosamente!');
    
    // Verificar si hay dispositivos conectados
    try {
      const devices = execSync('adb devices', { encoding: 'utf8', env });
      if (devices.includes('device')) {
        console.log('\n📱 Dispositivos Android detectados:');
        console.log(devices);
        console.log('\n💡 Para instalar en el dispositivo:');
        console.log('   adb install -r el-borracho.apk');
      }
    } catch (error) {
      console.log('\n💡 Para instalar en dispositivo:');
      console.log('   1. Habilita "Depuración USB" en tu dispositivo');
      console.log('   2. Conecta el dispositivo por USB');
      console.log('   3. Ejecuta: adb install -r el-borracho.apk');
    }
  } else {
    console.error('❌ APK no encontrado en la ubicación esperada');
    console.error(`   Esperado: ${apkSource}`);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('\n🔧 Posibles soluciones:');
  console.error('   1. Verificar que Java 17+ esté instalado');
  console.error('   2. Verificar que Android SDK esté configurado');
  console.error('   3. Verificar que ANDROID_HOME esté configurado');
  console.error('   4. Ejecutar como administrador si es necesario');
  process.exit(1);
}