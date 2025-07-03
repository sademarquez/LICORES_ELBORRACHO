#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

console.log('🍺 Actualizando iconos de Android con vaso de cerveza...\n');

// Tamaños de iconos para Android
const androidIconSizes = [
    { size: 72, density: 'hdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 192, density: 'xxxhdpi' }
];

const mipmapSizes = [
    { size: 48, name: 'mdpi' },
    { size: 72, name: 'hdpi' },
    { size: 96, name: 'xhdpi' },
    { size: 144, name: 'xxhdpi' },
    { size: 192, name: 'xxxhdpi' }
];

function drawBeerIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, size, size);
    
    // Establecer el centro
    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size / 512; // Escalar basado en 512px como base
    
    // Fondo circular dorado
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size/2);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.7, '#D4AF37');
    gradient.addColorStop(1, '#B8941F');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cuerpo del vaso de cerveza
    const glassWidth = 120 * scale;
    const glassHeight = 180 * scale;
    const glassX = centerX - glassWidth/2;
    const glassY = centerY - glassHeight/2 + 20 * scale;
    
    // Gradiente del vaso
    ctx.fillStyle = '#F5F5F5';
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 3 * scale;
    
    // Dibujar el vaso (forma ligeramente cónica)
    ctx.beginPath();
    ctx.moveTo(glassX + 15 * scale, glassY);
    ctx.lineTo(glassX + glassWidth - 15 * scale, glassY);
    ctx.lineTo(glassX + glassWidth - 5 * scale, glassY + glassHeight);
    ctx.lineTo(glassX + 5 * scale, glassY + glassHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Cerveza dentro del vaso
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(glassX + 18 * scale, glassY + 30 * scale);
    ctx.lineTo(glassX + glassWidth - 18 * scale, glassY + 30 * scale);
    ctx.lineTo(glassX + glassWidth - 8 * scale, glassY + glassHeight - 10 * scale);
    ctx.lineTo(glassX + 8 * scale, glassY + glassHeight - 10 * scale);
    ctx.closePath();
    ctx.fill();
    
    // Espuma de la cerveza
    ctx.fillStyle = '#FFFBF0';
    ctx.strokeStyle = '#F0E68C';
    ctx.lineWidth = 2 * scale;
    
    // Burbujas de espuma
    const bubbles = [
        {x: centerX - 25 * scale, y: glassY + 10 * scale, r: 12 * scale},
        {x: centerX + 10 * scale, y: glassY + 5 * scale, r: 15 * scale},
        {x: centerX + 35 * scale, y: glassY + 15 * scale, r: 10 * scale},
        {x: centerX - 5 * scale, y: glassY + 20 * scale, r: 8 * scale}
    ];
    
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
    
    // Asa del vaso
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 8 * scale;
    
    ctx.beginPath();
    ctx.arc(glassX + glassWidth + 10 * scale, centerY, 25 * scale, -Math.PI/3, Math.PI/3, false);
    ctx.stroke();
}

function createAndSaveIcon(size, filepath) {
    try {
        const canvas = createCanvas(size, size);
        drawBeerIcon(canvas, size);
        
        const buffer = canvas.toBuffer('image/png');
        
        // Crear directorio si no existe
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Creado: ${filepath} (${size}x${size})`);
        return true;
    } catch (error) {
        console.error(`❌ Error creando ${filepath}:`, error.message);
        return false;
    }
}

// Función principal
async function updateAndroidIcons() {
    let successCount = 0;
    let totalCount = 0;
    
    // Actualizar iconos PWA
    console.log('📱 Actualizando iconos PWA...');
    const pwaIconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    for (const size of pwaIconSizes) {
        totalCount++;
        const filepath = path.join(__dirname, 'images', 'icons', 'pwa', `icon-${size}x${size}.png`);
        if (createAndSaveIcon(size, filepath)) {
            successCount++;
        }
    }
    
    // Actualizar iconos de Android (mipmap)
    console.log('\n🤖 Actualizando iconos de Android (mipmap)...');
    for (const iconData of mipmapSizes) {
        totalCount++;
        const filepath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', `mipmap-${iconData.name}`, 'ic_launcher.png');
        if (createAndSaveIcon(iconData.size, filepath)) {
            successCount++;
        }
        
        totalCount++;
        const foregroundPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', `mipmap-${iconData.name}`, 'ic_launcher_foreground.png');
        if (createAndSaveIcon(iconData.size, foregroundPath)) {
            successCount++;
        }
        
        totalCount++;
        const roundPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', `mipmap-${iconData.name}`, 'ic_launcher_round.png');
        if (createAndSaveIcon(iconData.size, roundPath)) {
            successCount++;
        }
    }
    
    console.log(`\n🎉 Proceso completado: ${successCount}/${totalCount} iconos actualizados`);
    
    if (successCount === totalCount) {
        console.log('✅ Todos los iconos se actualizaron correctamente');
        console.log('\n📋 Próximos pasos:');
        console.log('   1. npm run deploy');
        console.log('   2. npm run build-apk-windows');
        console.log('   3. npm run install-device');
    } else {
        console.log('⚠️  Algunos iconos no se pudieron actualizar');
    }
}

// Verificar si canvas está disponible
try {
    require('canvas');
    updateAndroidIcons();
} catch (error) {
    console.log('❌ El paquete "canvas" no está instalado.');
    console.log('📦 Instalando canvas...');
    
    const { execSync } = require('child_process');
    try {
        execSync('npm install canvas', { stdio: 'inherit' });
        console.log('✅ Canvas instalado. Reintentando...');
        updateAndroidIcons();
    } catch (installError) {
        console.log('❌ No se pudo instalar canvas automáticamente.');
        console.log('🔧 Solución manual:');
        console.log('   1. Ve a: http://localhost:3000/create-beer-icon.html');
        console.log('   2. Descarga todos los iconos');
        console.log('   3. Reemplaza manualmente en:');
        console.log('      - images/icons/pwa/');
        console.log('      - android/app/src/main/res/mipmap-*/');
    }
}