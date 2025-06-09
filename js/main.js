// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands, renderCategoryButtons } from './products.js'; // Importar renderCategoryButtons
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
    contactInfo: {},
    categories: [] // Añadir esto para almacenar las categorías
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
        const productsData = await productsResponse.json();
        appState.products = productsData || [];

        // Extraer categorías únicas
        appState.categories = [...new Set(appState.products.map(p => p.category))];
        console.log('Categorías cargadas:', appState.categories);


        console.log('main.js: Datos iniciales cargados exitosamente.');
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información de la tienda.', 'error');
    }
}

/**
 * Inicializa los Event Listeners para la interacción del usuario.
 */
function setupUIEventListeners() {
    // Manejar clics de navegación inferior
    document.getElementById('bottomNavSearch').addEventListener('click', (e) => {
        e.preventDefault();
        toggleSearchModal(true); // Abrir el modal de búsqueda
    });

    document.getElementById('bottomNavCart').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartSidebar(true); // Abrir el sidebar del carrito
    });

    // Manejar clics del carrito en el header
    const cartIconHeader = document.querySelector('.header-actions .cart-icon');
    if (cartIconHeader) {
        cartIconHeader.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }

    // Configurar el menú hamburguesa para móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cerrar el menú hamburguesa cuando se hace clic en un enlace
    document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });

    // Delegación de eventos para botones "Agregar al Carrito" en tarjetas de productos
    // Esto se manejará directamente en renderProducts para cada botón de tarjeta
}


/**
 * Actualiza el estado activo de los ítems en la barra de navegación inferior
 * basándose en la posición de scroll y las secciones visibles.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // al menos el 50% de la sección debe estar visible
    };

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
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Lógica para el 'Inicio' cuando se está en la parte superior
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) { // Si está cerca del top de la página
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#novedades') { // O la primera sección relevante
                    item.classList.add('active');
                }
            });
        }
    });
}


/**
 * Función principal que se ejecuta cuando el DOM está completamente cargado.
 * Orquesta la inicialización de todos los módulos de la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando la aplicación.');

    // Paso 1: Cargar datos iniciales (products, banners, contact info, brands)
    await loadInitialData();

    // Paso 2: Inicializar el carrito (carga desde localStorage y actualiza UI)
    initCart();

    // Paso 3: Inicializar el carrusel principal con los datos de banners
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para inicializar el carrusel.');
    }

    // Paso 4: Renderizar productos en las secciones de Novedades y Ofertas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });


    // Paso 5: Configurar los filtros de productos y categorías para la sección principal de productos
    // Modificaremos setupProductFilters para que use las categorías y el filtro de marca/precio
    // Y también necesitaremos una función para renderizar los botones de categoría
    if (appState.categories && appState.categories.length > 0) {
        renderCategoryButtons(appState.categories, '#categoryFilters');
    } else {
        console.warn('main.js: No hay categorías cargadas para renderizar los botones.');
    }
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'all');


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

    console.log('Aplicación EL BORRACHO inicializada.');
});
