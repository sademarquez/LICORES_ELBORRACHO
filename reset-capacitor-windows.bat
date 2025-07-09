@echo off
REM === CONFIGURAR JAVA_HOME Y PATH PARA JDK 17 ===
set "JAVA_HOME_JDK17=C:\Program Files\Java\jdk-17"
REM Attempt to locate a specific JDK 17 version if the generic one is not found
if not exist "%JAVA_HOME_JDK17%\bin\java.exe" (
    echo "JDK 17 no encontrado en %JAVA_HOME_JDK17%, buscando alternativas..."
    for /d %%J in ("C:\Program Files\Java\jdk-17.*") do (
        if exist "%%J\bin\java.exe" (
            set "JAVA_HOME_JDK17=%%J"
            echo "Usando JDK 17 encontrado en %%J"
            goto found_jdk17
        )
    )
    for /d %%J in ("C:\Program Files\Eclipse Adoptium\jdk-17.*") do (
        if exist "%%J\bin\java.exe" (
            set "JAVA_HOME_JDK17=%%J"
            echo "Usando JDK 17 (Eclipse Adoptium) encontrado en %%J"
            goto found_jdk17
        )
    )
    echo ERROR: JDK 17 no encontrado en rutas comunes.
    echo Por favor, instala JDK 17 y actualiza la ruta JAVA_HOME_JDK17 en este script si es necesario.
    pause
    exit /b
)
:found_jdk17
set "JAVA_HOME=%JAVA_HOME_JDK17%"
set "Path=%JAVA_HOME%\bin;%Path%"
echo JAVA_HOME configurado a: %JAVA_HOME%
java -version || (echo ERROR: No se pudo verificar la version de Java. Asegurate que JDK 17 este correctamente instalado y configurado. & pause & exit /b)

REM Validar que la version de Java sea 17
java -version 2>&1 | findstr /r /c:"17\." > nul
if errorlevel 1 (
    echo ERROR: La version de Java no es 17. Actualmente es:
    java -version
    echo Por favor, asegura que JAVA_HOME apunte a una instalacion de JDK 17.
    pause
    exit /b
)
echo Version de Java 17 verificada.

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
npx cap init el-borracho com.elborracho.app --web-dir=www --npm-client=npm || (echo ERROR: No se pudo inicializar Capacitor. & pause & exit /b)

REM === AGREGAR PLATAFORMA ANDROID ===
npx cap add android || (echo ERROR: No se pudo agregar la plataforma Android. & pause & exit /b)

REM === RECONSTRUIR ASSETS WEB ===
npm run deploy || (echo ERROR: Falló el deploy de assets web. & pause & exit /b)

REM === SINCRONIZAR CAPACITOR ===
npx cap sync || (echo ERROR: Falló la sincronización de Capacitor. & pause & exit /b)

REM === COMPILAR APK ===
cd android
..\android\gradlew.bat assembleDebug || (echo ERROR: Falló la compilación de la APK. & pause & exit /b)
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
pause 