@echo off
set JAVA_HOME=C:\Users\USUARIO\Downloads\jdk-17.0.15+6
set Path=%JAVA_HOME%\bin;%Path%

REM Limpiar build y caché de Gradle
cd android
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
call gradlew.bat clean
cd ..
if exist .gradle rmdir /s /q .gradle

REM Ejecutar build y firma automática
npm run build-apk
pause 