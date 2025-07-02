# 📱 Instalación Directa - El Borracho

## 🚀 Descargar APK para Android

### Opción 1: Desde GitHub Releases (Recomendado)
1. Ve a la sección [Releases](../../releases) de este repositorio
2. Descarga el archivo `app-debug.apk` de la versión más reciente
3. Instala siguiendo las instrucciones de instalación

### Opción 2: Desde GitHub Actions
1. Ve a la pestaña [Actions](../../actions)
2. Selecciona el workflow "Build Android APK" más reciente
3. Descarga el artefacto `el-borracho-apk`
4. Extrae el archivo APK e instala

## 📲 Instrucciones de Instalación

### Para Android:
1. **Habilitar fuentes desconocidas:**
   - Ve a `Configuración > Seguridad`
   - Activa `Fuentes desconocidas` o `Instalar apps desconocidas`
   - En Android 8+: `Configuración > Apps > Acceso especial > Instalar apps desconocidas`

2. **Instalar APK:**
   - Descarga el archivo `app-debug.apk` o `el-borracho.apk`
   - Abre el archivo desde tu gestor de archivos
   - Toca "Instalar" cuando aparezca el prompt
   - Espera que termine la instalación

3. **Abrir la app:**
   - Busca el ícono "El Borracho" en tu pantalla de inicio
   - ¡Listo para pedir licores a domicilio! 🍻

## 🔧 Para Desarrolladores

### Construir APK localmente:
```bash
# Instalar dependencias
npm install

# Sincronizar archivos web
npm run deploy

# Construir APK
npm run build-apk
```

### Desarrollo:
```bash
# Servidor de desarrollo
npm run dev

# Abrir en Android Studio
npx cap open android
```

## ⚠️ Notas Importantes

- **Seguridad:** Solo descarga APKs desde fuentes oficiales
- **Compatibilidad:** Requiere Android 5.0 (API 21) o superior
- **Tamaño:** Aproximadamente 10-15 MB
- **Permisos:** Internet (para cargar productos y conectar WhatsApp)

## 📞 Soporte

Si tienes problemas con la instalación:
- WhatsApp: [573174144815](https://wa.me/573174144815)
- Email: Crea un issue en este repositorio

## 🎯 Ventajas de la Instalación Directa

✅ **Sin Google Play Store** - Instalación inmediata  
✅ **Actualizaciones rápidas** - Nuevas versiones directas desde GitHub  
✅ **Tamaño optimizado** - Sin bloatware de tiendas de apps  
✅ **Funcionalidad completa** - Todas las características disponibles  
✅ **Instalación offline** - Una vez descargado, no necesita internet para instalar