// --- CONFIGURACIÓN DE CACHÉ ---
const APP_VERSION = '1.0.4'; // Versión actual de tu app
const STATIC_CACHE_NAME = `elborracho-static-v${APP_VERSION}`;
const DYNAMIC_CACHE_NAME = `elborracho-dynamic-v${APP_VERSION}`;

// Archivos base de la aplicación que se guardarán en la caché estática.
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
    '/images/favicon.ico' // Corregido a .ico como en el HTML
];

// --- CICLO DE VIDA DEL SERVICE WORKER ---

// 1. Evento de Instalación: Se dispara cuando se instala el SW.
self.addEventListener('install', event => {
    console.log(`[SW] Instalando Service Worker v${APP_VERSION}`);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log('[SW] Pre-cargando App Shell en caché estática.');
            // addAll es atómico, si un archivo falla, toda la operación falla.
            return cache.addAll(APP_SHELL);
        }).then(() => {
            // Forzar al nuevo Service Worker a activarse inmediatamente.
            return self.skipWaiting();
        })
    );
});

// 2. Evento de Activación: Se dispara después de la instalación. Limpia cachés antiguas.
self.addEventListener('activate', event => {
    console.log(`[SW] Activando Service Worker v${APP_VERSION}`);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                // Filtramos las cachés que no sean las actuales (estática y dinámica).
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => {
                    console.log(`[SW] Eliminando caché antigua: ${key}`);
                    return caches.delete(key);
                })
            );
        }).then(() => {
            // Tomar control de todos los clientes (pestañas) abiertos.
            return self.clients.claim();
        })
    );
});

// --- ESTRATEGIAS DE CACHÉ ---

// 3. Evento Fetch: Se dispara cada vez que la app solicita un recurso (imagen, script, etc.).
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const request = event.request;

    // Estrategia 1: Network First para el HTML principal y los datos JSON.
    // Ideal para asegurar que el usuario siempre vea la última versión de la página y los productos.
    if (request.mode === 'navigate' || url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Estrategia 2: Stale-While-Revalidate para imágenes.
    // Sirve la imagen desde la caché para velocidad, pero la actualiza en segundo plano.
    if (request.destination === 'image') {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Estrategia 3: Cache First para todo lo demás (CSS, JS, fuentes, etc.).
    // Estos archivos son parte del App Shell y se sirven rápido desde la caché.
    event.respondWith(cacheFirst(request));
});

/**
 * Estrategia: Cache First (Caché primero, luego red).
 * Ideal para el App Shell (archivos que no cambian a menudo).
 * @param {Request} request La petición a manejar.
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
    // 1. Intentar encontrar la respuesta en la caché estática o dinámica.
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // 2. Si no está en caché, ir a la red.
    try {
        const networkResponse = await fetch(request);
        // Abre la caché dinámica para guardar la nueva respuesta.
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        // Solo guarda respuestas válidas y de tipo GET.
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error(`[SW] Fallo de red para ${request.url} y no estaba en caché.`);
        // Opcional: Devolver una página de fallback offline.
        // return caches.match('/offline.html');
        return Response.error(); // Devuelve un error de red.
    }
}

/**
 * Estrategia: Network First (Red primero, luego caché).
 * Ideal para recursos que cambian frecuentemente (HTML principal, datos de API).
 * @param {Request} request La petición a manejar.
 * @returns {Promise<Response>}
 */
async function networkFirst(request) {
    try {
        // 1. Intentar obtener la respuesta de la red.
        const networkResponse = await fetch(request);
        // Abre la caché dinámica para actualizarla.
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // 2. Si la red falla, intentar servir desde la caché.
        console.warn(`[SW] Fallo de red para ${request.url}. Sirviendo desde caché si es posible.`);
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}

/**
 * Estrategia: Stale-While-Revalidate (Servir de caché mientras se revalida en segundo plano).
 * Ideal para recursos no críticos que se actualizan, como avatares o imágenes de productos.
 * @param {Request} request La petición a manejar.
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponsePromise = await cache.match(request);

    const networkResponsePromise = fetch(request).then(networkResponse => {
        if (request.method === 'GET' && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(err => {
        console.error(`[SW] Error en fetch en segundo plano para ${request.url}:`, err);
        // Si la red falla, no hacemos nada, la promesa simplemente se rechaza.
    });

    // Devolvemos la respuesta de caché si existe, si no, esperamos a la red.
    return cachedResponsePromise || networkResponsePromise;
}


// --- COMUNICACIÓN CON LA APP ---

// Evento 'message' para permitir que la página fuerce la activación de un nuevo SW.
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

