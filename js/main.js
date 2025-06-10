// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js';

// Estado global de la aplicación
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales desde los archivos JSON.
 * Es una función asíncrona que debe completarse antes de usar los datos.
 */
async function loadInitialData() {
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('config.json'),
            fetch('products.json')
        ]);
        if (!configResponse.ok || !productsResponse.ok) {
            throw new Error('No se pudieron cargar los archivos de configuración o productos.');
        }
        
        const configData = await configResponse.json();
        const productsData = await productsResponse.json();
        
        // Asignar los datos al estado de la aplicación
        appState.products = productsData || [];
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = { 
            email: configData.contactEmail, 
            phone: configData.contactPhone, 
            address: configData.address 
        };

    } catch (error) {
        console.error('Error fatal durante la carga de datos:', error);
        showToastNotification('No se pudo cargar la información del sitio. Por favor, recarga.', 'error');
        throw error; // Detiene la ejecución si los datos no cargan
    }
}

/**
 * Configura todos los event listeners de la UI.
 */
function setupEventListeners() {
    // Delegación de eventos para acciones principales
    document.body.addEventListener('click', (event) => {
        // Navegación entre secciones
        const navLink = event.target.closest('a.nav-link, a.nav-link-bottom');
        if (navLink && navLink.dataset.section) {
            event.preventDefault();
            showSection(navLink.dataset.section);
        }

        // Añadir al carrito
        const addToCartBtn = event.target.closest('.add-to-cart-btn');
        if (addToCartBtn && addToCartBtn.dataset.productId) {
            addToCart(addToCartBtn.dataset.productId);
        }
    });

    // Botones de abrir modales
    document.getElementById('searchOpenBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('bottomSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('cartOpenBtn')?.addEventListener('click', () => toggleCartSidebar(true));
    document.getElementById('bottomCartBtn')?.addEventListener('click', () => toggleCartSidebar(true));
}


/**
 * Inicializa todos los componentes que renderizan contenido dinámico.
 * Esta función SOLO debe llamarse DESPUÉS de que `loadInitialData` haya terminado.
 */
function initComponents() {
    // Componentes que dependen de `appState.banners`
    initCarousel(appState.banners);

    // Componentes que dependen de `appState.products`
    renderProducts(appState.products, '#productGrid');
    setupProductFilters(appState.products, '#catalogo');
    const productsOnOffer = appState.products.filter(p => p.isOnOffer);
    initContinuousCarousel(productsOnOffer, 'continuousProductCarouselTrack', 'products');
    initContinuousCarousel(productsOnOffer, 'offersContinuousCarouselTrack', 'products');
    setupCategorySection();

    // Componentes que dependen de `appState.brands`
    initContinuousCarousel(appState.brands, 'brandContinuousCarouselTrack', 'brands');
}


function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.toggle('active-section', section.id === sectionId);
        section.classList.toggle('content-hidden', section.id !== sectionId);
    });
    document.querySelectorAll('.nav-link, .nav-link-bottom').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function setupCategorySection() {
    const categories = [...new Set(appState.products.map(p => p.category))];
    const container = document.getElementById('categoryButtons');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', (e) => {
            container.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            showProductsByCategory(category);
        });
        container.appendChild(button);
    });
}


function showProductsByCategory(category) {
    const track = document.querySelector('.category-product-carousel-track');
    if (!track) return;
    const filteredProducts = appState.products.filter(p => p.category === category);
    track.innerHTML = '';
    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => track.appendChild(renderProductCard(product)));
    } else {
        track.innerHTML = `<p class="w-full text-center text-text-color-light">No hay productos en esta categoría.</p>`;
    }
}


// --- PUNTO DE ENTRADA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Inicializar componentes que no dependen de datos externos
        initAgeVerification();
        setupEventListeners();
        initCart(); // InitCart puede cargar desde localStorage, no necesita datos de la API
        setupSearch();
        setupSupport();
        
        // 2. Cargar todos los datos externos y esperar a que terminen
        await loadInitialData();
        
        // 3. Ahora que los datos están en appState, inicializar los componentes que los usan
        initComponents();
        
        // 4. Mostrar la sección de inicio
        showSection('inicio');

    } catch (error) {
        console.error('No se pudo inicializar la aplicación:', error.message);
        // El toast de error ya se muestra dentro de `loadInitialData`
    }
});
