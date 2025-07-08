#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK...\n');

try {
  // Step 1: Prepare web assets for Capacitor
  console.log('📦 Preparing web assets for Capacitor...');
  execSync('mkdir -p www', { stdio: 'inherit' });
  // Copy main directories
  execSync('cp -r css www/', { stdio: 'inherit' });
  execSync('cp -r js www/', { stdio: 'inherit' });
  execSync('cp -r images www/', { stdio: 'inherit' });
  // Copy root files (HTML, manifest, sw, json data files)
  // Ensure all necessary files are listed here
  const rootFilesToCopy = [
    'index.html',
    'manifest.json',
    'sw.js',
    'products.json',
    'config.json',
    'pedidos.html',
    'descargar.html'
    // Add any other root HTML or essential files here
  ];
  rootFilesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      execSync(`cp ${file} www/`, { stdio: 'inherit' });
    } else {
      console.warn(`Warning: File ${file} not found in root, not copied to www/`);
    }
  });
  console.log('Listing contents of www/ directory:');
  execSync('ls -la www/', { stdio: 'inherit' });

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
  
  // Step 4: Copy APK to root directory and sign it
  const apkSource = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  // app-debug.apk is the unsigned (or debug-signed) output from Gradle
  const finalApkPath = path.join(__dirname, 'el-borracho.apk'); // This will be the final signed APK for distribution
  const keystore = path.join(__dirname, 'lb-release.keystore');
  const alias = 'lbkey';
  const storepass = 'elborracho2024'; // Consider moving to environment variables for real production
  const keypass = 'elborracho2024';   // Consider moving to environment variables for real production

  if (fs.existsSync(apkSource)) {
    // Si no existe el keystore, crearlo automáticamente (para desarrollo/pruebas)
    if (!fs.existsSync(keystore)) {
      console.log('🔑 Generating new debug/test keystore...');
      execSync(`keytool -genkeypair -v -keystore "${keystore}" -alias ${alias} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${storepass} -keypass ${keypass} -dname "CN=El Borracho Dev, OU=Development, O=El Borracho, L=Popayan, S=Cauca, C=CO"`, { stdio: 'inherit' });
      console.log(`📝 A new keystore "${keystore}" was generated for testing/debugging purposes.`);
      console.log('IMPORTANT: For production releases, use a securely managed, pre-existing keystore.');
    }

    // Copiar el app-debug.apk a el-borracho.apk ANTES de firmar, para firmar la copia.
    fs.copyFileSync(apkSource, finalApkPath);

    // Firmar el APK (el-borracho.apk)
    console.log(`🔏 Signing APK: ${finalApkPath}`);
    execSync(`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${keystore}" -storepass ${storepass} -keypass ${keypass} "${finalApkPath}" ${alias}`, { stdio: 'inherit' });

    // Opcional: Verificar la firma (requiere apksigner del Android SDK Build Tools)
    // console.log('🔎 Verifying APK signature...');
    // try {
    //   execSync(`apksigner verify --verbose "${finalApkPath}"`, { stdio: 'inherit' });
    // } catch (verifyError) {
    //   console.warn('⚠️ APK signature verification failed. This might be an issue with apksigner path or the signature itself.');
    // }

    console.log('✅ APK built and signed successfully!');
    console.log(`📱 Signed APK available at: ${finalApkPath}`);
    console.log('🎉 ¡Distribución lista y sin pasos manuales!');
  } else {
    console.error(`❌ APK not found at expected location: ${apkSource}`);
    console.error('Ensure the Gradle build was successful.');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  if (error.stderr) {
    console.error('Stderr:', error.stderr.toString());
  }
  if (error.stdout) {
    console.error('Stdout:', error.stdout.toString());
  }
  process.exit(1);
}