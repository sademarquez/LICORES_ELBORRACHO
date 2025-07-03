#!/usr/bin/env python3

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_beer_icon(size):
    """Crea un icono de cerveza usando PIL"""
    
    # Crear imagen con fondo transparente
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Centro y escala
    center_x = size // 2
    center_y = size // 2
    scale = size / 512.0
    
    # Fondo circular dorado
    bg_radius = size // 2
    # Crear gradiente dorado (simulado con círculos concéntricos)
    for i in range(bg_radius, 0, -2):
        ratio = i / bg_radius
        if ratio > 0.7:
            color = (255, 215, 0, 255)  # Gold
        elif ratio > 0.4:
            color = (212, 175, 55, 255)  # Golden
        else:
            color = (184, 148, 31, 255)  # Dark gold
        
        draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i], 
                    fill=color, outline=None)
    
    # Dimensiones del vaso
    glass_width = int(120 * scale)
    glass_height = int(180 * scale)
    glass_x = center_x - glass_width // 2
    glass_y = center_y - glass_height // 2 + int(20 * scale)
    
    # Cuerpo del vaso (forma trapecial)
    glass_top_width = int(15 * scale)
    glass_bottom_width = int(5 * scale)
    
    vaso_points = [
        (glass_x + glass_top_width, glass_y),
        (glass_x + glass_width - glass_top_width, glass_y),
        (glass_x + glass_width - glass_bottom_width, glass_y + glass_height),
        (glass_x + glass_bottom_width, glass_y + glass_height)
    ]
    
    # Dibujar vaso
    draw.polygon(vaso_points, fill=(245, 245, 245, 255), outline=(176, 176, 176, 255))
    
    # Cerveza dentro del vaso
    beer_margin = int(8 * scale)
    beer_top_y = glass_y + int(30 * scale)
    
    cerveza_points = [
        (glass_x + glass_top_width + beer_margin, beer_top_y),
        (glass_x + glass_width - glass_top_width - beer_margin, beer_top_y),
        (glass_x + glass_width - glass_bottom_width - beer_margin, glass_y + glass_height - int(10 * scale)),
        (glass_x + glass_bottom_width + beer_margin, glass_y + glass_height - int(10 * scale))
    ]
    
    draw.polygon(cerveza_points, fill=(255, 140, 0, 255))  # Naranja cerveza
    
    # Espuma (burbujas)
    foam_y = glass_y + int(10 * scale)
    bubbles = [
        (center_x - int(25 * scale), foam_y, int(12 * scale)),
        (center_x + int(10 * scale), foam_y - int(5 * scale), int(15 * scale)),
        (center_x + int(35 * scale), foam_y + int(5 * scale), int(10 * scale)),
        (center_x - int(5 * scale), foam_y + int(10 * scale), int(8 * scale)),
        (center_x + int(20 * scale), foam_y + int(15 * scale), int(6 * scale))
    ]
    
    for bubble in bubbles:
        x, y, r = bubble
        draw.ellipse([x - r, y - r, x + r, y + r], 
                    fill=(255, 251, 240, 255), outline=(240, 230, 140, 255))
    
    # Asa del vaso
    handle_x = glass_x + glass_width + int(10 * scale)
    handle_y = center_y
    handle_radius = int(25 * scale)
    
    # Dibujar asa como arco
    for thickness in range(int(8 * scale)):
        draw.arc([handle_x - handle_radius - thickness, handle_y - handle_radius - thickness,
                 handle_x + handle_radius + thickness, handle_y + handle_radius + thickness],
                start=-60, end=60, fill=(176, 176, 176, 255))
    
    # Brillo en el vaso
    shine_x = glass_x + int(30 * scale)
    shine_y = glass_y + int(60 * scale)
    shine_width = int(8 * scale)
    shine_height = int(40 * scale)
    
    draw.ellipse([shine_x - shine_width, shine_y - shine_height,
                 shine_x + shine_width, shine_y + shine_height],
                fill=(255, 255, 255, 100))
    
    return img

def create_all_beer_icons():
    """Genera todos los iconos necesarios para Android"""
    
    print("🍺 Generando iconos de cerveza para Android...\n")
    
    # Tamaños para PWA
    pwa_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    pwa_dir = "images/icons/pwa"
    
    # Crear directorio PWA si no existe
    os.makedirs(pwa_dir, exist_ok=True)
    
    print("📱 Creando iconos PWA...")
    for size in pwa_sizes:
        icon = create_beer_icon(size)
        filepath = f"{pwa_dir}/icon-{size}x{size}.png"
        icon.save(filepath, "PNG")
        print(f"✅ Creado: {filepath}")
    
    # Tamaños para Android
    android_sizes = [
        (48, "mdpi"),
        (72, "hdpi"), 
        (96, "xhdpi"),
        (144, "xxhdpi"),
        (192, "xxxhdpi")
    ]
    
    print("\n🤖 Creando iconos para Android...")
    for size, density in android_sizes:
        android_dir = f"android/app/src/main/res/mipmap-{density}"
        os.makedirs(android_dir, exist_ok=True)
        
        icon = create_beer_icon(size)
        
        # Crear los tres tipos de iconos
        icon.save(f"{android_dir}/ic_launcher.png", "PNG")
        icon.save(f"{android_dir}/ic_launcher_foreground.png", "PNG") 
        icon.save(f"{android_dir}/ic_launcher_round.png", "PNG")
        
        print(f"✅ Creado: {android_dir}/ic_launcher*.png ({size}x{size})")
    
    # Icono principal grande
    print("\n🎯 Creando icono principal...")
    main_icon = create_beer_icon(512)
    main_icon.save("images/logo-beer.png", "PNG")
    print("✅ Creado: images/logo-beer.png")
    
    print("\n🎉 ¡Todos los iconos de cerveza creados exitosamente!")
    print("\n📋 Próximos pasos:")
    print("   1. npm run deploy")
    print("   2. npm run build-apk-windows (o usar APK existente)")
    print("   3. npm run install-device")

if __name__ == "__main__":
    try:
        create_all_beer_icons()
    except ImportError:
        print("❌ PIL (Pillow) no está instalado.")
        print("📦 Instalando Pillow...")
        import subprocess
        subprocess.check_call(["pip", "install", "pillow"])
        print("✅ Pillow instalado. Reintentando...")
        create_all_beer_icons()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Alternativa: Ve a http://localhost:3000/create-beer-icon.html")