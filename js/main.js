// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js'; // Ensure renderBrands is explicitly imported
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
// The age-verification.js module is typically self-executing on DOMContentLoaded,
// so no direct import is strictly necessary here unless you need to call functions from it directly.
// import './age-verification.js'; // You could import it like this if it had exports to use.

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

        console.log('main.js: Datos iniciales cargados exitosamente.');
        console.log('Productos cargados:', appState.products.length);
        console.log('Banners cargados:', appState.banners.length);
        console.log('Marcas cargadas:', appState.brands.length);

    } catch (error) {
        console.error('main.js: Error crítico al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales. Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para los elementos de UI generales.
 */
function setupUIEventListeners() {
    // Event listener para el botón de búsqueda en el header
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    } else {
        console.warn('main.js: Botón de búsqueda del header no encontrado.');
    }

    // Event listener para el botón de búsqueda en la navegación inferior (si existe)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar el comportamiento de anclaje predeterminado
            toggleSearchModal(true);
        });
    } else {
        console.warn('main.js: Botón de búsqueda de la navegación inferior no encontrado.');
    }

    // Event listener para el botón del carrito en el header
    const headerCartBtn = document.getElementById('headerCartBtn');
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            toggleCartSidebar(true); // Abrir el sidebar del carrito
        });
    } else {
        console.warn('main.js: Botón del carrito del header no encontrado.');
    }

    // Event listener para el botón del carrito en la navegación inferior
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar el comportamiento de anclaje
            toggleCartSidebar(true);
        });
    } else {
        console.warn('main.js: Botón del carrito de la navegación inferior no encontrado.');
    }

    // Toggle para el menú de hamburguesa en móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active'); // Opcional: para cambiar el icono de hamburguesa a X
        });
    } else {
        console.warn('main.js: Elementos de toggle de menú no encontrados.');
    }

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior basado en el scroll.
 * Esto asegura que el ícono de la sección actual esté resaltado.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const updateActiveNav = () => {
        let currentSectionId = '';
        const sections = document.querySelectorAll('main section'); // Ajusta si tus secciones están en otro lugar

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Si la sección está al menos parcialmente visible en la parte superior de la ventana
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSectionId = section.id;
            }
        });

        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(currentSectionId) && currentSectionId !== '') {
                item.classList.add('active');
            } else if (currentSectionId === '' && item.getAttribute('aria-label') === 'Inicio') {
                // Si no hay sección específica (ej. al cargar la página o al principio), resaltar Inicio
                item.classList.add('active');
            }
        });
    };

    // Actualizar al cargar y al hacer scroll
    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav); // Para asegurar que se active al cargar la página
}


/**
 * Función principal para inicializar la aplicación.
 * Se ejecuta una vez que el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

    // Paso 1: Cargar datos iniciales
    await loadInitialData();

    // Si los datos esenciales no se cargaron, no tiene sentido continuar
    if (appState.products.length === 0 && appState.banners.length === 0 && appState.brands.length === 0) {
        console.error('main.js: Datos esenciales no cargados. Deteniendo inicialización de la UI.');
        return;
    }

    // Paso 2: Inicializar el carrusel de banners
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel.');
    }

    // Paso 3: Inicializar el carrito de compras
    initCart();

    // Paso 4: Renderizar secciones de productos (Novedades, Ofertas)
    // Asegurarse de que appState.products tenga datos antes de intentar renderizar
    if (appState.products && appState.products.length > 0) {
        renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
        renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });
    } else {
        console.warn('main.js: No hay productos cargados para las secciones de Novedades y Ofertas.');
    }


    // Paso 5: Configurar filtros de productos (actualmente solo para la sección principal de licores)
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


    // Paso 6: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 7: Renderizar marcas en el carrusel de marcas
    // Asegurarse de que appState.brands tenga datos antes de intentar renderizar
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

    console.log('Aplicación EL BORRACHO inicializada correctamente.');
});
