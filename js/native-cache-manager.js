// Sistema de gestión de caché específico para app nativa
class NativeCacheManager {
    constructor() {
        this.cacheVersion = '1.0.4';
        this.init();
    }

    async init() {
        // Solo ejecutar en app nativa
        if (!window.Capacitor) {
            return;
        }

        console.log('🔧 Inicializando NativeCacheManager para app nativa');
        
        // Verificar y limpiar caché obsoleto
        await this.checkAndClearObsoleteCache();
        
        // Configurar interceptor de imágenes
        this.setupImageInterceptor();
        
        // Forzar recarga de imágenes si es necesario
        await this.forceImageReload();
    }

    async checkAndClearObsoleteCache() {
        try {
            const lastCacheVersion = localStorage.getItem('el_borracho_cache_version');
            
            if (lastCacheVersion !== this.cacheVersion) {
                console.log('🗑️ Limpiando caché obsoleto...');
                
                // Limpiar caché del Service Worker
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                }
                
                // Limpiar localStorage de imágenes cacheadas
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('el_borracho_img_')) {
                        localStorage.removeItem(key);
                    }
                });
                
                // Actualizar versión de caché
                localStorage.setItem('el_borracho_cache_version', this.cacheVersion);
                
                console.log('✅ Caché limpiado exitosamente');
            }
        } catch (error) {
            console.error('Error limpiando caché:', error);
        }
    }

    setupImageInterceptor() {
        // Interceptar todas las cargas de imágenes de productos
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'img') {
                element.addEventListener('load', function() {
                    // Marcar imagen como cargada exitosamente
                    if (this.src.includes('/images/products/')) {
                        console.log('🖼️ Imagen cargada:', this.src);
                    }
                });
                
                element.addEventListener('error', function() {
                    // Si falla, intentar recargar con timestamp
                    if (this.src.includes('/images/products/') && !this.src.includes('?t=')) {
                        console.log('🔄 Recargando imagen fallida:', this.src);
                        this.src = this.src + '?t=' + Date.now();
                    }
                });
            }
            
            return element;
        };
    }

    async forceImageReload() {
        // Esperar a que la página se cargue completamente
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Forzar recarga inmediata
        this.reloadAllProductImages();
        
        // También configurar observer para imágenes que se cargan dinámicamente
        this.setupImageObserver();
    }

    reloadAllProductImages() {
        const productImages = document.querySelectorAll('img[src*="/images/products/"], img[src*="images/products/"]');
        
        if (productImages.length > 0) {
            console.log(`🔄 Forzando recarga de ${productImages.length} imágenes de productos`);
            
            productImages.forEach((img, index) => {
                setTimeout(() => {
                    const timestamp = Date.now() + index;
                    const originalSrc = img.src.split('?')[0]; // Remover timestamp anterior
                    img.src = originalSrc + '?t=' + timestamp;
                    console.log(`📷 Recargando: ${img.src}`);
                }, index * 50); // Escalonar las recargas
            });
        }
    }

    setupImageObserver() {
        // Observer para detectar imágenes que se cargan dinámicamente
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const images = node.querySelectorAll ? 
                            node.querySelectorAll('img[src*="images/products/"]') : 
                            (node.tagName === 'IMG' && node.src.includes('images/products/') ? [node] : []);
                        
                        images.forEach((img) => {
                            const timestamp = Date.now();
                            const originalSrc = img.src.split('?')[0];
                            img.src = originalSrc + '?t=' + timestamp;
                            console.log(`📷 Nueva imagen detectada y recargada: ${img.src}`);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Método para forzar actualización manual
    async forceFullUpdate() {
        console.log('🔄 Forzando actualización completa...');
        
        // Limpiar todo el caché
        await this.checkAndClearObsoleteCache();
        
        // Recargar todas las imágenes
        await this.forceImageReload();
        
        // Recargar la página completamente
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
    }

    // Método para verificar si una imagen está actualizada
    isImageUpdated(imageSrc) {
        const cachedVersion = localStorage.getItem(`el_borracho_img_${imageSrc}`);
        return cachedVersion === this.cacheVersion;
    }

    // Marcar imagen como actualizada
    markImageAsUpdated(imageSrc) {
        localStorage.setItem(`el_borracho_img_${imageSrc}`, this.cacheVersion);
    }
}

// Solo inicializar en app nativa
if (window.Capacitor) {
    // window.nativeCacheManager = new NativeCacheManager(); // Desactivado para usar SW
}

export default NativeCacheManager;