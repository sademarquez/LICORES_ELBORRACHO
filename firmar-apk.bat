@echo off
set JAVA_HOME=C:\Users\USUARIO\Downloads\jdk-17.0.15+6
set Path=%JAVA_HOME%\bin;%Path%
npm run build-apk

PS C:\Users\USUARIO>    E:\pwa\LICORES_ELBORRACHO
E:\pwa\LICORES_ELBORRACHO : El término 'E:\pwa\LICORES_ELBORRACHO' no se reconoce como nombre de un cmdlet, función,
archivo de script o programa ejecutable. Compruebe si escribió correctamente el nombre o, si incluyó una ruta de
acceso, compruebe que dicha ruta es correcta e inténtelo de nuevo.
En línea: 1 Carácter: 4
+    E:\pwa\LICORES_ELBORRACHO
+    ~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (E:\pwa\LICORES_ELBORRACHO:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\Users\USUARIO>








@echo off
setlocal
set APK=el-borracho.apk
set APK_SIGNED=el-borracho-signed.apk
set KEYSTORE=lb-release.keystore
set ALIAS=lbkey
set STOREPASS=elborracho2024
set KEYPASS=elborracho2024

REM Generar keystore si no existe
if not exist %KEYSTORE% (
  echo Generando keystore de prueba...
  keytool -genkeypair -v -keystore %KEYSTORE% -alias %ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %STOREPASS% -keypass %KEYPASS% -dname "CN=El Borracho, OU=LB, O=LB, L=CO, S=CO, C=CO"
)

REM Firmar el APK
if exist %APK% (
  echo Firmando APK...
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore %KEYSTORE% -storepass %STOREPASS% -keypass %KEYPASS% %APK% %ALIAS%
  REM Renombrar APK firmado
  copy /Y %APK% %APK_SIGNED%
  echo APK firmado como %APK_SIGNED%
) else (
  echo ERROR: No se encontró %APK%
)
endlocal 