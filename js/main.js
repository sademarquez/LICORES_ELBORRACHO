// js/main.js

import { initCarousel } from './carousel.js';
// Corrección: Eliminado 'renderProductCarouselSection' que no es exportado por products.js
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
        appState.products = await productsResponse.json();
        console.log('main.js: Productos cargados.', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información inicial. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * setupUIEventListeners: Configura los event listeners para interacciones de usuario.
 */
function setupUIEventListeners() {
    // Manejar el toggle del menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Navegación inferior: Manejar clics en los iconos de búsqueda y carrito
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true); // Abrir el modal de búsqueda
            mainNav.classList.remove('active'); // Cerrar el menú si está abierto
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        });
    }

    const desktopNavSearch = document.getElementById('desktopNavSearch');
    if (desktopNavSearch) {
        desktopNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    }

    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir el sidebar del carrito
            mainNav.classList.remove('active'); // Cerrar el menú si está abierto
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        });
    }

    const desktopNavCart = document.getElementById('desktopNavCart');
    if (desktopNavCart) {
        desktopNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir el sidebar del carrito
        });
    }

    // Cerrar menú móvil al hacer clic en un enlace de navegación
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
}

/**
 * setupBottomNavActiveState: Gestiona el estado activo de la barra de navegación inferior
 * basándose en la sección visible en la ventana.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% de la sección debe estar visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos los items
                navItems.forEach(item => item.classList.remove('active'));

                // Añadir 'active' al item correspondiente
                const targetId = entry.target.id;
                const correspondingNavItem = document.querySelector(`.bottom-nav .nav-item[href="#${targetId}"]`);
                if (correspondingNavItem) {
                    correspondingNavItem.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observar las secciones relevantes para la navegación inferior
    document.querySelectorAll('section[id]').forEach(section => {
        // Excluir modales y sidebars que no son secciones de navegación principales
        if (!['searchModal', 'cartSidebar', 'faultReportModal', 'appointmentModal', 'ageVerificationModal'].includes(section.id)) {
            observer.observe(section);
        }
    });

    // Asegurar que el estado inicial sea correcto al cargar
    const initialSection = document.querySelector('.bottom-nav .nav-item.active')?.getAttribute('href');
    if (initialSection) {
        const targetSection = document.querySelector(initialSection);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}


/**
 * Inicializa la aplicación: carga datos y configura la UI.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Cargar datos iniciales
    await loadInitialData();

    // Paso 2: Inicializar el carrusel principal de banners
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 3: Inicializar el carrito (carga desde localStorage y actualiza contadores)
    initCart();

    // Paso 4: Renderizar productos en secciones específicas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar filtros de productos para cada sección
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');
    setupProductFilters(appState.products, '#cervezaBrandFilter', '#cervezaPriceFilter', '#cervezaProductSearch', '#cervezasGrid', 'Cerveza');
    setupProductFilters(appState.products, '#snackBrandFilter', '#snackPriceFilter', '#snackProductSearch', '#snacksGrid', 'Snack');


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

    // Paso 11: Actualizar información de contacto en el footer
    const footerAddress = document.getElementById('footerAddress');
    const footerEmail = document.getElementById('footerEmail');
    const footerPhone = document.getElementById('footerPhone');

    if (footerAddress) footerAddress.textContent = appState.contactInfo.address || '';
    if (footerEmail) {
        footerEmail.textContent = appState.contactInfo.email || '';
        footerEmail.href = `mailto:${appState.contactInfo.email}` || '#';
    }
    if (footerPhone) {
        footerPhone.textContent = appState.contactInfo.phone ? `+${appState.contactInfo.phone}` : '';
        footerPhone.href = `https://wa.me/${appState.contactInfo.phone}` || '#';
    }

    console.log('Aplicación EL BORRACHO inicializada correctamente.');
});
