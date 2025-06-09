// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands, setupProductCategories } from './products.js'; // Importar setupProductCategories
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupAgeVerification } from './age-verification.js'; // Importar la función de verificación de edad

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
        console.log('main.js: Productos cargados.', appState.products.length, 'productos');

        // Mostrar notificación de éxito
        showToastNotification('Datos cargados correctamente.', 'success');

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification(`Error al cargar los datos: ${error.message}. Por favor, recarga la página.`, 'error');
        // Asegurarse de que appState.products sea un array vacío para evitar errores posteriores
        appState.products = [];
    }
}

/**
 * Configura los event listeners para los elementos de UI comunes.
 */
function setupUIEventListeners() {
    // Manejar el botón de hamburguesa para la navegación móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    } else {
        console.warn('main.js: Elementos de navegación principal no encontrados.');
    }

    // Iconos del header para abrir modales/sidebars
    const searchIcon = document.getElementById('searchIcon');
    const cartIcon = document.getElementById('cartIcon');
    const closeCartBtn = document.getElementById('closeCartBtn'); // Asegurarse de que el botón de cerrar carrito existe

    if (searchIcon) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
    }
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }

    // Bottom Navigation Bar (Mobile)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
}

/**
 * Configura el estado activo de la barra de navegación inferior basado en la sección visible.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section[id]');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.3 // % de visibilidad para considerar activa
    };

    const sectionObserver = new IntersectionObserver((entries) => {
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
        sectionObserver.observe(section);
    });

    // Manejar el caso inicial o si el scroll no dispara inmediatamente
    window.addEventListener('load', () => {
        const hash = window.location.hash;
        if (hash) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === hash) {
                    item.classList.add('active');
                }
            });
        } else {
            // Activar el primer elemento si no hay hash
            const firstNavItem = document.querySelector('.bottom-nav .nav-item');
            if (firstNavItem) {
                firstNavItem.classList.add('active');
            }
        }
    });
}


/**
 * Inicializa la aplicación cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

    // Paso 1: Inicializar la verificación de edad ANTES de cargar y mostrar cualquier contenido.
    setupAgeVerification();

    // Esperar a que la verificación de edad sea resuelta
    // (Esto asume que setupAgeVerification maneja la visualización y ocultación del modal,
    // y si se cancela, redirige. No bloquea la carga de datos si la edad es confirmada o ya verificada).
    // Si necesitas bloquear la carga de datos hasta la verificación, la lógica de setupAgeVerification
    // debería usar Promises o callbacks. Por ahora, asume que si se llega aquí, la edad ya fue manejada.


    // Paso 2: Cargar todos los datos iniciales de forma asíncrona
    await loadInitialData(); // Espera a que los datos se carguen

    // Si los datos no se cargaron correctamente (appState.products está vacío),
    // algunos pasos de renderizado pueden no ser efectivos, pero la app no fallará.
    if (appState.products.length === 0) {
        console.warn('main.js: No hay productos cargados. Saltando renderizado de productos.');
    }


    // Paso 3: Inicializar el carrusel principal (banners)
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel principal.');
    }


    // Paso 4: Inicializar el carrito de compras (carga desde localStorage y actualiza UI)
    initCart();


    // Paso 5: Renderizar productos en las secciones principales
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 6: Configurar filtros de productos para la sección principal de licores
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


    // Paso 7: Inicializar la funcionalidad de búsqueda
    setupSearch();


    // Paso 8: Renderizar marcas en el carrusel de marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas cargados para renderizar.');
    }

    // NUEVO: Inicializar la funcionalidad de categorías de productos
    setupProductCategories();


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
