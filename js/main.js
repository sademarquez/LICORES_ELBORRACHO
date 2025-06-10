// js/main.js

// --- Importaciones ---
import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js';

// --- Estado de la Aplicación ---
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

// --- Carga de Datos ---
async function loadInitialData() {
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('config.json'),
            fetch('products.json')
        ]);
        if (!configResponse.ok) throw new Error(`Error HTTP ${configResponse.status} al cargar config.json`);
        if (!productsResponse.ok) throw new Error(`Error HTTP ${productsResponse.status} al cargar products.json`);

        const configData = await configResponse.json();
        const productsData = await productsResponse.json();
        
        appState.products = productsData || [];
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };
    } catch (error) {
        console.error('Error fatal al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos. Por favor, recarga la página.', 'error');
        throw error; // Detiene la ejecución si los datos no cargan
    }
}

// --- Lógica de la Interfaz ---
function setupUIEventListeners() {
    // Código de los event listeners... (sin cambios)
}

function showSection(sectionId) {
    // Código para mostrar secciones... (sin cambios)
}

function updateContactInfo() {
    // Código para actualizar info de contacto... (sin cambios)
}

// --- Lógica de Categorías ---
function getUniqueCategories(products) {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
}

function setupCategorySection() {
    const categories = getUniqueCategories(appState.products);
    const buttonsContainer = document.getElementById('categoryButtons');
    if (!buttonsContainer) return;

    buttonsContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;
        button.addEventListener('click', (e) => {
            document.querySelectorAll('#categoryButtons .category-btn').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            showProductsByCategory(category);
        });
        buttonsContainer.appendChild(button);
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

// --- Inicialización de la Aplicación ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initAgeVerification();
        await loadInitialData();

        // Inicialización de Módulos (en orden lógico)
        setupUIEventListeners();
        initCart();
        setupSearch();
        setupSupport();
        updateContactInfo();
        
        // Renderizado de Contenido Dinámico
        initCarousel(appState.banners);
        renderProducts(appState.products, '#productGrid');
        setupProductFilters(appState.products, '#catalogo');
        
        const productsOnOffer = appState.products.filter(p => p.isOnOffer);
        initContinuousCarousel(productsOnOffer, 'continuousProductCarouselTrack', 'products', 'Promociones');
        initContinuousCarousel(appState.brands, 'brandContinuousCarouselTrack', 'brands', 'Marcas');
        initContinuousCarousel(productsOnOffer, 'offersContinuousCarouselTrack', 'products', 'Ofertas');

        // Configuración de la nueva sección de categorías
        setupCategorySection();
        
        showSection('inicio');

    } catch (error) {
        console.error('No se pudo inicializar la aplicación:', error);
    }
});
