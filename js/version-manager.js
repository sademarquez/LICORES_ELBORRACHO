class VersionManager {
    constructor() {
        this.currentVersion = '1.0.2';
        this.updateCheckInterval = 5 * 60 * 1000; // 5 minutos
        this.init();
    }

    async init() {
        // Registrar service worker si no está registrado
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                
                // Escuchar actualizaciones del service worker
                registration.addEventListener('updatefound', () => {
                    this.showUpdateNotification();
                });
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
            }
        }

        // Verificar actualizaciones periódicamente
        this.startPeriodicCheck();
        
        // Verificar inmediatamente
        await this.checkForUpdates();
    }

    async checkForUpdates() {
        try {
            // Verificar versión del manifest
            const response = await fetch('/manifest.json?t=' + Date.now());
            const manifest = await response.json();
            
            if (manifest.version && this.isNewerVersion(manifest.version, this.currentVersion)) {
                this.showUpdateNotification(manifest.version);
            }
        } catch (error) {
            console.error('Error verificando actualizaciones:', error);
        }
    }

    showUpdateNotification(newVersion) {
        // Verificar si ya hay una notificación visible
        if (document.getElementById('version-update-banner')) {
            return;
        }

        const updateBanner = document.createElement('div');
        updateBanner.id = 'version-update-banner';
        updateBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #D4AF37, #FFBF00);
            color: #000;
            padding: 12px 15px;
            text-align: center;
            font-weight: bold;
            font-size: 0.9rem;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        `;
        
        updateBanner.innerHTML = `
            <span>🆕 Nueva versión disponible${newVersion ? ': ' + newVersion : ''}</span>
            <button onclick="window.versionManager.reloadApp()" 
                    style="padding: 4px 12px; background: #111; color: #D4AF37; border: none; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                Actualizar
            </button>
            <button onclick="this.parentElement.remove()" 
                    style="padding: 4px 8px; background: transparent; border: 1px solid #000; border-radius: 4px; font-size: 0.8rem;">
                ×
            </button>
        `;
        
        document.body.appendChild(updateBanner);
        
        // Mostrar banner con animación
        setTimeout(() => {
            updateBanner.style.transform = 'translateY(0)';
        }, 100);

        // Auto-remover después de 30 segundos si no se hace clic
        setTimeout(() => {
            if (updateBanner.parentElement) {
                updateBanner.style.transform = 'translateY(-100%)';
                setTimeout(() => updateBanner.remove(), 300);
            }
        }, 30000);
    }

    async reloadApp() {
        try {
            // Limpiar caché del service worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // Limpiar caché del navegador
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            // Mostrar mensaje de recarga
            const banner = document.getElementById('version-update-banner');
            if (banner) {
                banner.innerHTML = `
                    <span>🔄 Actualizando aplicación...</span>
                `;
            }

            // Recargar la página después de una pausa
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);

        } catch (error) {
            console.error('Error recargando app:', error);
            // Fallback: simplemente recargar
            window.location.reload(true);
        }
    }

    startPeriodicCheck() {
        setInterval(() => {
            this.checkForUpdates();
        }, this.updateCheckInterval);
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

    // Método para incrementar versión automáticamente
    static generateNewVersion(currentVersion) {
        const parts = currentVersion.split('.').map(Number);
        parts[2] = (parts[2] || 0) + 1; // Incrementar patch version
        return parts.join('.');
    }

    // Método para verificar manualmente
    async manualCheck() {
        await this.checkForUpdates();
    }
}

// Hacer disponible globalmente
window.versionManager = new VersionManager();

export default VersionManager;