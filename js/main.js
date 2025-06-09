// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands, renderCategoryButtons } from './products.js'; // Importar renderCategoryButtons
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js'; // Importar la verificación de edad

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
    categories: [] // Para almacenar categorías únicas
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

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

        // Extraer categorías únicas de los productos
        const uniqueCategories = [...new Set(appState.products.map(p => p.category))];
        appState.categories = uniqueCategories;

        console.log('main.js: Datos iniciales cargados con éxito.', appState);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para elementos de la UI.
 */
function setupUIEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const openSearchModalBtn = document.getElementById('openSearchModalBtn');
    const openCartSidebarBtn = document.getElementById('openCartSidebarBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    } else {
        console.warn('main.js: Elementos del menú (menuToggle o mainNav) no encontrados.');
    }

    if (openSearchModalBtn) {
        openSearchModalBtn.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Botón para abrir modal de búsqueda no encontrado.');
    }

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
    }

    if (openCartSidebarBtn) {
        openCartSidebarBtn.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Botón para abrir sidebar del carrito no encontrado.');
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }

    // Cerrar menú móvil si se hace clic en un enlace de navegación
    const navLinks = document.querySelectorAll('.main-nav .nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Configura el estado activo de los elementos de la barra de navegación inferior
 * en base al scroll y la sección visible.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // Cuando al menos el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                navItems.forEach(item => {
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

    // Manejo de clic en los ítems de la barra inferior para scroll suave
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Permitir que los botones de búsqueda y carrito manejen su propia lógica
            if (this.id === 'bottomNavSearch' || this.id === 'bottomNavCart') {
                return;
            }
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1); // Remover '#'
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Actualizar clase 'active' manualmente después del clic
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    console.log('main.js: Estado activo de navegación inferior configurado.');
}


/**
 * Función principal para iniciar la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

    // Paso 1: Inicializar la verificación de edad
    initAgeVerification(); // Bloqueará la carga hasta que se verifique la edad

    // Paso 2: Cargar datos iniciales
    await loadInitialData();

    // Paso 3: Inicializar el carrusel principal con los banners cargados
    if (appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 4: Renderizar productos en las secciones de Novedades y Ofertas (carrusel 2x2)
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 }); // Mostrar 8 productos como ejemplo
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 }); // Mostrar 8 productos en oferta

    // Paso 5: Configurar los botones de categoría y filtros de productos para la sección principal de licores
    if (appState.categories.length > 0) {
        renderCategoryButtons(appState.categories, '#categoryFilters', appState.products, '#allProductsGrid');
        // Inicializar con la primera categoría o 'Todos' si no se especifica una
        setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', appState.categories[0] || null);
    } else {
        console.warn('main.js: No hay categorías únicas para renderizar los botones de categoría.');
        // Si no hay categorías, al menos renderizar todos los productos sin filtro inicial
        renderProducts(appState.products, '#allProductsGrid');
        setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', null);
    }

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

    // Paso 9: Inicializar el carrito (carga desde localStorage y configura eventos)
    initCart();

    // Paso 10: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Paso 11: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();

    console.log('Aplicación EL BORRACHO iniciada completamente.');
});
