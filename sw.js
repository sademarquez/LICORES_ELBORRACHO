const CACHE_VERSION = 'v1.0.8'; // Incremented version to force update
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
    '/images/favicon.png'
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
    const url = new URL(event.request.url);

    // Network First for API calls and JSON data
    if (url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Stale-While-Revalidate for images
    if (event.request.destination === 'image') {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // Cache First for everything else (App Shell)
    event.respondWith(cacheFirst(event.request));
});

// Estrategia: Cache First (Caché primero, luego red)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error(`[SW] Red falló para ${request.url} y no estaba en caché.`);
        // Fallback a una página de error offline si es necesario
        // return caches.match('/offline.html');
        return Response.error();
    }
}

// Estrategia: Network First (Red primero, luego caché)
async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    try {
        const networkResponse = await fetch(request);
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log(`[SW] Red falló para ${request.url}. Sirviendo desde caché.`);
        const cachedResponse = await cache.match(request);
        return cachedResponse || Response.error();
    }
}

// Estrategia: Stale-While-Revalidate (Caché mientras se revalida en segundo plano)
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
