// Importar solo si estamos en un entorno Capacitor
let LiveUpdate, App;

try {
    if (typeof window !== 'undefined' && window.Capacitor) {
        import('@capacitor/live-updates').then(module => {
            LiveUpdate = module.LiveUpdate;
        });
        import('@capacitor/app').then(module => {
            App = module.App;
        });
    }
} catch (error) {
    console.log('Capacitor modules not available - running in web mode');
}

class LiveUpdateManager {
    constructor() {
        this.currentVersion = '1.0.3';
        this.init();
    }

    async init() {
        try {
            // Verificar si Capacitor y módulos están disponibles
            if (!window.Capacitor || !App || !LiveUpdate) {
                console.log('Live Updates not available - running in web mode');
                return;
            }
            
            // Verificar si estamos en app nativa
            const info = await App.getInfo();
            if (info.platform !== 'web') {
                await this.checkForUpdates();
                this.setupUpdateListener();
            }
        } catch (error) {
            console.log('Live Updates not available:', error.message);
        }
    }

    async checkForUpdates() {
        try {
            // Verificar actualizaciones vía manifest (funciona sin servidor)
            const response = await fetch('/manifest.json?t=' + Date.now());
            const manifest = await response.json();
            
            if (manifest.version && this.isNewerVersion(manifest.version, this.currentVersion)) {
                await this.showUpdateNotification(manifest);
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    async showUpdateNotification(version) {
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #D4AF37, #FFBF00);
            color: #000;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        `;
        
        updateBanner.innerHTML = `
            <div>
                🆕 Nueva versión disponible: ${version.version}
                <button onclick="window.liveUpdateManager.downloadUpdate('${version.version || version}')" 
                        style="margin-left: 10px; padding: 5px 15px; background: #111; color: #D4AF37; border: none; border-radius: 5px; font-weight: bold;">
                    Actualizar Ahora
                </button>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-left: 5px; padding: 5px 10px; background: transparent; border: 1px solid #000; border-radius: 5px;">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        // Mostrar banner con animación
        setTimeout(() => {
            updateBanner.style.transform = 'translateY(0)';
        }, 100);
    }

    async downloadUpdate(version) {
        try {
            const banner = document.getElementById('update-banner');
            if (banner) {
                banner.innerHTML = `
                    <div>🔄 Actualizando contenido... Por favor espera</div>
                `;
            }

            // Limpiar todo el caché para forzar actualización
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            // Si estamos en app nativa, usar webView reload
            if (window.Capacitor) {
                if (banner) {
                    banner.innerHTML = `
                        <div>✅ Actualización completada. Reiniciando app...</div>
                    `;
                }
                
                // Recargar webview después de limpiar caché
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            } else {
                // En web, usar el método normal
                if (banner) {
                    banner.innerHTML = `
                        <div>✅ Actualización completada. Recargando...</div>
                    `;
                }
                
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            }

        } catch (error) {
            console.error('Error downloading update:', error);
            const banner = document.getElementById('update-banner');
            if (banner) {
                banner.innerHTML = `
                    <div>❌ Error al actualizar. Inténtalo más tarde.
                        <button onclick="this.parentElement.parentElement.remove()" 
                                style="margin-left: 10px; padding: 5px 10px; background: transparent; border: 1px solid #000; border-radius: 5px;">
                            Cerrar
                        </button>
                    </div>
                `;
            }
        }
    }

    setupUpdateListener() {
        // Escuchar eventos de actualización
        LiveUpdate.addListener('updateAvailable', (info) => {
            console.log('Update available:', info);
            this.showUpdateNotification(info);
        });

        LiveUpdate.addListener('updateFailed', (info) => {
            console.error('Update failed:', info);
        });
    }

    isNewerVersion(newVersion, currentVersion) {
        const newParts = newVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            const newPart = newParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }

    // Método para verificar manualmente actualizaciones
    async manualCheck() {
        await this.checkForUpdates();
    }
}

// Hacer disponible globalmente
window.liveUpdateManager = new LiveUpdateManager();

export default LiveUpdateManager;