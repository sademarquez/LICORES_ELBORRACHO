import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { initAgeVerification } from './age-verification.js';
import { init3DBackground } from './background3d.js';
import { initPwaInstall } from './pwa-install.js';
import { flyToCartAnimation } from './animations.js';
import { registerServiceWorker } from './update-notifier.js';

const API_PRODUCTS_URL = 'products.json';
const API_CONFIG_URL = 'config.json';
let allProducts = [];
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 6;

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy" decoding="async">
        </div>
        <div class="product-details">
            <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
            </div>
            <button class="add-to-cart-btn" data-id="${product.id}">Agregar</button>
        </div>`;
    return card;
}

function renderCategoryButtons(categories) {
    const desktopContainer = document.getElementById('categoryButtonsContainer');
    const mobileRow1 = document.getElementById('categoryRow1');
    const mobileRow2 = document.getElementById('categoryRow2');
    if (!desktopContainer || !mobileRow1 || !mobileRow2) return;
    desktopContainer.innerHTML = '';
    mobileRow1.innerHTML = '';
    mobileRow2.innerHTML = '';
    const row1Categories = ['Licor', 'Cerveza', 'Vino', 'Tabaco'];
    const createButton = (category) => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;
        return button;
    };
    categories.forEach(category => {
        desktopContainer.appendChild(createButton(category));
        if (row1Categories.includes(category)) {
            mobileRow1.appendChild(createButton(category));
        } else {
            mobileRow2.appendChild(createButton(category));
        }
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
    const isFiltered = searchTerm || selectedCategory !== 'all' || sortOrder !== 'default';
    if (isFiltered) {
        if (searchTerm) filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
        if (selectedCategory !== 'all') filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        if (sortOrder === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
        else if (sortOrder === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
        grid.innerHTML = '';
        filteredProducts.forEach(product => grid.appendChild(renderProductCard(product)));
        loadMoreBtn.style.display = 'none';
    } else {
        displayInitialProducts();
    }
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    filter.innerHTML = '<option value="all">Todas las Categorías</option>';
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
    if (displayedProductsCount >= allProducts.length) loadMoreBtn.style.display = 'none';
}

function setupEventListeners() {
    document.body.addEventListener('click', event => {
        const target = event.target;
        if (target.matches('.add-to-cart-btn')) {
            addToCart(target.dataset.id);
            flyToCartAnimation(target);
            return;
        }
        if (target.closest('#cartOpenBtn')) {
            toggleCartSidebar(true);
            return;
        }
        const categoryButton = target.closest('.category-btn');
        if (categoryButton) {
            const category = categoryButton.dataset.category;
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });
            renderProductsByCategory(category);
            return;
        }
        const bottomNavItem = target.closest('.bottom-nav-item');
        if (bottomNavItem) {
            document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
            bottomNavItem.classList.add('active');
            const action = bottomNavItem.dataset.action;
            if (action === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
            if (action === 'cart') toggleCartSidebar(true);
            if (action === 'search') document.getElementById('mainSearchInput').focus({ preventScroll: true });
            return;
        }
    });
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreProducts);
    document.getElementById('mainSearchInput')?.addEventListener('input', applyFiltersAndRender);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('priceSortFilter')?.addEventListener('change', applyFiltersAndRender);
}

async function main() {
    console.log("DOM cargado. Iniciando la aplicación...");
    try {
        registerServiceWorker();
        initAgeVerification();
        init3DBackground();
        initPwaInstall();
        setupEventListeners();
        console.log("Módulos base y listeners inicializados.");

        let productsLoaded = false;
        try {
            const localResponse = await fetch('products.json');
            if (localResponse.ok) {
                allProducts = await localResponse.json();
                productsLoaded = true;
                console.log("Productos cargados exitosamente desde 'products.json' local.");
            } else {
                throw new Error("No se pudo cargar 'products.json' localmente.");
            }
        } catch (error) {
            console.error("Error fatal al cargar productos:", error);
            throw new Error("No se pudieron cargar los datos de los productos.");
        }

        // Cargar configuración de la app
        console.log("Intentando cargar config.json local...");
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) throw new Error('No se pudo cargar la configuración de la aplicación.');
        const appConfig = await configResponse.json();
        console.log("Configuración local procesada.");
        
        initCart(allProducts, appConfig.contactPhone);
        initHeroCarousel(appConfig.banners);
        initBrandsCarousel(appConfig.brands);
        
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        populateCategoryFilter(categories);
        
        displayInitialProducts();
        
        const firstCategoryButton = document.querySelector('.category-btn');
        if (firstCategoryButton) firstCategoryButton.click();
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        console.log("Inicialización completada.");
    } catch (error) {
        console.error("Error CRÍTICO al inicializar:", error);
        document.body.innerHTML = `<div style="padding: 2rem; text-align: center; color: white;"><h1>Error al Cargar</h1><p>${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', main);