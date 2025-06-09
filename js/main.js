// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
// La importación de initAgeVerification se elimina ya que age-verification.js se inicializa solo
// import { initAgeVerification } from './age-verification.js'; // Esta línea debe ser eliminada si existe

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
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: Datos de productos cargados.');

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información esencial de la tienda. Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

/**
 * Configura los event listeners para elementos de la UI (botones del header, navegación inferior, etc.).
 */
function setupUIEventListeners() {
    console.log('main.js: Configurando event listeners de UI...');

    // Botones del Header
    const searchHeaderBtn = document.getElementById('searchHeaderBtn');
    if (searchHeaderBtn) {
        searchHeaderBtn.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Botón de búsqueda del header no encontrado.');
    }

    const cartHeaderBtn = document.getElementById('cartHeaderBtn');
    if (cartHeaderBtn) {
        cartHeaderBtn.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Botón del carrito del header no encontrado.');
    }

    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            console.log('main.js: Toggle de menú activado/desactivado.');
        });

        // Cerrar menú móvil al hacer clic en un enlace
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            });
        });
    } else {
        console.warn('main.js: Elementos de toggle de menú no encontrados.');
    }

    // Botones de la barra de navegación inferior (móvil)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita la navegación predeterminada
            toggleSearchModal(true);
        });
    }

    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evita la navegación predeterminada
            toggleCartSidebar(true);
        });
    }

    // Actualizar contadores de contacto en el footer
    const contactEmailElements = document.querySelectorAll('#contactEmail, #footerContactEmail');
    const contactPhoneElements = document.querySelectorAll('#contactPhone, #footerContactPhone');
    const contactAddressElement = document.getElementById('contactAddress');

    if (appState.contactInfo.email) {
        contactEmailElements.forEach(el => el.textContent = appState.contactInfo.email);
    }
    if (appState.contactInfo.phone) {
        contactPhoneElements.forEach(el => el.textContent = appState.contactInfo.phone);
    }
    if (appState.contactInfo.address && contactAddressElement) {
        contactAddressElement.textContent = appState.contactInfo.address;
    }
}

/**
 * Gestiona el estado activo de los enlaces en la barra de navegación inferior
 * basándose en la sección visible actualmente en la pantalla.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section[id]');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% de la sección debe estar visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Eliminar 'active' de todos los items
                navItems.forEach(item => item.classList.remove('active'));

                // Añadir 'active' al item correspondiente
                const targetId = entry.target.id;
                const activeLink = document.querySelector(`.bottom-nav .nav-item[href="#${targetId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Manejar el caso inicial al cargar la página
    // setTimeout para asegurar que todos los elementos están renderizados
    setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
            const initialActiveLink = document.querySelector(`.bottom-nav .nav-item[href="${hash}"]`);
            if (initialActiveLink) {
                navItems.forEach(item => item.classList.remove('active'));
                initialActiveLink.classList.add('active');
            }
        } else {
            // Si no hay hash, activar el primer elemento (generalmente 'Inicio' o 'Novedades')
            const homeLink = document.querySelector('.bottom-nav .nav-item[href="#novedades"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    }, 100); // Pequeño retraso para asegurar que los observadores están listos
}


// Punto de entrada principal: Ejecutar al cargar el DOM.
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');

    // Paso 1: Cargar datos iniciales
    await loadInitialData();

    // Paso 2: Inicializar el carrusel de banners si hay datos
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel.');
    }

    // Paso 3: Inicializar el módulo del carrito
    initCart();

    // Paso 4: Renderizar productos (novedades y ofertas)
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
