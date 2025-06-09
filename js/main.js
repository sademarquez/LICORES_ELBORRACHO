// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters } from './products.js'; // Eliminada renderBrands
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Mantenido por si se usa en el futuro
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
    brands: [], // Se mantiene brands en el appState por si se necesita para algo más en el futuro, pero no se renderizará como carrusel
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

        console.log('main.js: Datos iniciales cargados exitosamente:', appState);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales. Por favor, intenta recargar la página.', 'error');
        // Podrías considerar detener la inicialización aquí o mostrar un mensaje de error al usuario
        throw error; // Propagar el error para que la aplicación no intente inicializarse con datos faltantes
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Toggle para el menú de hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    } else {
        console.warn('main.js: Elementos de menú hamburguesa o navegación principal no encontrados.');
    }

    // Toggle para el sidebar del carrito
    const cartIcon = document.getElementById('cartIcon');
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Icono del carrito del header no encontrado.');
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Icono del carrito del bottom nav no encontrado.');
    }

    // Toggle para el modal de búsqueda
    const searchIcon = document.getElementById('searchIcon');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Icono de búsqueda del header no encontrado.');
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Icono de búsqueda del bottom nav no encontrado.');
    }

    // Event listener para los botones del footer de soporte
    const reportFaultFooterBtn = document.getElementById('reportFaultFooterBtn');
    const bookAppointmentFooterBtn = document.getElementById('bookAppointmentFooterBtn');

    if (reportFaultFooterBtn) {
        reportFaultFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('faultReportModal').style.display = 'flex';
        });
    }
    if (bookAppointmentFooterBtn) {
        bookAppointmentFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('appointmentModal').style.display = 'flex';
        });
    }

    // Cerrar el menú móvil si se hace clic fuera
    document.addEventListener('click', (event) => {
        if (mainNav && menuToggle && !mainNav.contains(event.target) && !menuToggle.contains(event.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        }
    });

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Configura el estado activo de la barra de navegación inferior.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(event) {
            // Eliminar 'active' de todos los elementos
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            // Añadir 'active' al elemento clicado
            this.classList.add('active');

            // Para manejar el scroll a la sección si el href está definido
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault(); // Previene el comportamiento de anclaje predeterminado
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Establecer el estado activo al cargar la página si el hash coincide
    const currentHash = window.location.hash;
    if (currentHash) {
        const activeItem = document.querySelector(`.bottom-nav .nav-item[href="${currentHash}"]`);
        if (activeItem) {
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            activeItem.classList.add('active');
        }
    } else {
        // Por defecto, activar el primer elemento si no hay hash
        const firstItem = document.querySelector('.bottom-nav .nav-item');
        if (firstItem) {
            firstItem.classList.add('active');
        }
    }
}

/**
 * Inicializa la aplicación cuando el DOM esté completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

    try {
        // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
        initAgeVerification();

        // Paso 2: Cargar datos iniciales (productos, banners, etc.)
        await loadInitialData();

        // Paso 3: Inicializar el carrusel principal
        initCarousel(appState.banners);

        // Paso 4: Renderizar la cuadrícula de productos y configurar filtros
        renderProducts(appState.products, '#productGrid'); // Renderiza todos los productos inicialmente
        setupProductFilters('#productGrid', appState.products);

        // Paso 5: Inicializar carrusel de productos continuos (Novedades y Ofertas)
        // Asegúrate de filtrar los productos que deben aparecer aquí (ej. isNew o isOnOffer)
        initContinuousProductCarousel(appState.products.filter(p => p.isNew || p.isOnOffer), '#novedadesOfertasTrack');

        // Paso 6: Inicializar el carrito
        initCart();
        updateCartCount(); // Actualiza el contador del carrito al cargar la página

        // Paso 7: Configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 8: Configurar el módulo de soporte
        // Aquí puedes pasar el número de teléfono si lo tienes en config.json
        if (appState.contactInfo && appState.contactInfo.phone) {
            setupSupport(appState.contactInfo.phone);
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 9: Configurar event listeners de UI
        setupUIEventListeners();

        // Paso 10: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email;
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone;
        document.getElementById('contactAddress').textContent = appState.contactInfo.address;

        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
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
