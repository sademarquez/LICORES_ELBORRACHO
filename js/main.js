// js/main.js

import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';

const API_PRODUCTS_URL = 'products.json';
const API_CONFIG_URL = 'config.json';
let allProducts = [];
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 6;

// --- FUNCIONES DE RENDERIZADO (RESTAURADAS) ---

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-name-overlay"><h3 class="product-name">${product.name}</h3></div>
        </div>
        <div class="product-details">
            <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
            <button class="add-to-cart-btn" data-id="${product.id}">Agregar</button>
        </div>`;
    return card;
}

function renderCategoryButtons(categories) {
    const container = document.getElementById('categoryButtonsContainer');
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', () => {
            container.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProductsByCategory(category);
        });
        container.appendChild(button);
    });
}

function renderProductsByCategory(category) {
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;
    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = '';
    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => container.appendChild(renderProductCard(product)));
    } else {
        container.innerHTML = `<p class="w-full text-center text-text-color-secondary">No hay productos en esta categoría.</p>`;
    }
}

function applyFiltersAndRender() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;
    
    const searchTerm = document.getElementById('mainSearchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const sortOrder = document.getElementById('priceSortFilter').value;
    
    let filteredProducts = allProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }
    if (sortOrder === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    grid.innerHTML = '';
    filteredProducts.forEach(product => grid.appendChild(renderProductCard(product)));
    
    const isFiltered = searchTerm || selectedCategory !== 'all' || sortOrder !== 'default';
    loadMoreBtn.style.display = isFiltered ? 'none' : 'block';
    if (!isFiltered) {
        // Si no hay filtros, reseteamos la vista paginada
        displayInitialProducts();
    }
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

function displayInitialProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;
    
    grid.innerHTML = '';
    const productsToDisplay = allProducts.slice(0, PRODUCTS_PER_PAGE);
    productsToDisplay.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProductsCount = productsToDisplay.length;
    
    loadMoreBtn.style.display = displayedProductsCount >= allProducts.length ? 'none' : 'block';
}

function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;

    const nextProducts = allProducts.slice(displayedProductsCount, displayedProductsCount + PRODUCTS_PER_PAGE);
    nextProducts.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProductsCount += nextProducts.length;

    if (displayedProductsCount >= allProducts.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// --- LÓGICA DE INICIALIZACIÓN ---

async function main() {
    try {
        const [productsResponse, configResponse] = await Promise.all([
            fetch('products.json'),
            fetch('config.json')
        ]);
        if (!productsResponse.ok || !configResponse.ok) throw new Error('Error al cargar datos');
        
        allProducts = await productsResponse.json();
        const appConfig = await configResponse.json();
        
        initCart(allProducts);
        setupEventListeners();
        
        initHeroCarousel(appConfig.banners);
        initBrandsCarousel(appConfig.brands);
        
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        populateCategoryFilter(categories);
        displayInitialProducts();
        
        if (categories.length > 0) {
            document.querySelector('.category-btn')?.click();
        }

    } catch (error) {
        console.error("Error al inicializar:", error);
    }
}

function setupEventListeners() {
    document.getElementById('cartOpenBtn')?.addEventListener('click', () => toggleCartSidebar(true));
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreProducts);
    
    const mainSearchInput = document.getElementById('mainSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceSortFilter = document.getElementById('priceSortFilter');

    mainSearchInput?.addEventListener('input', applyFiltersAndRender);
    categoryFilter?.addEventListener('change', applyFiltersAndRender);
    priceSortFilter?.addEventListener('change', applyFiltersAndRender);

    // Resetear a vista paginada si se borran los filtros
    mainSearchInput?.addEventListener('input', (e) => {
        if (e.target.value === '' && categoryFilter.value === 'all' && priceSortFilter.value === 'default') {
            displayInitialProducts();
        }
    });

    document.body.addEventListener('click', event => {
        if (event.target.matches('.add-to-cart-btn')) {
            addToCart(event.target.dataset.id);
        }
    });
}

document.addEventListener('DOMContentLoaded', main);
