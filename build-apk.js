#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK...\n');

try {
  // Step 1: Deploy and sync web assets
  console.log('📦 Deploying and syncing web assets...');
  execSync('npm run deploy', { stdio: 'inherit' });
  
  // Step 2: Fix Java versions
  console.log('🔧 Corrigiendo versiones de Java en archivos .gradle...');
  execSync('node fix-gradle-java-version.js', { stdio: 'inherit' });
  
  // Step 3: Build Android APK
  console.log('🔨 Building Android APK...');
  // Detectar sistema operativo para usar el comando correcto
  const isWindows = process.platform === 'win32';
  const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew';

  // Configurar JAVA_HOME y PATH para el proceso hijo
  const javaHome = process.env.JAVA_HOME || (isWindows ? 'C:\\Program Files\\Java\\jdk-17' : '/usr/lib/jvm/java-17-openjdk-amd64');
  const env = { ...process.env };
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.PATH = isWindows ? `${javaHome}\\bin;${env.PATH}` : `${javaHome}/bin:${env.PATH}`;
  }

  execSync(`cd android && ${gradleCmd} assembleDebug`, { stdio: 'inherit', env });
  
  // Step 4: Copy APK to root directory
  const apkSource = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const unsignedApk = apkSource;
  const signedApk = path.join(__dirname, 'el-borracho.apk');
  const keystore = path.join(__dirname, 'lb-release.keystore');
  const alias = 'lbkey';
  const storepass = 'elborracho2024';
  const keypass = 'elborracho2024';

  if (fs.existsSync(unsignedApk)) {
    // Si no existe el keystore, crearlo automáticamente
    if (!fs.existsSync(keystore)) {
      console.log('🔑 Generando keystore de prueba...');
      execSync(`keytool -genkeypair -v -keystore "${keystore}" -alias ${alias} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${storepass} -keypass ${keypass} -dname "CN=El Borracho, OU=LB, O=LB, L=CO, S=CO, C=CO"`, { stdio: 'inherit' });
    }
    // Firmar el APK
    console.log('🔏 Firmando APK...');
    execSync(`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${keystore}" -storepass ${storepass} -keypass ${keypass} "${unsignedApk}" ${alias}`, { stdio: 'inherit' });
    // Copiar el APK firmado a la raíz
    fs.copyFileSync(unsignedApk, signedApk);
    console.log('✅ APK firmado y copiado exitosamente!');
    console.log(`📱 APK lista para descargar e instalar: ${signedApk}`);
    console.log('🎉 ¡Distribución lista y sin pasos manuales!');
  } else {
    console.error('❌ APK not found at expected location');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}