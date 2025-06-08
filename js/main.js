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
        console.log('main.js: Datos de configuración cargados.');

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: Datos de productos cargados. Total:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error crítico al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información inicial de la tienda. Por favor, recarga la página.', 'error');
        // Considerar deshabilitar funcionalidades si los datos críticos no cargan
    }
}

/**
 * Configura los event listeners para la interfaz de usuario general.
 * Esto incluye el toggle del menú móvil y los botones de la barra inferior.
 */
function setupUIEventListeners() {
    // Menu toggle para móviles (botón hamburguesa)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', (event) => {
        if (mainNav && menuToggle && !mainNav.contains(event.target) && !menuToggle.contains(event.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    });

    // Abrir/cerrar modal de búsqueda desde el botón del header y bottom nav
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    }
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            toggleSearchModal(true);
        });
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            toggleSearchModal(false); // Cerrar el modal de búsqueda
        });
    }

    // Abrir/cerrar sidebar del carrito desde el icono del header y bottom nav
    const cartIcon = document.getElementById('cartIcon');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const closeCartBtn = document.getElementById('closeCartBtn');

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Actualiza el estado activo en la navegación inferior basado en la posición del scroll.
 * Esto resalta la sección actual en la que el usuario se encuentra.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    // IDs de las secciones que el bottom nav puede referenciar.
    // Asegúrate de que estos IDs existen en tu index.html.
    const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'otras-bebidas', 'marcas', 'soporte'];

    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Default a 'novedades' si estamos arriba

        // Recorre las secciones de abajo hacia arriba para encontrar la que está más visible
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section) {
                // Considera la sección como activa si su parte superior está dentro de la ventana de visualización,
                // con un offset para el header o un poco antes de que llegue a la mitad de la pantalla.
                const offset = 150; // Ajusta este valor si tu header es muy grande o para un mejor "feeling"
                if (window.scrollY + window.innerHeight / 2 >= section.offsetTop) { // Detecta cuando la sección está por encima del punto medio
                    currentActiveSection = sections[i];
                    break;
                }
            }
        }

        // Si el scroll está muy arriba, forzar 'novedades' como activa.
        // Esto evita que si hay un espacio grande antes de la primera sección real,
        // no se seleccione ninguna.
        if (window.scrollY < (document.getElementById('licores') ? document.getElementById('licores').offsetTop - 200 : 0)) { // 200px de margen superior
             currentActiveSection = 'novedades';
        }


        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
    console.log('main.js: Estado activo de navegación inferior configurado.');
}


// Punto de entrada principal de la aplicación.
// Se ejecuta cuando el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación de EL BORRACHO...');

    // Paso 1: Cargar datos iniciales (CRÍTICO)
    // Se debe esperar a que los datos estén cargados antes de renderizar cualquier cosa.
    await loadInitialData();

    // Paso 2: Inicializar carrito y actualizar su conteo
    initCart();
    updateCartCount();

    // Paso 3: Inicializar carrusel de banners
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para inicializar el carrusel.');
    }

    // Paso 4: Renderizar productos en las secciones correspondientes
    // Asegúrate de que los IDs de los contenedores coincidan con tu HTML (por ejemplo, en index.html)
    // El 'category' en options asegura que solo se rendericen los productos de esa categoría en ese grid.
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Sección principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });

    // Renderizar productos en las secciones de Novedades y Ofertas
    // Puedes ajustar el 'limit' para mostrar un número específico de productos.
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar filtros de productos (actualmente solo para la sección principal de licores)
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#allProductsGrid');

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

    console.log('Aplicación EL BORRACHO inicializada correctamente.');
});
