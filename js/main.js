// js/main.js

import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js'; // Nuevo módulo

const API_PRODUCTS_URL = 'products.json';
const API_CONFIG_URL = 'config.json';
let allProducts = [];
let appConfig = {};
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 6;

// --- FUNCIONES DE RENDERIZADO (sin cambios) ---
function renderProductCard(product) { /* ... */ }

// --- LÓGICA DE INICIALIZACIÓN ---
async function main() {
    try {
        // Carga de datos
        const [productsResponse, configResponse] = await Promise.all([
            fetch(API_PRODUCTS_URL),
            fetch(API_CONFIG_URL)
        ]);
        if (!productsResponse.ok || !configResponse.ok) throw new Error('Error al cargar datos');
        allProducts = await productsResponse.json();
        appConfig = await configResponse.json();
        
        // Inicializar módulos
        initCart(allProducts);
        setupEventListeners();

        // Inicializar carruseles con los datos cargados
        initHeroCarousel(appConfig.banners);
        initBrandsCarousel(appConfig.brands);
        
        // Renderizar resto de componentes
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        populateCategoryFilter(categories);
        displayInitialProducts();
        if (categories.length > 0) document.querySelector('.category-btn')?.click();

    } catch (error) {
        console.error("Error al inicializar:", error);
    }
}

function setupEventListeners() { /* ... (sin cambios) ... */ }
// ... (resto de funciones como renderCategoryButtons, applyFiltersAndRender, etc., sin cambios)

document.addEventListener('DOMContentLoaded', main);
