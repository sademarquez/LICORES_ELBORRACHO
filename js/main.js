// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js'; // Importar toggleSearchModal
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales de configuración y productos desde archivos JSON.
 * Popula appState con los datos cargados.
 */
async function loadInitialData() {
    try {
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
        console.log('main.js: Datos de configuración cargados.');

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: Datos de productos cargados. Total:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información inicial de la tienda. Por favor, recarga la página.', 'error');
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Menu toggle para móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', (event) => {
        if (mainNav && !mainNav.contains(event.target) && !menuToggle.contains(event.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    });

    // Abrir/cerrar modal de búsqueda desde el bottom nav
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    const headerSearchBtn = document.getElementById('headerSearchBtn'); // Botón de búsqueda del header

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    }

    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            toggleSearchModal(false); // Cerrar el modal de búsqueda
        });
    }

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            toggleSearchModal(true);
        });
    }

    // Abrir/cerrar sidebar del carrito desde el bottom nav
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir el sidebar del carrito
        });
    }
}

/**
 * Actualiza el estado activo en la navegación inferior basado en el scroll.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'otras-bebidas', 'marcas', 'soporte'];

    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section) {
                const offset = 150; // Ajusta este valor si tu header es muy grande
                if (window.scrollY + window.innerHeight / 2 >= section.offsetTop - offset) {
                    currentActiveSection = sections[i];
                    break;
                }
            }
        }

        // Caso especial para "novedades" si estamos al principio de la página
        if (window.scrollY < (document.getElementById('licores') ? document.getElementById('licores').offsetTop - 150 : 0)) {
            currentActiveSection = 'novedades';
        }

        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
}


// Punto de entrada de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    // Paso 1: Cargar datos iniciales
    await loadInitialData();

    // Paso 2: Inicializar carrito y actualizar su conteo
    initCart();
    updateCartCount();

    // Paso 3: Inicializar carrusel (banners)
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners para inicializar el carrusel.');
    }

    // Paso 4: Renderizar productos en las secciones correspondientes
    // Asegúrate de que los IDs de los contenedores coincidan con tu HTML
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Sección principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });

    // Renderizar productos en las secciones de Novedades y Ofertas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar filtros de productos (solo para la sección principal de licores)
    setupProductFilters(appState.products, '#allProductsGrid'); // Pasar el ID del contenedor para el que se configuran los filtros

    // Paso 6: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 7: Renderizar marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas para renderizar.');
    }

    // Paso 8: Inicializar soporte con el número de WhatsApp desde config.json
    if (appState.contactInfo.phone) {
        setupSupport(appState.contactInfo.phone);
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el soporte.');
    }

    // Paso 9: Configurar event listeners de UI
    setupUIEventListeners();

    // Paso 10: Configurar el estado activo de la barra de navegación inferior
    setupBottomNavActiveState();
});
