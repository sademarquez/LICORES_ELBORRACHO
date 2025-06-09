// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands, renderProductCarouselSection } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import './age-verification.js'; // Asegúrate de que se ejecute la verificación de edad

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
        appState.products = await productsResponse.json();
        console.log('main.js: Productos cargados.', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para los elementos de la UI.
 */
function setupUIEventListeners() {
    // Toggle para el menú de navegación móvil (hamburguesa)
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Navegación por hash para cerrar el menú móvil al hacer clic en un enlace
    document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });

    // Cerrar menú móvil al hacer clic fuera (opcional, pero mejora UX)
    document.addEventListener('click', (event) => {
        if (!mainNav.contains(event.target) && !menuToggle.contains(event.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    });

    // Abrir/cerrar sidebar del carrito
    const cartButton = document.getElementById('cartButton');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (cartButton) {
        cartButton.addEventListener('click', toggleCartSidebar);
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar navegación si el href es '#'
            toggleCartSidebar();
        });
    }

    // Funcionalidad de búsqueda (modal)
    const headerSearchInput = document.getElementById('headerSearchInput');
    const headerSearchButton = document.getElementById('headerSearchButton');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn'); // Nuevo botón de cierre

    if (headerSearchInput) {
        headerSearchInput.addEventListener('focus', () => toggleSearchModal(true));
    }
    if (headerSearchButton) {
        headerSearchButton.addEventListener('click', () => toggleSearchModal(true));
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

    // Cerrar modales si se hace clic fuera del contenido
    document.addEventListener('click', (event) => {
        const searchModal = document.getElementById('searchModal');
        const cartSidebar = document.getElementById('cartSidebar');
        const faultReportModal = document.getElementById('faultReportModal');
        const appointmentModal = document.getElementById('appointmentModal');

        if (searchModal && event.target === searchModal) {
            toggleSearchModal(false);
        }
        if (cartSidebar && !cartSidebar.contains(event.target) && !cartButton.contains(event.target) && !bottomNavCart.contains(event.target) && cartSidebar.classList.contains('open')) {
             // Avoid closing if click is on cartButton or bottomNavCart, which opened it.
             // This logic is mostly handled by closeCartBtn and toggleCartSidebar now.
        }
        if (faultReportModal && event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
        if (appointmentModal && event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });
}

/**
 * Gestiona el estado activo de la barra de navegación inferior.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'marcas', 'contacto'];
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // Cuando al menos el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos los items
                navItems.forEach(item => item.classList.remove('active'));

                // Añadir 'active' al item correspondiente
                const targetSectionId = entry.target.id;
                const activeNavItem = document.querySelector(`.bottom-nav a[href="#${targetSectionId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            observer.observe(section);
        }
    });

    // Caso especial para el botón de búsqueda y carrito, que no corresponden a secciones fijas
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

    const bottomNavSupport = document.querySelector('.bottom-nav a[href="#soporte"]');
    if (bottomNavSupport) {
        bottomNavSupport.addEventListener('click', () => {
            navItems.forEach(item => item.classList.remove('active'));
            bottomNavSupport.classList.add('active');
        });
    }
}


// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Cargar todos los datos iniciales
    await loadInitialData();

    // Paso 2: Inicializar el carrito (carga desde localStorage y renderiza)
    initCart();

    // Paso 3: Inicializar el carrusel de banners con los datos cargados
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 4: Renderizar productos en las secciones principales
    // Novedades y Ofertas: se filtran por isNew O isOnOffer
    renderProducts(appState.products, '#newAndOfferProductsGrid', { isNewAndOffer: true, limit: 8 });

    // Sección de Licores: utiliza setupProductFilters
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');

    // Sección de Cervezas: utiliza el nuevo carrusel de productos
    renderProductCarouselSection(appState.products, '#cervezasCarousel', 'Cerveza');

    // Sección de Snacks: utiliza el nuevo carrusel de productos
    renderProductCarouselSection(appState.products, '#snacksCarousel', 'Snack');


    // Paso 5: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 6: Renderizar marcas en el carrusel de marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas cargados para renderizar.');
    }

    // Paso 7: Inicializar módulo de soporte con el número de WhatsApp desde config.json
    if (appState.contactInfo.phone) {
        setupSupport(appState.contactInfo.phone);
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
    }

    // Paso 8: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Paso 9: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();

    console.log('Aplicación EL BORRACHO inicializada correctamente.');
});
