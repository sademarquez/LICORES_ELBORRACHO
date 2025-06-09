// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupAgeVerification } from './age-verification.js'; // Importar la función exportada

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

        console.log('main.js: Datos iniciales cargados con éxito.');
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información de la tienda. Intenta de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners de UI que no pertenecen a módulos específicos.
 */
function setupUIEventListeners() {
    // Manejo del menú hamburguesa para móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Botones del header para abrir modales/sidebar
    const searchIcon = document.getElementById('searchIcon');
    const cartIcon = document.getElementById('cartIcon');

    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    }
    if (cartIcon) {
        cartIcon.addEventListener('click', () => toggleCartSidebar(true));
    }

    // Botones de la barra de navegación inferior (bottom-nav)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el salto al #
            toggleSearchModal(true);
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el salto al #
            toggleCartSidebar(true);
        });
    }

    // Cierre de modales y sidebar al hacer clic fuera (si no está ya manejado por el módulo)
    // Esto es un fallback general. Idealmente cada modal/sidebar maneja su propio cierre.
    window.addEventListener('click', (event) => {
        const searchModal = document.getElementById('searchModal');
        const cartSidebar = document.getElementById('cartSidebar');
        const faultReportModal = document.getElementById('faultReportModal');
        const appointmentModal = document.getElementById('appointmentModal');


        if (searchModal && event.target === searchModal) {
            toggleSearchModal(false);
        }
        if (cartSidebar && !cartSidebar.contains(event.target) && event.target !== cartIcon && event.target !== bottomNavCart && cartSidebar.classList.contains('open')) {
            // Este es un cierre más delicado, requiere que no se cierre si el clic fue en el icono de carrito
            // y que el sidebar esté abierto.
            // Para simplicidad, podemos usar un botón de cierre dentro del sidebar o un overlay.
            // Por ahora, el clic fuera está manejado por la función toggleCartSidebar si se le pasa 'false'.
            // Sin embargo, para no interferir con la lógica de otros elementos, solo se cerrará si el clic
            // es directamente en el overlay (el propio modal).
        }
        if (faultReportModal && event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
        if (appointmentModal && event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Configura el estado activo de la barra de navegación inferior (bottom-nav)
 * basado en la sección visible en el viewport.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section[id]');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px' // Detecta cuando la sección está en el medio del viewport
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejo de clicks en los elementos del bottom-nav para scroll suave
    navItems.forEach(item => {
        if (!['#', ''].includes(item.getAttribute('href'))) { // Ignorar enlaces que no apuntan a secciones
            item.addEventListener('click', function(e) {
                // e.preventDefault(); // Ya se previene por ser enlaces de ancla si se quiere scroll suave
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                // Actualizar la clase active inmediatamente
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        }
    });
    console.log('main.js: Estado activo de navegación inferior configurado.');
}


/**
 * Función principal que se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Cargar datos iniciales (productos, banners, marcas, info de contacto)
    await loadInitialData();

    // Paso 2: Inicializar la verificación de edad ANTES de renderizar cualquier contenido
    setupAgeVerification(); // Llamar a la función exportada

    // Paso 3: Inicializar el carrusel principal (banners)
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }

    // Paso 4: Inicializar el carrito de compras
    initCart();

    // Paso 5: Renderizar productos en las secciones de Novedades y Ofertas
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

    console.log('Aplicación EL BORRACHO inicializada correctamente.');
});
