@echo off
setlocal

REM === CONFIGURAR JAVA_HOME Y PATH PARA JDK 21 ===
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "Path=%JAVA_HOME%\bin;%Path%"

where java >nul 2>nul || (echo ERROR: JDK 21 no encontrado en %JAVA_HOME%. Instala JDK 21 y actualiza la ruta en este script. & exit /b 1)
java -version

REM LIMPIEZA
if exist android rmdir /s /q android
if exist www rmdir /s /q www
if exist el-borracho.apk del el-borracho.apk

REM DEPENDENCIAS
if not exist node_modules (
    npm install || (echo ERROR: No se pudieron instalar las dependencias. & exit /b 1)
)

REM INICIALIZAR CAPACITOR Y ANDROID
npx cap init el-borracho com.elborracho.app --web-dir=www --npm-client=npm --no-interactive || (echo ERROR: No se pudo inicializar Capacitor. & exit /b 1)
npx cap add android --no-interactive || (echo ERROR: No se pudo agregar la plataforma Android. & exit /b 1)

REM BUILD WEB Y SYNC
npm run deploy || (echo ERROR: Falló el deploy de assets web. & exit /b 1)
npx cap sync || (echo ERROR: Falló la sincronización de Capacitor. & exit /b 1)

REM BUILD APK
cd android
call gradlew.bat clean
call gradlew.bat assembleDebug --stacktrace || (echo ERROR: Falló la compilación de la APK. & exit /b 1)
cd ..

REM COPIAR APK
if exist android\app\build\outputs\apk\debug\app-debug.apk (
    copy /Y android\app\build\outputs\apk\debug\app-debug.apk el-borracho.apk
    echo APK creada exitosamente: el-borracho.apk
    exit /b 0
) else (
    echo ERROR: No se encontró la APK generada.
    exit /b 1
)
endlocal 