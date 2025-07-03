#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🍺 Creando iconos simples de cerveza para Android...\n');

// Crear un icono simple usando texto de emoji
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

function createSimpleBeerIcon(size) {
    // SVG simple con emoji de cerveza
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo circular dorado -->
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="70%" style="stop-color:#D4AF37"/>
      <stop offset="100%" style="stop-color:#B8941F"/>
    </radialGradient>
  </defs>
  
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#bg)"/>
  
  <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" dominant-baseline="middle" 
        fill="#FFFFFF" font-size="${size*0.6}" font-family="Arial, sans-serif">🍺</text>
</svg>`;
    
    return svg;
}

function saveSVGIcon(size, directory, filename) {
    const svg = createSimpleBeerIcon(size);
    const filepath = path.join(directory, filename);
    
    // Crear directorio si no existe
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Creado: ${filepath} (${size}x${size})`);
    return filepath;
}

// Crear iconos PWA
console.log('📱 Creando iconos PWA...');
const pwaDir = path.join(__dirname, 'images', 'icons', 'pwa');

iconSizes.forEach(size => {
    saveSVGIcon(size, pwaDir, `icon-${size}x${size}.svg`);
});

// Crear iconos para Android
console.log('\n🤖 Creando iconos para Android...');

const androidSizes = [
    { size: 48, name: 'mdpi' },
    { size: 72, name: 'hdpi' },
    { size: 96, name: 'xhdpi' },
    { size: 144, name: 'xxhdpi' },
    { size: 192, name: 'xxxhdpi' }
];

androidSizes.forEach(iconData => {
    const androidDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', `mipmap-${iconData.name}`);
    
    // Crear los diferentes tipos de iconos de Android
    saveSVGIcon(iconData.size, androidDir, 'ic_launcher.svg');
    saveSVGIcon(iconData.size, androidDir, 'ic_launcher_foreground.svg');
    saveSVGIcon(iconData.size, androidDir, 'ic_launcher_round.svg');
});

// Crear icono principal
console.log('\n🎯 Creando icono principal...');
saveSVGIcon(512, path.join(__dirname, 'images'), 'logo-beer.svg');

console.log('\n🎉 ¡Iconos de cerveza creados exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('   1. npm run deploy');
console.log('   2. npm run build-apk-windows');
console.log('   3. npm run install-device');
console.log('\n💡 Para iconos más elaborados, ve a: http://localhost:3000/create-beer-icon.html');