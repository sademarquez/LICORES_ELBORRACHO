// --- CONFIGURACIÓN ---
const APP_VERSION = '3.0.0'; // Nueva versión para forzar la actualización
const STATIC_CACHE_NAME = `elborracho-static-v${APP_VERSION}`;
const DYNAMIC_CACHE_NAME = `elborracho-dynamic-v${APP_VERSION}`;

// Archivos esenciales de la aplicación.
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/cart.js',
    '/js/animations.js',
    '/js/carousels.js',
    '/js/age-verification.js',
    '/js/pwa-install.js',
    '/js/update-notifier.js',
    '/images/logo.png',
    '/images/favicon.ico'
];

// --- CICLO DE VIDA DEL SERVICE WORKER ---

self.addEventListener('install', event => {
    console.log(`[SW] Instalando v${APP_VERSION}`);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando el App Shell estático.');
                return cache.addAll(APP_SHELL);
            })
            .catch(error => {
                console.error('[SW] Falló el cacheo del App Shell:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log(`[SW] Activando v${APP_VERSION}`);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => {
                    console.log(`[SW] Eliminando caché antigua: ${key}`);
                    return caches.delete(key);
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// --- ESTRATEGIAS DE CACHÉ ---

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones que no son GET
    if (request.method !== 'GET') {
        return;
    }

    // Estrategia: Network First para el HTML y los datos JSON.
    // Siempre busca la versión más nueva, y si falla, usa la de caché.
    if (request.mode === 'navigate' || url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Estrategia: Stale-While-Revalidate para CSS, JS e imágenes.
    // Sirve desde caché para velocidad, pero actualiza en segundo plano.
    event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.warn(`[SW] Red falló para ${request.url}. Sirviendo desde caché.`);
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
    }).catch(err => {
        console.error(`[SW] Error en fetch en segundo plano para ${request.url}:`, err);
    });

    return cachedResponse || fetchPromise;
}

// --- COMUNICACIÓN ---

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
