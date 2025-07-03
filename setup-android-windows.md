# Configuración de Android en Windows para El Borracho

## 📋 Requisitos

### 1. Java Development Kit (JDK)
- **Versión requerida**: Java 17 o superior
- **Descarga**: [Eclipse Temurin](https://adoptium.net/temurin/releases/)
- **Instalación**: Descargar e instalar Java 17 LTS

### 2. Android Studio y SDK
- **Descarga**: [Android Studio](https://developer.android.com/studio)
- **Instalación**: Instalar Android Studio completo

### 3. Variables de Entorno

Configurar en Windows:
```bash
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

Agregar al PATH:
```bash
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

## 🛠️ Instalación Paso a Paso

### 1. Instalar Java 17
```bash
# Verificar instalación
java -version
```

### 2. Instalar Android Studio
1. Descargar Android Studio
2. Ejecutar instalador
3. Seguir el asistente de instalación
4. Instalar Android SDK (API 33 o superior)

### 3. Configurar Variables de Entorno
```cmd
# Abrir cmd como administrador
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot"
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx ANDROID_SDK_ROOT "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
```

### 4. Instalar Platform Tools
```bash
# En Android Studio:
# Tools > SDK Manager > SDK Tools > Android SDK Platform-Tools
```

## 📱 Preparar Dispositivo Android

### 1. Habilitar Opciones de Desarrollador
1. Ir a **Configuración** > **Acerca del teléfono**
2. Tocar **Número de compilación** 7 veces
3. Aparecerá "Eres un desarrollador"

### 2. Habilitar Depuración USB
1. Ir a **Configuración** > **Sistema** > **Opciones de desarrollador**
2. Activar **Depuración USB**
3. Activar **Instalar aplicaciones por USB**

### 3. Conectar Dispositivo
1. Conectar por cable USB
2. Aceptar diálogo de depuración USB
3. Verificar conexión: `adb devices`

## 🚀 Comandos de Build

### Build APK para Windows
```bash
npm run build-apk-windows
```

### Instalar en Dispositivo
```bash
npm run install-device
```

### Build e Instalar en un Comando
```bash
npm run build-apk-windows && npm run install-device
```

## 🔧 Solución de Problemas

### Error: Java not found
```bash
# Verificar instalación
java -version
# Configurar JAVA_HOME
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.8.7-hotspot"
```

### Error: ADB not found
```bash
# Agregar al PATH
setx PATH "%PATH%;C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools"
```

### Error: No devices found
1. Verificar que el dispositivo esté conectado
2. Verificar que la depuración USB esté habilitada
3. Aceptar diálogo de depuración USB
4. Ejecutar: `adb devices`

### Error: SDK not found
1. Abrir Android Studio
2. Ir a Tools > SDK Manager
3. Instalar Android SDK Platform-Tools
4. Configurar ANDROID_HOME

## 📋 Verificación Final

```bash
# Verificar Java
java -version

# Verificar Android SDK
adb version

# Verificar dispositivos
adb devices

# Verificar variables de entorno
echo %JAVA_HOME%
echo %ANDROID_HOME%
```

## 🎯 Comandos Útiles

```bash
# Limpiar build
npm run clean

# Sync cambios
npm run sync

# Build APK
npm run build-apk-windows

# Instalar APK
npm run install-device

# Ver logs de la app
adb logcat | grep -i "elborracho"

# Desinstalar app
adb uninstall com.elborracho.app
```

## 📞 Soporte

Si tienes problemas:
1. Verificar que todas las herramientas estén instaladas
2. Reiniciar la terminal después de configurar variables
3. Ejecutar como administrador si es necesario
4. Verificar que el dispositivo tenga espacio suficiente