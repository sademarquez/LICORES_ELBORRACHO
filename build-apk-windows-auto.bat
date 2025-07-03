@echo off
REM === CONFIGURAR JAVA_HOME Y PATH PARA JDK 21 ===
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "Path=%JAVA_HOME%\bin;%Path%"

where java >nul 2>nul || (echo ERROR: JDK 21 no encontrado en %JAVA_HOME%. Instala JDK 21 y actualiza la ruta en este script. & pause & exit /b)
java -version

REM === LIMPIAR ENTORNO NATIVO ===
if exist android rmdir /s /q android
if exist www rmdir /s /q www
if exist el-borracho.apk del el-borracho.apk

REM === REINSTALAR DEPENDENCIAS NODE ===
if not exist node_modules (
    echo Instalando dependencias de Node.js...
    npm install || (echo ERROR: No se pudieron instalar las dependencias de Node.js. & pause & exit /b)
)

REM === INICIALIZAR CAPACITOR ===
npx cap init el-borracho com.elborracho.app --web-dir=www --npm-client=npm --no-interactive || (echo ERROR: No se pudo inicializar Capacitor. & pause & exit /b)

REM === AGREGAR PLATAFORMA ANDROID ===
npx cap add android --no-interactive || (echo ERROR: No se pudo agregar la plataforma Android. & pause & exit /b)

REM === RECONSTRUIR ASSETS WEB ===
npm run deploy || (echo ERROR: Falló el deploy de assets web. & pause & exit /b)

REM === SINCRONIZAR CAPACITOR ===
npx cap sync || (echo ERROR: Falló la sincronización de Capacitor. & pause & exit /b)

REM === COMPILAR APK ===
cd android
call gradlew.bat clean
call gradlew.bat assembleDebug || (echo ERROR: Falló la compilación de la APK. & pause & exit /b)
cd ..

REM === COPIAR APK AL ROOT ===
set "APK_SRC=android\app\build\outputs\apk\debug\app-debug.apk"
set "APK_DEST=el-borracho.apk"
if exist %APK_SRC% copy /Y %APK_SRC% %APK_DEST%

if exist %APK_DEST% (
    echo APK creada exitosamente: %APK_DEST%
    pause
    exit /b 0
) else (
    echo ERROR: No se encontró la APK generada.
    pause
    exit /b 1
) 