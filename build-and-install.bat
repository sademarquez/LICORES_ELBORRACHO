@echo off
echo 🍺 El Borracho - Build e Instalacion Automatica
echo.

echo 📱 Verificando dispositivo Android...
adb devices
echo.

echo 📦 Construyendo APK...
npm run build-apk-windows
echo.

if exist "el-borracho.apk" (
    echo ✅ APK construido exitosamente!
    echo.
    echo 📱 Instalando en dispositivo...
    npm run install-device
    echo.
    echo 🎉 ¡Listo! La aplicación debería estar instalada en tu celular
) else (
    echo ❌ Error: No se pudo construir el APK
    echo Verifica que:
    echo    1. Java esté instalado
    echo    2. Android SDK esté configurado
    echo    3. Las variables de entorno estén configuradas
)

echo.
pause