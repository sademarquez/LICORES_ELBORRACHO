// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupAgeVerification } from './age-verification.js'; // Import age verification

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

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

        console.log('main.js: Datos iniciales cargados con éxito.', appState);
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Por favor, recarga la página.', 'error');
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Ejemplo: Botón de menú hamburguesa para móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    } else {
        console.warn('main.js: Elementos de navegación (menuToggle o mainNav) no encontrados.');
    }

    // Abrir/Cerrar el modal de búsqueda
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar el desplazamiento a #
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    }

    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            toggleSearchModal(false); // Cerrar el modal de búsqueda
        });
    }

    // Abrir/Cerrar el carrito desde el botón del header
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCartSidebar);
    } else {
        console.warn('main.js: Icono del carrito (cartIcon) no encontrado.');
    }

    // Abrir/Cerrar el carrito desde el botón del bottom nav
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar el desplazamiento a #
            toggleCartSidebar();
        });
    }

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Configura el estado activo de la barra de navegación inferior en base al scroll.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Make sure these IDs match your HTML section IDs
    const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'soporte'];

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Adjust as needed, percentage of section visible to be considered "active"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove 'active' from all nav items
                navItems.forEach(item => item.classList.remove('active'));

                // Add 'active' to the corresponding nav item
                const targetId = entry.target.id;
                const activeNavItem = document.querySelector(`.bottom-nav .nav-item[href="#${targetId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            observer.observe(section);
        }
    });

    // Special handling for search and cart, as they open modals/sidebars
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => {
            navItems.forEach(item => item.classList.remove('active'));
            bottomNavSearch.classList.add('active');
        });
    }

    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => {
            navItems.forEach(item => item.classList.remove('active'));
            bottomNavCart.classList.add('active');
        });
    }

    console.log('main.js: Estado activo de navegación inferior configurado.');
}


/**
 * Inicializa la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

    // Paso 1: Inicializar verificación de edad
    setupAgeVerification();

    // Paso 2: Cargar datos iniciales
    await loadInitialData();

    // Paso 3: Inicializar el carrusel de banners (main carousel)
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 4: Renderizar productos en sus secciones (Novedades, Ofertas, Licores, Cervezas, Snacks)
    // IMPORTANT: Now pointing to new track IDs for the 2x2 product carousels
    renderProducts(appState.products, '#newProductsTrack', { isNew: true });
    renderProducts(appState.products, '#offerProductsTrack', { isOnOffer: true });

    // Render Beer Products
    renderProducts(appState.products, '#beerProductsTrack', { category: 'Cerveza' });

    // Render Snack Products
    renderProducts(appState.products, '#snackProductsTrack', { category: 'Snack' });


    // Paso 5: Configurar filtros de productos (para la sección principal de licores)
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsTrack', 'Licor');

    // Paso 6: Inicializar la funcionalidad de búsqueda (results are in a standard grid)
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
        // Also populate footer contact info
        document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
    }

    // Paso 9: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Paso 10: Inicializar el carrito
    initCart(); // Esto debe ejecutarse después de que appState.products esté disponible

    // Paso 11: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();


    console.log('Aplicación EL BORRACHO iniciada completamente.');
});
