const STATIC_CACHE_NAME = 'elborracho-static-v102';
const DYNAMIC_CACHE_NAME = 'elborracho-dynamic-v102';

// Archivos que conforman el "esqueleto" de la aplicación.
// Se cachean en la instalación.
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/cart.js',
    '/js/carousels.js',
    '/js/age-verification.js',
    '/images/logo.png',
    '/images/favicon.png'
    // No cachear recursos CDN externos - pueden cambiar
];

// 1. Evento de Instalación: Se dispara cuando el SW se instala.
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching App Shell');
            return cache.addAll(APP_SHELL);
        })
    );
});

// 2. Evento de Activación: Se dispara cuando el SW se activa.
// Sirve para limpiar cachés antiguas.
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
    return self.clients.claim();
});

// 3. Evento Fetch: Se dispara cada vez que la app hace una petición de red.
self.addEventListener('fetch', event => {
    // Estrategia: Cache then Network para los archivos JSON (datos) e imágenes de productos
    if (event.request.url.includes('products.json') || event.request.url.includes('config.json') || event.request.url.includes('images/products/')) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                return fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                }).catch(() => {
                    return cache.match(event.request); // Si falla la red, servir desde caché
                });
            })
        );
    } else {
        // Estrategia: Cache-First para todo lo demás (App Shell, imágenes, etc.)
        event.respondWith(
            caches.match(event.request).then(cacheResponse => {
                // Si está en caché, lo retornamos
                if (cacheResponse) {
                    return cacheResponse;
                }
                // Si no, vamos a la red, lo obtenemos y lo guardamos en el caché dinámico
                return fetch(event.request).then(networkResponse => {
                    return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        // No cachear peticiones que no sean GET
                        if(event.request.method === 'GET') {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            }).catch(err => {
                // Manejo de error si todo falla (ej. sin conexión y sin caché)
                // Podrías retornar una página "offline" personalizada aquí.
                console.log('[SW] Error en fetch:', err);
            })
        );
    }
});
