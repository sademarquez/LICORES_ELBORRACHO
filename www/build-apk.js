#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK...\n');

try {
  // Step 1: Sync web assets
  console.log('📦 Syncing web assets...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  // Step 2: Build Android APK
  console.log('🔨 Building Android APK...');
  execSync('cd android && ./gradlew assembleDebug', { stdio: 'inherit' });
  
  // Step 3: Copy APK to root directory
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