// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js'; // Importa la inicialización
import { setupCategoryProductCarousel, loadCategoryProducts } from './category-products-carousel.js'; // Nuevo módulo

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {},
    currentCategory: 'Licor' // Estado inicial para el carrusel de categorías
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
        console.log('main.js: Datos de configuración cargados.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: Datos de productos cargados.', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para la UI principal (botones de navegación, etc.).
 */
function setupUIEventListeners() {
    // Manejo del menú móvil (hamburguesa)
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Botones de abrir/cerrar búsqueda y carrito en el header
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const headerCartBtn = document.getElementById('headerCartBtn');

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    }

    // Botones de la navegación inferior
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el salto si el href es '#'
            toggleSearchModal(true);
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el salto
            toggleCartSidebar(true);
        });
    }

    // Navegación por hash para resaltar el menú inferior
    setupBottomNavActiveState();

    // Event listeners para los botones de categoría
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remover la clase 'active' de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir la clase 'active' al botón clickeado
            e.target.classList.add('active');

            // Actualizar la categoría actual en appState
            appState.currentCategory = e.target.dataset.category;
            console.log(`main.js: Categoría seleccionada: ${appState.currentCategory}`);

            // Cargar y renderizar los productos de la nueva categoría en el carrusel
            loadCategoryProducts(appState.currentCategory);
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior en base al scroll/hash de la URL.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const updateActiveNav = () => {
        const hash = window.location.hash;
        bottomNavItems.forEach(item => {
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Caso especial para "Inicio" si no hay hash o es #hero
        if (!hash || hash === '#hero' || hash === '#novedades') {
            document.querySelector('.bottom-nav a[href="#novedades"]').classList.add('active');
        }
    };

    // Actualizar al cargar la página
    updateActiveNav();

    // Actualizar al cambiar el hash (navegación interna)
    window.addEventListener('hashchange', updateActiveNav);

    // Actualizar al hacer scroll (para secciones no vinculadas a hash directo)
    // Esto es más complejo y requeriría IntersectionObserver para ser preciso.
    // Por ahora, se basa en hash.
}


/**
 * Función principal para inicializar toda la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplicación EL BORRACHO inicializada correctamente.');

    // Paso 0: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
    initAgeVerification();

    // Paso 1: Cargar datos iniciales (productos, banners, configuración de contacto)
    await loadInitialData();

    // Si los datos no se cargaron correctamente, no continuar con la renderización
    if (appState.products.length === 0) {
        console.error('main.js: No se pudieron cargar los productos. La aplicación no se renderizará completamente.');
        return;
    }

    // Paso 2: Inicializar el carrusel principal con los banners cargados
    if (appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 3: Inicializar el carrito
    initCart();

    // Paso 4: Renderizar productos en las secciones de Novedades y Ofertas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar el carrusel de productos por categoría (nueva sección)
    // Se inicializa con la categoría por defecto (Licor)
    setupCategoryProductCarousel(appState.products, '#categoryProductsCarousel');
    loadCategoryProducts(appState.currentCategory); // Carga la primera categoría al inicio

    // Paso 6: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 7: Renderizar marcas en el carrusel de marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas cargados para renderizar.');
    }

    // Paso 8: Inicializar módulo de soporte con el número de WhatsApp desde config.json
    if (appState.contactInfo.phone) {
        setupSupport(appState.contactInfo.phone);
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
    }

    // Paso 9: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Al cargar, asegúrate de que el botón de categoría "Licor" esté activo
    document.querySelector('.category-btn[data-category="Licor"]').classList.add('active');
});
