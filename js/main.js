// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousProductCarousel } from './continuous-carousel.js';

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
        appState.contactInfo = configData.contactInfo || {};

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

        console.log('main.js: Datos iniciales cargados exitosamente.');
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales. Por favor, recarga la página.', 'error');
        throw error; // Propagar el error para detener la inicialización si falla la carga crítica
    }
}

/**
 * Configura los event listeners para elementos de UI globales.
 */
function setupUIEventListeners() {
    // Toggle para el menú de navegación principal en móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
        });
        // Cerrar menú si se hace clic en un enlace (para móviles)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Toggle para el modal de búsqueda
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el scroll a #
            toggleSearchModal(true);
        });
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
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

    // Toggle para el sidebar del carrito
    const cartIcon = document.getElementById('cartIcon'); // Icono del carrito en el header
    const bottomNavCart = document.getElementById('bottomNavCart'); // Icono del carrito en bottom nav

    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCartSidebar);
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el scroll a #
            toggleCartSidebar();
        });
    }
}

/**
 * Gestiona el estado activo de la barra de navegación inferior basado en los hashes de la URL.
 * Para una SPA más compleja, esto podría ser un router.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const setActiveNavItem = () => {
        const hash = window.location.hash || '#novedades-ofertas-carousel'; // Default home section
        bottomNavItems.forEach(item => {
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
    };

    // Establecer el estado activo al cargar la página y al cambiar el hash
    setActiveNavItem();
    window.addEventListener('hashchange', setActiveNavItem);

    // Asegurar que el botón de inicio siempre apunte a la sección por defecto si el hash está vacío
    const homeNavItem = document.querySelector('.bottom-nav a[href="#novedades-ofertas-carousel"]');
    if (homeNavItem && window.location.hash === '') {
        homeNavItem.classList.add('active');
        homeNavItem.setAttribute('aria-current', 'page');
    }
}

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
    initAgeVerification(); // Esto puede redirigir si el usuario no es mayor de edad

    // Si la verificación de edad permite continuar, cargar el resto de la aplicación
    // Se asume que initAgeVerification() maneja la visibilidad del modal y no bloquea el DOMContentLoaded
    // sino que espera la interacción del usuario. Si el usuario no es mayor, redirige.

    try {
        await loadInitialData(); // Cargar datos esenciales

        // Paso 2: Inicializar el carrusel principal (banners)
        initCarousel(appState.banners);

        // Paso 3: Inicializar el carrito de compras
        initCart();
        updateCartCount(); // Asegurar que el contador del carrito se actualice al inicio

        // Paso 4: Renderizar todos los productos en la sección "Todos los Productos"
        const allProductsContainer = document.getElementById('allProductsGrid');
        if (allProductsContainer) {
            renderProducts(appState.products, allProductsContainer.id);
        } else {
            console.warn('main.js: Contenedor allProductsGrid no encontrado.');
        }

        // Paso 5: Configurar los filtros de productos para la sección "Todos los Productos"
        setupProductFilters('productFilters', appState.products, 'allProductsGrid');

        // Paso 6: Configurar carruseles de productos por categoría
        // Filtrar productos por categoría específica para cada carrusel
        const licoresPremium = appState.products.filter(p => p.category === 'Licor');
        setupCategoryProductCarousel(licoresPremium, '#licores-premium-carousel-section');

        const cervezasEnOferta = appState.products.filter(p => p.category === 'Cerveza' && p.isOnOffer);
        setupCategoryProductCarousel(cervezasEnOferta, '#cervezas-oferta-carousel-section');

        const bebidasNoAlcoholicas = appState.products.filter(p => p.category === 'Bebida no alcohólica');
        setupCategoryProductCarousel(bebidasNoAlcoholicas, '#bebidas-no-alcoholicas-carousel-section');

        const snacks = appState.products.filter(p => p.category === 'Snack');
        setupCategoryProductCarousel(snacks, '#snacks-carousel-section');

        // Paso 7: Inicializar carrusel continuo para "Novedades y Ofertas"
        const newAndOfferProducts = appState.products.filter(p => p.isNew || p.isOnOffer);
        initContinuousProductCarousel(newAndOfferProducts, 'novedades-ofertas-carousel-track');

        // Paso 8: Renderizar logos de marcas
        renderBrands(appState.brands, '#brandLogosContainer');

        // Paso 9: Configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 10: Configurar el módulo de soporte
        if (appState.contactInfo && appState.contactInfo.phone) {
            setupSupport(appState.contactInfo.phone); // Pasar el número de teléfono directamente al módulo
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 11: Configurar event listeners de UI
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email;
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone;
        document.getElementById('contactAddress').textContent = appState.contactInfo.address;

        const footerWhatsappLink = document.querySelector('.social-media a[href*=\"whatsapp\"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }

        console.log('main.js: Aplicación inicializada completamente.');

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
        // Si hay un error crítico, podrías ocultar el cuerpo y mostrar un mensaje
        // document.body.style.display = 'none';
        // document.getElementById('error-message').style.display = 'block';
    }
});
