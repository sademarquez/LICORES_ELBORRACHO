// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js'; // Importar la función de verificación de edad

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales de configuración (banners, marcas, contacto)
 * y los productos desde archivos JSON. Popula appState con los datos cargados.
 */
async function loadInitialData() {
    try {
        console.log('main.js: Iniciando carga de datos iniciales...');
        // Cargar config.json
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`Error HTTP! status: ${configResponse.status} al cargar config.json`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };
        console.log('main.js: config.json cargado exitosamente.');
        console.log('Banners cargados:', appState.banners.length);
        console.log('Marcas cargadas:', appState.brands.length);
        console.log('Información de contacto:', appState.contactInfo);


        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: products.json cargado exitosamente. Productos:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para los elementos de la UI principal.
 */
function setupUIEventListeners() {
    console.log('main.js: Configurando Event Listeners de UI...');

    // Botón de búsqueda en el header
    const searchHeaderBtn = document.getElementById('searchHeaderBtn');
    if (searchHeaderBtn) {
        searchHeaderBtn.addEventListener('click', () => toggleSearchModal(true));
        console.log('main.js: Botón de búsqueda del header encontrado y configurado.');
    } else {
        console.warn('main.js: Botón de búsqueda del header no encontrado.');
    }

    // Botón del carrito en el header
    const cartHeaderBtn = document.getElementById('cartHeaderBtn');
    if (cartHeaderBtn) {
        cartHeaderBtn.addEventListener('click', () => toggleCartSidebar(true));
        console.log('main.js: Botón del carrito del header encontrado y configurado.');
    } else {
        console.warn('main.js: Botón del carrito del header no encontrado.');
    }

    // Toggle para el menú de navegación en móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav'); // Asegúrate de que este ID exista en tu HTML

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Opcional: Cerrar el menú si se hace clic en un enlace
            mainNav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
            });
        });
        console.log('main.js: Elementos de toggle de menú encontrados y configurados.');
    } else {
        console.warn('main.js: Elementos de toggle de menú no encontrados.');
    }

    // Event listeners para los botones de navegación inferior (bottom-nav)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
        console.log('main.js: Botón de búsqueda de la barra inferior encontrado y configurado.');
    }

    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
        console.log('main.js: Botón del carrito de la barra inferior encontrado y configurado.');
    }

    // Cerrar modales al hacer clic fuera (genérico para .modal)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior
 * basándose en la sección visible en la ventana.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% de la sección visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${targetId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    console.log('main.js: Configuración de estado activo de navegación inferior completada.');
}


/**
 * Función principal para inicializar la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando la aplicación...');

    // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido o funcionalidad.
    // Esto asegura que el modal se muestre y bloquee el acceso si es necesario.
    initAgeVerification();

    // Paso 2: Cargar datos iniciales de config.json y products.json
    await loadInitialData();

    // Después de cargar los datos, si la edad aún no está verificada, algunas funciones podrían depender de ello.
    // Aunque initAgeVerification ya maneja el bloqueo, estas llamadas son para cuando el usuario ya verificó la edad
    // o para la primera vez después de la verificación.

    // Paso 3: Inicializar la funcionalidad del carrito
    initCart(); // Debe inicializarse antes de renderizar productos con botones "añadir al carrito"

    // Paso 4: Inicializar carrusel de banners (usa banners de appState)
    if (appState.banners && appState.banners.length > 0) {
        console.log('main.js: Intentando inicializar carrusel con', appState.banners.length, 'banners.');
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel. Asegúrate de que config.json contenga banners.');
    }

    // Paso 5: Renderizar productos en las secciones principales
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 6: Configurar filtros de productos (actualmente solo para la sección principal de licores)
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


    // Paso 7: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 8: Renderizar marcas en el carrusel de marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas cargados para renderizar.');
    }

    // Paso 9: Inicializar módulo de soporte con el número de WhatsApp desde config.json
    if (appState.contactInfo.phone) {
        setupSupport(appState.contactInfo.phone);
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
    }

    // Paso 10: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Paso 11: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();

    console.log('Aplicación EL BORRACHO inicializada completamente.');
});
