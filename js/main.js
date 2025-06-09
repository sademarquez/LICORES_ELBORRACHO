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
        throw error; // Re-lanza el error para que el bloque catch principal lo capture
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Manejar el botón de menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Manejar el botón de búsqueda de la barra inferior
    const bottomNavSearchBtn = document.getElementById('bottomNavSearch');
    if (bottomNavSearchBtn) {
        bottomNavSearchBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSearchModal(true); // Abrir el modal de búsqueda
        });
    }

    // Manejar el botón de carrito de la barra inferior
    const bottomNavCartBtn = document.getElementById('bottomNavCart');
    if (bottomNavCartBtn) {
        bottomNavCartBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleCartSidebar(true); // Abrir la barra lateral del carrito
        });
    }
}

/**
 * Configura el estado activo de la barra de navegación inferior basado en la URL.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const currentHash = window.location.hash || '#novedades-ofertas-carousel'; // Default a la sección principal

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentHash) {
            item.classList.add('active');
        }
    });

    // Añadir listener para actualizar el estado activo al cambiar el hash
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash || '#novedades-ofertas-carousel';
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === newHash) {
                item.classList.add('active');
            }
        });
    });
}


// Punto de entrada principal de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Inicializar la verificación de edad
    initAgeVerification();

    // Solo continuar con la carga de la aplicación si la edad ya fue verificada
    // o si el modal de verificación de edad no existe/no es requerido.
    // Asumimos que initAgeVerification maneja la lógica de ocultar/redirigir.
    // Si el modal está visible, el usuario debe interactuar con él.
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    if (ageVerificationModal && window.getComputedStyle(ageVerificationModal).display !== 'none') {
        // Si el modal está visible, la lógica de la aplicación se pausará hasta que el usuario interactúe.
        // No cargamos más contenido hasta que initAgeVerification lo permita.
        console.log('main.js: Esperando verificación de edad para continuar la carga de la aplicación.');
        // Puedes añadir un listener aquí si initAgeVerification dispara un evento al confirmar la edad
        // para reanudar la carga, o confiar en que el usuario no procederá si no ha verificado.
        // Por simplicidad, el resto del código se ejecuta solo si el modal ya no está visible (ej. en recargas).
        return; 
    }

    try {
        // Paso 2: Cargar datos iniciales (productos, banners, marcas, contacto)
        await loadInitialData();

        // Paso 3: Inicializar el carrusel principal (banners)
        // Asegúrate de que el carrusel principal tenga un contenedor en el HTML con id="carouselTrack"
        // y que `appState.banners` esté poblado.
        initCarousel(appState.banners);

        // Paso 4: Inicializar el módulo del carrito
        initCart();
        updateCartCount(appState.cart); // Actualizar el contador del carrito al cargar

        // Paso 5: Renderizar todos los productos en la cuadrícula principal
        renderProducts(appState.products, '#allProductsGrid');
        
        // Paso 6: Configurar filtros para la cuadrícula principal de productos
        // CORRECCIÓN: 'containerId' no está definido, debe ser el selector CSS del grid.
        setupProductFilters(appState.products, '#allProductsGrid');

        // Paso 7: Inicializar carruseles de productos por categoría y continuo
        // Carrusel de Novedades y Ofertas (ejemplo con productos filtrados)
        setupCategoryProductCarousel(appState.products.filter(p => p.isNew || p.isOnOffer), '#novedades-ofertas-carousel-section');
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Licor'), '#licores-premium-carousel-section');
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Cerveza'), '#cervezas-carousel-section');
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Snacks'), '#snacks-carousel-section');

        // Carrusel continuo (ejemplo con los productos más vendidos o destacados)
        // Asegúrate de que 'continuousCarouselTrack' sea el ID del track en el HTML
        initContinuousProductCarousel(appState.products.slice(0, 10), 'continuousCarouselTrack', 'Productos Destacados');


        // Paso 8: Renderizar marcas
        renderBrands(appState.brands, '#brandLogos');

        // Paso 9: Configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 10: Configurar el módulo de soporte
        if (appState.contactInfo && appState.contactInfo.phone) {
            setupSupport(appState.contactInfo.phone);
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
