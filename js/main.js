// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousProductCarousel } from './continuous-carousel.js'; // <-- ¡NUEVA IMPORTACIÓN!

// ... (appState y loadInitialData no cambian) ...

// Evento principal que se dispara cuando todo el DOM ha sido cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');
    try {
        // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
        initAgeVerification();

        // Paso 2: Cargar datos iniciales
        await loadInitialData();

        // Paso 3: Inicializar el carrusel de banners
        initCarousel(appState.banners);

        // Paso 4: Combinar Novedades y Ofertas y pasarlas al nuevo carrusel continuo
        const combinedProducts = appState.products.filter(p => p.isNew || p.isOnOffer);
        initContinuousProductCarousel(combinedProducts, 'combinedProductsCarouselTrack', 2); // 2 segundos por artículo

        // Paso 5: Renderizar productos en sus secciones (ahora sin novedades ni ofertas directas)
        renderProducts(appState.products, '#licores .product-grid', { category: 'Licor', limit: 8 });
        renderProducts(appState.products, '#cervezas .product-grid', { category: 'Cerveza', limit: 8 });
        renderProducts(appState.products, '#snacks .product-grid', { category: 'Snack', limit: 8 });
        renderProducts(appState.products, '#cigarrillos .product-grid', { category: 'Cigarrillos', limit: 8 });
        renderProducts(appState.products, '#bebidas-no-alcoholicas .product-grid', { category: 'Bebida no alcohólica', limit: 8 });

        // Paso 6: Configurar carruseles de categorías específicos (ejemplo: 'Licores Premium')
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Licor'), '#licores-premium-carousel-section');


        // Paso 7: Inicializar y configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 8: Inicializar y renderizar el carrito
        initCart();
        updateCartCount();

        // Paso 9: Renderizar marcas
        renderBrands(appState.brands, '#brandLogos');

        // Paso 10: Inicializar módulo de soporte
        if (appState.contactInfo.phone) {
            setupSupport();
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado para el módulo de soporte.');
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
    }
});
