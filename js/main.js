// js/main.js

// Importaciones de módulos
import { initCarousel } from './carousel.js'; // Para el carrusel principal de banners
import { renderProducts, setupProductFilters, renderBrands } from './products.js'; // Para la grilla de productos y la sección de marcas (en desuso para marcas ahora)
import { setupSearch, toggleSearchModal } from './search.js'; // Para la funcionalidad de búsqueda
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js'; // Para el carrito de compras
import { setupSupport } from './support.js'; // Para los modales de soporte/contacto
import { showToastNotification } from './toast.js'; // Para las notificaciones emergentes
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Para la navegación por categorías de productos
import { initAgeVerification } from './age-verification.js'; // Para el modal de verificación de edad
import { initContinuousProductCarousel } from './continuous-carousel.js'; // Para el carrusel infinito de logos de marcas

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 * Es crucial que estos arrays se llenen antes de que los componentes intenten renderizarse.
 */
export const appState = {
    products: [],      // Almacenará todos los productos cargados de products.json
    cart: [],          // Almacenará los productos en el carrito del usuario
    banners: [],       // Almacenará los datos de banners de config.json
    brands: [],        // Almacenará los datos de marcas de config.json
    contactInfo: {},   // Almacenará la información de contacto de config.json
    categories: [],    // Almacenará categorías únicas para filtros, etc.
    filteredProducts: [], // Productos que se muestran después de aplicar filtros
    currentPage: 1,    // Página actual para la paginación de productos
    productsPerPage: 12 // Número de productos por página
};

// Función para cargar archivos JSON
async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        showToastNotification(`No se pudo cargar ${filePath}.`, 'error');
        return null;
    }
}

// Función para inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');

    // Iniciar verificación de edad primero
    initAgeVerification();

    // Solo continuar si la verificación de edad está pasada o no configurada
    // Se asume que initAgeVerification maneja la redirección o el display del modal.
    // Si el modal está visible, la lógica de la app no debería ejecutarse completamente.
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    if (ageVerificationModal && ageVerificationModal.style.display !== 'none') {
        console.log('main.js: Modal de verificación de edad visible. Deteniendo inicialización de la app.');
        return; // Detener la ejecución si el modal está activo
    }

    try {
        // Cargar datos principales
        const productsData = await loadJSON('products.json');
        const configData = await loadJSON('config.json');

        if (!productsData || !configData) {
            throw new Error('Datos esenciales (products.json o config.json) no cargados.');
        }

        appState.products = productsData;
        appState.config = configData; // Guardar toda la configuración
        appState.banners = configData.banners || []; // Asegurarse de que sea un array
        appState.brands = configData.brands || [];   // Asegurarse de que sea un array
        appState.contactInfo = configData.contactInfo || {};

        // Recopilar categorías únicas
        const uniqueCategories = [...new Set(appState.products.map(p => p.category))];
        appState.categories = ['all', ...uniqueCategories]; // Añadir 'all' como primera opción

        // Inicializar componentes
        initCart(); // Inicializa el carrito antes de renderizar productos que puedan añadirse a él

        // Renderizar productos en la sección principal
        renderProducts(appState.products, '#allProductsGrid', appState.currentPage, appState.productsPerPage);
        setupProductFilters(appState.products, '#allProductsGrid', '#productSearchInput', '#productCategoryFilter', '#productBrandFilter', '#loadMoreProductsBtn');

        // Renderizar productos destacados
        const featuredProducts = appState.products.filter(p => p.isNew || p.isOnOffer).slice(0, 8); // Ajusta la lógica de "destacados"
        renderProducts(featuredProducts, '#featuredProductsGrid');

        // Inicializar carruseles
        initCarousel(appState.banners); // Carrusel principal de banners
        
        // Configurar el carrusel de productos por categoría
        setupCategoryProductCarousel(appState.products, '#categoryProductsSection'); // Pasa el ID de la nueva sección

        // Inicializar carrusel continuo de marcas (¡ID CORREGIDO!)
        initContinuousProductCarousel(appState.brands, 'brandsContinuousCarouselTrack', 'Marcas');

        // Configurar búsqueda
        setupSearch();

        // Configurar soporte (modales, etc.)
        setupSupport();

        // Actualizar contadores del carrito en header y bottom nav
        updateCartCount();

        // Actualizar información de contacto en el footer/contacto
        const contactEmailEl = document.getElementById('contactEmail');
        const contactPhoneEl = document.getElementById('contactPhone');
        const contactAddressEl = document.getElementById('contactAddress');
        const footerEmailEl = document.getElementById('footerEmail'); // Si tienes IDs diferentes en el footer
        const footerPhoneEl = document.getElementById('footerPhone');
        const footerAddressEl = document.getElementById('footerAddress');

        if (contactEmailEl) contactEmailEl.textContent = appState.contactInfo.email || 'N/A';
        if (contactPhoneEl) contactPhoneEl.textContent = appState.contactInfo.phone || 'N/A';
        if (contactAddressEl) contactAddressEl.textContent = appState.contactInfo.address || 'N/A';
        
        if (footerEmailEl) footerEmailEl.textContent = appState.contactInfo.email || 'N/A';
        if (footerPhoneEl) footerPhoneEl.textContent = appState.contactInfo.phone || 'N/A';
        if (footerAddressEl) footerAddressEl.textContent = appState.contactInfo.address || 'N/A';


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
