const CACHE_VERSION = 'v1.0.7'; // Incrementar versión por cambio en APP_SHELL y lógica de fallback
const STATIC_CACHE_NAME = `elborracho-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `elborracho-dynamic-${CACHE_VERSION}`;

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
    '/images/favicon.png',
    '/products.json', // <--- AÑADIDO: Cachear el products.json local
    '/config.json'    // <--- AÑADIDO: Cachear también config.json por consistencia
];

// 1. Evento de Instalación
self.addEventListener('install', event => {
    console.log(`[SW] Instalando Service Worker ${CACHE_VERSION}`);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching App Shell');
            return cache.addAll(APP_SHELL);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// 2. Evento de Activación
self.addEventListener('activate', event => {
    console.log(`[SW] Activando Service Worker ${CACHE_VERSION}`);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => {
                    console.log(`[SW] Eliminando caché antiguo: ${key}`);
                    return caches.delete(key);
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 3. Evento Fetch
self.addEventListener('fetch', event => {
    // Aplicar la estrategia "Network First" a TODAS las peticiones.
    // Esto asegura ver los cambios inmediatamente, a costa de la velocidad de carga inicial.
    event.respondWith(networkFirst(event.request));
});

// Estrategia: Network First (Red primero, luego caché)
async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    try {
        const networkResponse = await fetch(request);
        // Si la petición a la red es exitosa, la cacheamos para uso offline
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log(`[SW] Red falló para ${request.url}. Sirviendo desde caché.`);
        // Si la red falla, intentamos servir desde el caché
        const cachedResponse = await cache.match(request);
        return cachedResponse || Response.error(); // Retorna error si no está en caché
    }
}

// La estrategia staleWhileRevalidate ya no se usa, pero la dejamos por si se quiere revertir.
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(err => {
        console.error(`[SW] Error al hacer fetch en segundo plano para ${request.url}:`, err);
    });

    return cachedResponse || fetchPromise;
}

