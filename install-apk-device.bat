@echo off
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
if not exist %APK_PATH% (
    echo ERROR: No se encontró la APK en %APK_PATH%.
    pause
    exit /b 1
)
where adb >nul 2>nul || (echo ERROR: adb (Android Debug Bridge) no está en el PATH. Instala Android Platform Tools. & pause & exit /b 1)
echo Instalando APK en el dispositivo conectado...
adb install -r %APK_PATH%
echo Instalación completada. Revisa tu dispositivo.
pause 