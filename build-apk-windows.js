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

  // Step 1: Prepare web assets for Capacitor
  console.log('📦 Preparing web assets for Capacitor...');
  execSync('if not exist www mkdir www', { stdio: 'inherit' }); // mkdir -p equivalent for Windows cmd

  const webAssets = {
    dirs: ['css', 'js', 'images'],
    files: [
      'index.html',
      'manifest.json',
      'sw.js',
      'products.json',
      'config.json',
      'pedidos.html',
      'descargar.html'
      // Add any other root HTML or essential files here
    ]
  };

  webAssets.dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      execSync(`xcopy ${dir} www\\${dir}\\ /E /I /Y /Q`, { stdio: 'inherit' });
    } else {
      console.warn(`Warning: Directory ${dir} not found, not copied to www/`);
    }
  });

  webAssets.files.forEach(file => {
    if (fs.existsSync(file)) {
      execSync(`copy /Y ${file.replace(/\//g, '\\')} www\\`, { stdio: 'inherit' });
    } else {
      console.warn(`Warning: File ${file} not found, not copied to www/`);
    }
  });
  console.log('Listing contents of www/ directory:');
  execSync('dir www', { stdio: 'inherit' });

  // Step 2: Sync web assets with Capacitor
  console.log('🔄 Syncing web assets with Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  // Step 3: Fix Java versions
  console.log('🔧 Corrigiendo versiones de Java en archivos .gradle...');
  execSync('node fix-gradle-java-version.js', { stdio: 'inherit' });
  
  // Step 4: Build Android APK
  console.log('🔨 Building Android APK...');
  
  // Configurar variables de entorno para Windows
  const env = { ...process.env };
  
  // Configurar JAVA_HOME para JDK 17
  if (!env.JAVA_HOME || !env.JAVA_HOME.includes('17')) {
    console.log('🔧 Intentando configurar JAVA_HOME para JDK 17...');
    const potentialJdk17Paths = [
      process.env.JDK_17_HOME, // Allow user to specify via environment variable
      'C:\\Program Files\\Java\\jdk-17',
      'C:\\Program Files\\Java\\jdk-17.0.1', // Add more specific versions if needed
      'C:\\Program Files\\Java\\jdk-17.0.2',
      'C:\\Program Files\\Java\\jdk-17.0.3',
      'C:\\Program Files\\Java\\jdk-17.0.4',
      'C:\\Program Files\\Java\\jdk-17.0.5',
      'C:\\Program Files\\Java\\jdk-17.0.6',
      'C:\\Program Files\\Java\\jdk-17.0.7',
      'C:\\Program Files\\Java\\jdk-17.0.8',
      'C:\\Program Files\\Java\\jdk-17.0.9',
      'C:\\Program Files\\Java\\jdk-17.0.10',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.8.7-hotspot', // Example specific version
      // General Adoptium path (less specific, might pick up other versions if not careful)
      // 'C:\\Program Files\\Eclipse Adoptium',
    ];

    let foundJdk17 = false;
    for (const p of potentialJdk17Paths) {
      if (p && fs.existsSync(p) && fs.existsSync(path.join(p, 'bin', 'java.exe'))) {
        // Check if this path actually contains a JDK 17
        try {
          const versionOutput = execSync(`"${path.join(p, 'bin', 'java')}" -version`, { encoding: 'utf8', stdio: 'pipe' });
          if (versionOutput.includes('17.') || versionOutput.includes('version "17"')) {
            env.JAVA_HOME = p;
            env.PATH = `${p}\\bin;${env.PATH}`;
            console.log(`✅ JAVA_HOME configurado para JDK 17: ${p}`);
            foundJdk17 = true;
            break;
          }
        } catch (e) {
          console.warn(`⚠️  Advertencia: Error al verificar la version de Java en ${p}`);
        }
      }
    }

    if (!foundJdk17) {
       // Try to find any jdk-17 directory in common locations
      const commonJavaLocations = ["C:\\Program Files\\Java\\", "C:\\Program Files\\Eclipse Adoptium\\"];
      for (const loc of commonJavaLocations) {
        if (fs.existsSync(loc)) {
          const subDirs = fs.readdirSync(loc);
          for (const dir of subDirs) {
            if (dir.startsWith('jdk-17') || dir.startsWith('temurin-17')) {
              const jdkPath = path.join(loc, dir);
              if (fs.existsSync(path.join(jdkPath, 'bin', 'java.exe'))) {
                 try {
                    const versionOutput = execSync(`"${path.join(jdkPath, 'bin', 'java')}" -version`, { encoding: 'utf8', stdio: 'pipe' });
                    if (versionOutput.includes('17.') || versionOutput.includes('version "17"')) {
                        env.JAVA_HOME = jdkPath;
                        env.PATH = `${jdkPath}\\bin;${env.PATH}`;
                        console.log(`✅ JAVA_HOME configurado para JDK 17 (detectado): ${jdkPath}`);
                        foundJdk17 = true;
                        break;
                    }
                  } catch (e) {
                    console.warn(`⚠️  Advertencia: Error al verificar la version de Java en ${jdkPath}`);
                  }
              }
            }
          }
        }
        if (foundJdk17) break;
      }
    }

    if (!foundJdk17) {
      console.error('❌ No se encontró JDK 17.');
      console.error('   Asegúrate de que JDK 17 esté instalado y considera configurar la variable de entorno JAVA_HOME o JDK_17_HOME.');
      console.error('   El script `fix-gradle-java-version.js` configura los archivos de Gradle para Java 17.');
      process.exit(1);
    }
  } else {
    console.log(`ℹ️ Usando JAVA_HOME existente: ${env.JAVA_HOME}`);
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