@echo off
echo 🚀 Configuracion rapida de El Borracho para Windows
echo.

echo 📋 Configurando variables de entorno...
setx JAVA_HOME "C:\Users\USUARIO\Downloads\jdk-17.0.15+6"
setx ANDROID_HOME "C:\Users\USUARIO\AppData\Local\Android\Sdk"
setx ANDROID_SDK_ROOT "C:\Users\USUARIO\AppData\Local\Android\Sdk"

echo.
echo 🔧 Agregando al PATH...
setx PATH "%PATH%;C:\Users\USUARIO\Downloads\jdk-17.0.15+6\bin"
setx PATH "%PATH%;C:\Users\USUARIO\AppData\Local\Android\Sdk\platform-tools"
setx PATH "%PATH%;C:\Users\USUARIO\AppData\Local\Android\Sdk\tools"

echo.
echo ✅ Variables configuradas! 
echo.
echo 🔄 IMPORTANTE: Reinicia la terminal (cmd/powershell) para aplicar cambios
echo.
echo 📱 Para usar:
echo    1. Reinicia la terminal
echo    2. Conecta tu celular por USB
echo    3. Ejecuta: npm run build-apk-windows
echo    4. Ejecuta: npm run install-device
echo.
pause