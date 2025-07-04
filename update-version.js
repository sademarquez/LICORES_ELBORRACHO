#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Actualizando versiones automáticamente...\n');

try {
    // Función para incrementar versión
    function incrementVersion(version) {
        const parts = version.split('.').map(Number);
        parts[2] = (parts[2] || 0) + 1; // Incrementar patch version
        return parts.join('.');
    }

    // Actualizar manifest.json
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const oldVersion = manifest.version || '1.0.0';
    const newVersion = incrementVersion(oldVersion);
    
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
    console.log(`📱 manifest.json: ${oldVersion} → ${newVersion}`);

    // Actualizar package.json
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`📦 package.json: ${packageJson.version || '1.0.0'} → ${newVersion}`);

    // Actualizar android/app/build.gradle
    const gradlePath = path.join(__dirname, 'android/app/build.gradle');
    if (fs.existsSync(gradlePath)) {
        let gradleContent = fs.readFileSync(gradlePath, 'utf8');
        
        // Incrementar versionCode
        const versionCodeMatch = gradleContent.match(/versionCode (\d+)/);
        if (versionCodeMatch) {
            const oldVersionCode = parseInt(versionCodeMatch[1]);
            const newVersionCode = oldVersionCode + 1;
            gradleContent = gradleContent.replace(
                /versionCode \d+/,
                `versionCode ${newVersionCode}`
            );
            console.log(`🤖 Android versionCode: ${oldVersionCode} → ${newVersionCode}`);
        }

        // Actualizar versionName
        gradleContent = gradleContent.replace(
            /versionName "[^"]*"/,
            `versionName "${newVersion}"`
        );
        
        fs.writeFileSync(gradlePath, gradleContent);
        console.log(`🤖 Android versionName: → ${newVersion}`);
    }

    // Actualizar Service Worker con nueva versión de caché
    const swPath = path.join(__dirname, 'sw.js');
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        
        // Actualizar nombres de caché
        swContent = swContent.replace(
            /elborracho-static-v[\d.]+/g,
            `elborracho-static-v${newVersion.replace(/\./g, '')}`
        );
        swContent = swContent.replace(
            /elborracho-dynamic-v[\d.]+/g,
            `elborracho-dynamic-v${newVersion.replace(/\./g, '')}`
        );
        
        fs.writeFileSync(swPath, swContent);
        console.log(`⚙️  Service Worker cache: → v${newVersion.replace(/\./g, '')}`);
    }

    // Actualizar version-manager.js
    const versionManagerPath = path.join(__dirname, 'js/version-manager.js');
    if (fs.existsSync(versionManagerPath)) {
        let vmContent = fs.readFileSync(versionManagerPath, 'utf8');
        vmContent = vmContent.replace(
            /this\.currentVersion = '[^']*'/,
            `this.currentVersion = '${newVersion}'`
        );
        fs.writeFileSync(versionManagerPath, vmContent);
        console.log(`📋 version-manager.js: → ${newVersion}`);
    }

    // Actualizar live-updates.js
    const liveUpdatesPath = path.join(__dirname, 'js/live-updates.js');
    if (fs.existsSync(liveUpdatesPath)) {
        let luContent = fs.readFileSync(liveUpdatesPath, 'utf8');
        luContent = luContent.replace(
            /this\.currentVersion = '[^']*'/,
            `this.currentVersion = '${newVersion}'`
        );
        fs.writeFileSync(liveUpdatesPath, luContent);
        console.log(`🔄 live-updates.js: → ${newVersion}`);
    }

    console.log(`\n✅ Versiones actualizadas exitosamente a ${newVersion}`);
    console.log('📝 Archivos modificados:');
    console.log('   • manifest.json');
    console.log('   • package.json');
    console.log('   • android/app/build.gradle');
    console.log('   • sw.js');
    console.log('   • js/version-manager.js');
    console.log('   • js/live-updates.js');
    console.log('\n🚀 Ejecuta "npm run deploy" para sincronizar cambios');

} catch (error) {
    console.error('❌ Error actualizando versiones:', error.message);
    process.exit(1);
}