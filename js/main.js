// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js'; // Importar el carrusel continuo general

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

    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar los datos de la tienda. Intenta de nuevo más tarde.', 'error');
        // Lanzar el error para que el DOMContentLoaded lo capture
        throw error;
    }
}

/**
 * Muestra la sección del DOM especificada por su ID.
 * Oculta todas las demás secciones de contenido principal.
 * @param {string} sectionId - El ID de la sección a mostrar (ej. 'inicio', 'catalogo').
 */
function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('content-hidden');
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.remove('content-hidden');
        activeSection.classList.add('active-section');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazar al inicio de la sección

        // Ocultar el menú móvil si está abierto
        const mainNav = document.getElementById('mainNav');
        if (mainNav && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    }
     // Actualizar el estado activo de la barra de navegación inferior
    setupBottomNavActiveState(sectionId);
}
window.showSection = showSection; // Hacer la función global para onclick en HTML

/**
 * Configura los event listeners para la navegación (header y bottom nav).
 */
function setupNavigationEventListeners() {
    // Navegación principal (header)
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.target.dataset.section;
            showSection(sectionId);

            // Remover clase 'active' de todos los enlaces y añadirla al clickeado
            document.querySelectorAll('.main-nav .nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            event.target.classList.add('active');
        });
    });

    // Navegación inferior (bottom nav)
    document.querySelectorAll('.bottom-nav .nav-link-bottom').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.currentTarget.dataset.section; // currentTarget para manejar botones dentro del link
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Toggle para el menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Ocultar menú si se redimensiona a desktop mientras está abierto
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            mainNav.classList.remove('active');
        }
    });
}

/**
 * Configura el estado activo de los enlaces en la barra de navegación inferior.
 * @param {string} activeSectionId - El ID de la sección actualmente activa.
 */
function setupBottomNavActiveState(activeSectionId = 'inicio') {
    document.querySelectorAll('.bottom-nav .nav-link-bottom').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === activeSectionId) {
            link.classList.add('active');
        }
    });

    // Asegurar que el enlace de búsqueda en el bottom nav no tiene data-section
    const bottomSearchBtn = document.getElementById('bottomSearchBtn');
    if (bottomSearchBtn) {
        bottomSearchBtn.classList.remove('active'); // No es una sección directa, solo un botón
    }
    const bottomCartBtn = document.getElementById('bottomCartBtn');
    if (bottomCartBtn) {
        bottomCartBtn.classList.remove('active'); // No es una sección directa, solo un botón
    }
}


/**
 * Configura los event listeners para los botones de la UI (carrito, búsqueda).
 */
function setupUIEventListeners() {
    const cartOpenBtn = document.getElementById('cartOpenBtn');
    const searchOpenBtn = document.getElementById('searchOpenBtn');
    const bottomCartBtn = document.getElementById('bottomCartBtn');
    const bottomSearchBtn = document.getElementById('bottomSearchBtn');

    if (cartOpenBtn) cartOpenBtn.addEventListener('click', toggleCartSidebar);
    if (searchOpenBtn) searchOpenBtn.addEventListener('click', () => toggleSearchModal(true));

    // Botones de la barra inferior para móviles
    if (bottomCartBtn) bottomCartBtn.addEventListener('click', toggleCartSidebar);
    if (bottomSearchBtn) bottomSearchBtn.addEventListener('click', () => toggleSearchModal(true));
}


// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    initAgeVerification(); // Inicia la verificación de edad primero
    
    // Solo continuar con la carga de la aplicación si el usuario ya verificó la edad
    // o si el modal ya no está visible (lo que significa que la edad ya fue verificada)
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    if (ageVerificationModal && ageVerificationModal.style.display !== 'none') {
        // Si el modal está visible, el usuario debe interactuar con él.
        // No cargamos el resto de la aplicación hasta que se acepte.
        // La lógica de `age-verification.js` maneja la ocultación del modal y la redirección.
        // Podríamos añadir un MutationObserver aquí si fuera necesario reaccionar a la ocultación del modal,
        // pero para este caso, la lógica de `age-verification.js` es suficiente.
        return; // Detener la ejecución si el modal está activo
    }

    try {
        await loadInitialData(); // Paso 1: Cargar todos los datos

        // Paso 2: Inicializar el carrusel principal
        initCarousel(appState.banners);

        // Paso 3: Renderizar productos y configurar filtros para el catálogo
        renderProducts(appState.products, '#productGrid'); // Renderiza todos los productos inicialmente
        setupProductFilters(appState.products, '#catalogo'); // Configura filtros para la sección de catálogo

        // Paso 4: Renderizar marcas en el carrusel continuo
        initContinuousCarousel(appState.brands, 'brandContinuousCarouselTrack', 'brands', 'Carrusel de Marcas');

        // Paso 5: Inicializar carrusel continuo de productos en oferta
        const productsOnOffer = appState.products.filter(p => p.isOnOffer);
        initContinuousCarousel(productsOnOffer, 'continuousProductCarouselTrack', 'products', 'Promociones Destacadas');
        initContinuousCarousel(productsOnOffer, 'offersContinuousCarouselTrack', 'products', 'Productos en Oferta');


        // Paso 6: Configurar la sección de productos por categoría
        // (Aunque originalmente era un carrusel, ahora es un filtro para el mismo track)
        setupCategoryProductCarousel(appState.products, '#categoryProductsSection'); // Si tienes una sección específica para esto

        // Paso 7: Configurar la búsqueda
        setupSearch();

        // Paso 8: Inicializar el carrito (carga desde localStorage y configura eventos)
        initCart();

        // Paso 9: Configurar el módulo de soporte
        setupSupport();

        // Paso 10: Configurar los event listeners de navegación (cambio de sección)
        setupNavigationEventListeners();

        // Paso 11: Configurar otros event listeners de la UI (botones de carrito, búsqueda)
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('contactAddress').textContent = appState.contactInfo.address || 'N/A';
        
        // También actualizar el footer, si tiene IDs diferentes
        document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';


        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});
