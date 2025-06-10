// js/main.js

import { initCarousel } from './carousel.js';
// ** Importamos renderProductCard para reutilizarlo **
import { renderProducts, setupProductFilters, renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js';

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales desde archivos JSON.
 */
async function loadInitialData() {
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('config.json'),
            fetch('products.json')
        ]);

        if (!configResponse.ok) throw new Error(`Error HTTP ${configResponse.status} al cargar config.json`);
        if (!productsResponse.ok) throw new Error(`Error HTTP ${productsResponse.status} al cargar products.json`);

        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };

        appState.products = await productsResponse.json();

    } catch (error) {
        console.error('Error fatal al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos. Por favor, recarga la página.', 'error');
        throw error;
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    }

    document.body.addEventListener('click', (event) => {
        const navLink = event.target.closest('a.nav-link, a.nav-link-bottom');
        if (navLink) {
            event.preventDefault();
            const sectionId = navLink.dataset.section;
            showSection(sectionId);
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        }
    });

    document.getElementById('searchOpenBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('bottomSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('cartOpenBtn')?.addEventListener('click', toggleCartSidebar);
    document.getElementById('bottomCartBtn')?.addEventListener('click', toggleCartSidebar);
}

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.toggle('content-hidden', section.id !== sectionId);
        section.classList.toggle('active-section', section.id === sectionId);
    });
    document.querySelectorAll('.nav-link, .nav-link-bottom').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateContactInfo() {
    // ... tu función existente, sin cambios ...
}


// =========== NUEVAS FUNCIONES PARA SECCIÓN DE CATEGORÍAS ===========

/**
 * Obtiene un array de categorías únicas a partir de la lista de productos.
 * @param {Array<Object>} products - El array de productos.
 * @returns {Array<string>} Un array con los nombres de las categorías sin repetir.
 */
function getUniqueCategories(products) {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
}

/**
 * Renderiza los botones para cada categoría única en el contenedor.
 * @param {Array<string>} categories - El array de nombres de categorías.
 */
function setupCategoryButtons(categories) {
    const container = document.getElementById('categoryButtons');
    if (!container) return;

    container.innerHTML = ''; // Limpia botones anteriores
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;
        
        button.addEventListener('click', (event) => {
            // Manejar el estado activo del botón
            document.querySelectorAll('#categoryButtons .category-btn').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            // Mostrar productos de la categoría seleccionada
            showProductsByCategory(category);
        });
        container.appendChild(button);
    });
}

/**
 * Filtra los productos por la categoría seleccionada y los muestra en el carrusel horizontal.
 * @param {string} category - La categoría a mostrar.
 */
function showProductsByCategory(category) {
    const track = document.querySelector('.category-product-carousel-track');
    if (!track) return;

    const categoryProducts = appState.products.filter(product => product.category === category);
    
    track.innerHTML = ''; // Limpia el carrusel
    if (categoryProducts.length > 0) {
        categoryProducts.forEach(product => {
            // Reutilizamos la función de `products.js` para crear las tarjetas
            const productCard = renderProductCard(product); 
            track.appendChild(productCard);
        });
    } else {
        track.innerHTML = '<p class="w-full text-center text-text-color-light">No hay productos en esta categoría.</p>';
    }
}


// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initAgeVerification();
        await loadInitialData();

        // --- Renderizado de contenido dinámico ---
        initCarousel(appState.banners);
        renderProducts(appState.products, '#productGrid');
        setupProductFilters(appState.products, '#catalogo');

        // --- INICIALIZACIÓN DE LA NUEVA SECCIÓN DE CATEGORÍAS ---
        const uniqueCategories = getUniqueCategories(appState.products);
        setupCategoryButtons(uniqueCategories);

        // --- Inicialización de Carruseles Continuos ---
        const productsOnOffer = appState.products.filter(p => p.isOnOffer);
        const newProducts = appState.products.filter(p => p.isNew);
        initContinuousCarousel(productsOnOffer, 'continuousProductCarouselTrack', 'products', 'Promociones');
        initContinuousCarousel(appState.brands, 'brandContinuousCarouselTrack', 'brands', 'Marcas');
        initContinuousCarousel(productsOnOffer, 'offersContinuousCarouselTrack', 'products', 'Ofertas');


        // --- Configuración de Módulos ---
        setupSearch();
        initCart();
        setupSupport();
        updateContactInfo();
        setupUIEventListeners();
        showSection('inicio'); // Mostrar la sección de inicio por defecto

    } catch (error) {
        console.error('No se pudo inicializar la aplicación:', error);
        showToastNotification('Error crítico al iniciar. Intenta recargar.', 'error');
    }
});
