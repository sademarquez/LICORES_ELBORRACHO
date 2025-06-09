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
        console.log('main.js: Configuración cargada.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: Productos cargados.', appState.products.length, 'productos.');

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información de la tienda. Intenta recargar.', 'error');
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Manejo de la barra de navegación inferior activa (scrollspy)
    // No es necesario un event listener aquí, la función lo maneja sola al cargarse y al scroll.

    // Configurar el botón de menú hamburguesa
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            document.body.classList.toggle('no-scroll', isExpanded); // Evitar scroll de fondo
            console.log('main.js: Menú hamburguesa', isExpanded ? 'abierto' : 'cerrado');
        });

        // CERRAR MENÚ AL HACER CLIC EN UN ENLACE DENTRO DEL MENÚ
        const mainNavLinks = document.querySelectorAll('.main-nav .nav-list a');
        mainNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active'); // Cerrar el menú
                    menuToggle.setAttribute('aria-expanded', 'false'); // Actualizar ARIA
                    document.body.classList.remove('no-scroll'); // Habilitar scroll
                    console.log('main.js: Enlace de menú clicado. Menú hamburguesa cerrado.');
                }
            });
        });
    } else {
        console.warn('main.js: Elementos de navegación principal o menú hamburguesa no encontrados.');
    }


    // Configurar toggles para modales (Carrito, Búsqueda, Soporte)
    // Usar los IDs de los botones en el HEADER (Problema 3)
    const headerCartToggle = document.getElementById('headerCartToggle');
    const headerSearchToggle = document.getElementById('headerSearchToggle');
    const supportToggle = document.getElementById('supportToggle'); // Si tienes un botón de soporte en el header/nav

    // Si los botones están en el bottom-nav, también se les puede añadir listeners
    const bottomNavCart = document.getElementById('bottomNavCart');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavSupport = document.getElementById('bottomNavSupport');


    if (headerCartToggle) {
        headerCartToggle.addEventListener('click', () => toggleCartSidebar());
    } else if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => toggleCartSidebar());
    } else {
        console.warn('main.js: Botón de toggle del carrito no encontrado.');
    }

    if (headerSearchToggle) {
        headerSearchToggle.addEventListener('click', () => toggleSearchModal());
    } else if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => toggleSearchModal());
    } else {
        console.warn('main.js: Botón de toggle de búsqueda no encontrado.');
    }

    // Listener para el botón de soporte si está en el header o bottomNav
    if (bottomNavSupport) { // Asumiendo que el botón principal de soporte está en bottomNav
        bottomNavSupport.addEventListener('click', () => {
            // El modal de soporte se gestiona en support.js, aquí solo abrimos el modal principal si aplica
            const supportModal = document.getElementById('supportModal'); // O el ID de tu modal principal de soporte
            if (supportModal) {
                supportModal.style.display = 'flex';
                document.body.classList.add('no-scroll');
            } else {
                 console.warn('main.js: Modal de soporte principal no encontrado.');
            }
        });
    }

    // Configurar el botón de cierre para el modal de búsqueda
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => toggleSearchModal(false));
    } else {
        console.warn('main.js: Botón de cerrar búsqueda no encontrado.');
    }

     // Cerrar modal de búsqueda al hacer clic fuera
     const searchModal = document.getElementById('searchModal');
     if (searchModal) {
         searchModal.addEventListener('click', (event) => {
             if (event.target === searchModal) {
                 toggleSearchModal(false);
             }
         });
     }
}

/**
 * Configura el estado activo de la barra de navegación inferior basado en la posición de scroll.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const sections = ['novedades', 'licores', 'cervezas', 'vinos', 'snacks', 'ofertas', 'marcas', 'soporte'].map(id => ({
        id: id,
        element: document.getElementById(id)
    })).filter(item => item.element); // Filtra los que no existen

    function updateActiveNav() {
        let currentActiveId = null;
        const scrollPosition = window.scrollY + window.innerHeight / 2; // Punto de referencia en el centro de la pantalla

        // Encontrar la sección más cercana al centro de la pantalla
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section.element && section.element.offsetTop <= scrollPosition) {
                currentActiveId = section.id;
                break;
            }
        }

        // Si no se encontró ninguna sección visible, por defecto 'novedades' o la primera
        if (!currentActiveId && sections.length > 0) {
            currentActiveId = sections[0].id;
        }


        navItems.forEach(item => {
            // El href del item es 'index.html#id' o '#id'. Necesitamos solo el 'id'
            const hrefId = item.getAttribute('href').split('#')[1];

            if (hrefId === currentActiveId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('resize', updateActiveNav); // Por si cambia el tamaño de la ventana
    updateActiveNav(); // Ejecutar al cargar la página
    console.log('main.js: Scrollspy de navegación inferior configurado.');
}


/**
 * Inicializa la aplicación.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Cargar datos iniciales
    await loadInitialData(); // Asegura que los datos estén disponibles antes de inicializar módulos

    // Paso 2: Inicializar el carrito (debe ser de los primeros para que los contadores estén correctos)
    initCart();

    // Paso 3: Inicializar el carrusel de banners
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel.');
    }

    // Paso 4: Renderizar productos en secciones específicas
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
    renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });

    // Paso 5: Configurar filtros de productos (actualmente solo para la sección principal de licores)
    // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


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
