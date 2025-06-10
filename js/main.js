// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
// Se importa todo lo necesario del carrito
import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js';

export const appState = {
    // ... (estado de la app)
};

async function loadInitialData() {
    // ... (código de carga de datos)
}

function setupEventListeners() {
    // --- NAVEGACIÓN PRINCIPAL Y ACCIONES ---
    document.body.addEventListener('click', (event) => {
        // Clic en un enlace de navegación
        const navLink = event.target.closest('a.nav-link, a.nav-link-bottom');
        if (navLink) {
            event.preventDefault();
            const sectionId = navLink.dataset.section;
            if (sectionId) showSection(sectionId);
        }

        // Clic en un botón "Añadir al Carrito" (DELEGACIÓN DE EVENTOS)
        const addToCartBtn = event.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            if (productId) {
                addToCart(productId); // Llama a la función importada de cart.js
            }
        }
    });

    // --- BOTONES DE HEADER Y BARRA INFERIOR ---
    document.getElementById('searchOpenBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('bottomSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('cartOpenBtn')?.addEventListener('click', toggleCartSidebar);
    document.getElementById('bottomCartBtn')?.addEventListener('click', toggleCartSidebar);
}

function showSection(sectionId) {
    // ... (código para mostrar/ocultar secciones)
}

// ... (resto de funciones como getUniqueCategories, setupCategorySection, etc.)

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initAgeVerification();
        await loadInitialData();
        
        setupEventListeners(); // Configura todos los listeners, incluida la delegación
        initCart();
        setupSearch();
        setupSupport();
        
        // Renderizado de contenido
        initCarousel(appState.banners);
        renderProducts(appState.products, '#productGrid');
        setupProductFilters(appState.products, '#catalogo');
        
        // ... (resto de la inicialización)
        
        showSection('inicio');

    } catch (error) {
        console.error('No se pudo inicializar la aplicación:', error);
    }
});
