@echo off
set APK=el-borracho-signed.apk

if not exist %APK% (
  echo ERROR: No se encontró %APK%. Asegúrate de firmar el APK primero.
  pause
  exit /b 1
)

adb devices
adb install -r %APK%

if %errorlevel%==0 (
  echo APK instalado correctamente en el dispositivo.
) else (
  echo ERROR al instalar el APK. Revisa que el dispositivo esté conectado y autorizado.
)
pause 