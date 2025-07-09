#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building El Borracho Android APK...\n');

try {
  // Step 1: Prepare web assets for Capacitor
  console.log('📦 Preparing web assets for Capacitor...');
  if (!fs.existsSync('www')) {
    fs.mkdirSync('www', { recursive: true });
  }

  const assetsToCopy = {
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

  assetsToCopy.dirs.forEach(dir => {
    const sourceDir = path.join(__dirname, dir);
    const destDir = path.join(__dirname, 'www', dir);
    if (fs.existsSync(sourceDir)) {
      fs.cpSync(sourceDir, destDir, { recursive: true, errorOnExist: false, force: true });
      console.log(`Copied directory ${dir} to www/${dir}`);
    } else {
      console.warn(`Warning: Directory ${dir} not found, not copied to www/`);
    }
  });

  assetsToCopy.files.forEach(file => {
    const sourceFile = path.join(__dirname, file);
    const destFile = path.join(__dirname, 'www', file);
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, destFile);
      console.log(`Copied file ${file} to www/${file}`);
    } else {
      console.warn(`Warning: File ${file} not found, not copied to www/`);
    }
  });

  console.log('Listing contents of www/ directory:');
  try {
    const wwwContents = fs.readdirSync('www');
    console.log(wwwContents.join('\\n'));
  } catch (e) {
    console.error('Could not list www directory contents:', e);
  }

  // Step 2: Sync web assets with Capacitor
  console.log('🔄 Syncing web assets with Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

  // Step 3: Fix Java versions
  console.log('🔧 Corrigiendo versiones de Java en archivos .gradle...');
  execSync('node fix-gradle-java-version.js', { stdio: 'inherit' });
  
  // Step 4: Build Android APK
  console.log('🔨 Building Android APK...');
  const isWindows = process.platform === 'win32';
  const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew';
  const env = { ...process.env };

  // Configurar JAVA_HOME y PATH para el proceso hijo, priorizando JDK 17
  let javaHome = process.env.JAVA_HOME;
  let jdk17Found = false;

  if (isWindows) {
    const potentialJdk17Paths = [
      process.env.JDK_17_HOME, // User-defined specific path
      'C:\\Program Files\\Java\\jdk-17',
      // Add more common specific version paths if necessary, e.g., 'C:\\Program Files\\Java\\jdk-17.0.x'
    ];
    for (const p of potentialJdk17Paths) {
      if (p && fs.existsSync(p) && fs.existsSync(path.join(p, 'bin', 'java.exe'))) {
        try {
          const versionOutput = execSync(`"${path.join(p, 'bin', 'java')}" -version`, { encoding: 'utf8', stdio: 'pipe' });
          if (versionOutput.includes('17.') || versionOutput.includes('version "17"')) {
            javaHome = p;
            jdk17Found = true;
            console.log(`✅ JAVA_HOME configurado para JDK 17: ${p}`);
            break;
          }
        } catch (e) { console.warn(`⚠️ Advertencia al verificar Java en ${p}: ${e.message}`); }
      }
    }
    if (!jdk17Found) {
      // Broader search in common locations
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
                    javaHome = jdkPath;
                    jdk17Found = true;
                    console.log(`✅ JAVA_HOME configurado para JDK 17 (detectado): ${jdkPath}`);
                    break;
                  }
                } catch (e) { console.warn(`⚠️ Advertencia al verificar Java en ${jdkPath}: ${e.message}`); }
              }
            }
          }
        }
        if (jdk17Found) break;
      }
    }
    if (!jdk17Found) {
      console.error('❌ No se encontró JDK 17 en Windows.');
      console.error('   Asegúrate de que JDK 17 esté instalado y considera configurar JAVA_HOME o JDK_17_HOME.');
      console.error('   El script `fix-gradle-java-version.js` configura los archivos de Gradle para Java 17.');
      process.exit(1);
    }
  } else { // For non-Windows (Linux/macOS)
    javaHome = javaHome || '/usr/lib/jvm/java-17-openjdk-amd64'; // Default for Linux
    if (!fs.existsSync(javaHome) || !fs.existsSync(path.join(javaHome, 'bin', 'java'))) {
        // A simple check, can be expanded if needed for other Linux distros or macOS
        console.warn(`⚠️ JAVA_HOME para Linux/macOS (${javaHome}) no encontrado o no es JDK 17. Verifique la instalación.`);
        // Allow to proceed, assuming 'java' in PATH might be correct or user knows best.
    } else {
        jdk17Found = true; // Assume found if path exists, can add version check if strictness is needed
    }
  }

  if (jdk17Found && javaHome) {
    env.JAVA_HOME = javaHome;
    env.PATH = isWindows ? `${javaHome}\\bin;${env.PATH}` : `${javaHome}/bin:${env.PATH}`;
    console.log(`🛠️ Usando JAVA_HOME: ${javaHome}`);
  } else if (javaHome) { // JAVA_HOME was set by user but not verified as JDK 17
    env.JAVA_HOME = javaHome; // Respect user's JAVA_HOME if set
    env.PATH = isWindows ? `${javaHome}\\bin;${env.PATH}` : `${javaHome}/bin:${env.PATH}`;
    console.warn(`⚠️ Usando JAVA_HOME=${javaHome} provisto por el entorno, pero no se pudo verificar como JDK 17.`);
  }
   else {
    console.warn(`⚠️ JAVA_HOME no configurado y no se pudo detectar JDK 17. El build podría usar una version de Java incorrecta.`);
  }

  execSync(`cd android && ${gradleCmd} clean assembleDebug`, { stdio: 'inherit', env });
  
  // Step 5: Copy APK to root directory and sign it
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