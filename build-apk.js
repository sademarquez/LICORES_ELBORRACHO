#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK...\n');

try {
  // Step 1: Sync web assets
  console.log('📦 Syncing web assets...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  // Step 2: Fix Java versions
  console.log('🔧 Corrigiendo versiones de Java en archivos .gradle...');
  execSync('node fix-gradle-java-version.js', { stdio: 'inherit' });
  
  // Step 3: Build Android APK
  console.log('🔨 Building Android APK...');
  // Detectar sistema operativo para usar el comando correcto
  const isWindows = process.platform === 'win32';
  const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew';

  // Configurar JAVA_HOME y PATH para el proceso hijo
  const javaHome = isWindows ? 'C://Users//USUARIO//Downloads//jdk-17.0.15+6' : process.env.JAVA_HOME;
  const env = { ...process.env };
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.Path = `${javaHome}\\bin;${env.Path}`;
  }

  execSync(`cd android && ${gradleCmd} assembleDebug`, { stdio: 'inherit', env });
  
  // Step 4: Copy APK to root directory
  const apkSource = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const apkDestination = path.join(__dirname, 'el-borracho.apk');
  
  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDestination);
    console.log('✅ APK created successfully!');
    console.log(`📱 APK location: ${apkDestination}`);
    console.log('🎉 Ready for distribution!');
  } else {
    console.error('❌ APK not found at expected location');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}