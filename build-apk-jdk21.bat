@echo off
REM === CONFIGURAR JAVA_HOME Y PATH PARA JDK 21 ===
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "Path=%JAVA_HOME%\bin;%Path%"
echo JAVA_HOME configurado a: %JAVA_HOME%
java -version

REM === LIMPIAR BUILDS ANTERIORES ===
cd android
if exist app\build rmdir /s /q app\build
if exist .gradle rmdir /s /q .gradle
cd ..
if exist www rmdir /s /q www
if exist el-borracho.apk del el-borracho.apk

REM === RECONSTRUIR ASSETS WEB ===
npm run deploy

REM === SINCRONIZAR CAPACITOR ===
npx cap sync

REM === COMPILAR APK ===
cd android
call gradlew.bat assembleDebug
cd ..

REM === COPIAR APK AL ROOT ===
set "APK_SRC=android\app\build\outputs\apk\debug\app-debug.apk"
set "APK_DEST=el-borracho.apk"
if exist %APK_SRC% copy /Y %APK_SRC% %APK_DEST%

if exist %APK_DEST% (
    echo APK creada exitosamente: %APK_DEST%
) else (
    echo ERROR: No se encontró la APK generada.
) 