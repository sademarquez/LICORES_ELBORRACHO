// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';

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
        console.log('main.js: Datos de configuración cargados.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: Datos de productos cargados. Total:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification(`Error al cargar datos: ${error.message}. La aplicación no se renderizará completamente.`, 'error', 5000);
    }
}

/**
 * Configura los event listeners para elementos de la UI principal.
 */
function setupUIEventListeners() {
    // Menú hamburguesa para móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cerrar menú si se hace clic fuera en móvil (solo cuando está activo)
    document.addEventListener('click', (event) => {
        if (mainNav.classList.contains('active') && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
            mainNav.classList.remove('active');
        }
    });


    // Botones de abrir/cerrar carrito
    const headerCartBtn = document.getElementById('headerCartBtn');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const closeCartBtn = document.getElementById('closeCartBtn');

    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que el # en el href recargue la página
            toggleCartSidebar(true);
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }


    // Botones de abrir/cerrar modal de búsqueda
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const searchModal = document.getElementById('searchModal');
    const closeSearchModalBtn = searchModal ? searchModal.querySelector('.close-btn') : null;

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
    }
}

/**
 * Configura el estado activo de la navegación inferior en función del scroll.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // Cuando al menos el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentSectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejar el caso inicial o si no hay scroll
    window.addEventListener('load', () => {
        const firstSection = document.querySelector('main section');
        if (firstSection) {
            bottomNavItems.forEach(item => item.classList.remove('active'));
            const homeItem = document.querySelector('.bottom-nav .nav-item[href="#novedades"]');
            if (homeItem) homeItem.classList.add('active');
        }
    });
}


/**
 * Inicializa la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplicación EL BORRACHO inicializada correctamente.');

    // Paso 1: Cargar datos iniciales
    await loadInitialData();

    // Si los productos no se cargaron correctamente, no se puede renderizar la aplicación.
    if (appState.products.length === 0) {
        console.error('main.js: No se pudieron cargar los productos. La aplicación no se renderizará completamente.');
        return;
    }

    // Paso 2: Inicializar el carrusel con los banners cargados
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel.');
    }

    // Paso 3: Inicializar el carrito (cargar desde localStorage y renderizar)
    initCart(); // Esto también actualiza el contador del carrito

    // Paso 4: Renderizar productos en las secciones principales
    // Secciones de categorías específicas
    renderProducts(appState.products, '#cervezasGrid', { category: 'Cerveza', limit: 8 });
    renderProducts(appState.products, '#snacksGrid', { category: 'Snack', limit: 8 });

    // Secciones de Novedades y Ofertas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar filtros de productos (actualmente solo para la sección principal de licores)
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


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

    // Paso 10: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();

    console.log('Aplicación EL BORRACHO lista y renderizada.');
});
