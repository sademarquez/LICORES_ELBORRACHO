import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { initAgeVerification } from './age-verification.js';
import { init3DBackground } from './background3d.js';
import { initPwaInstall } from './pwa-install.js';
import './version-manager.js';

const API_PRODUCTS_URL = 'products.json';
const API_CONFIG_URL = 'config.json';
let allProducts = [];
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 6;

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    // Estructura actualizada con loading="lazy" y decoding="async" para optimizar la carga de imágenes.
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy" decoding="async">
        </div>
        <div class="product-details">
            <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString('es-CO')}</p>
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
        button.dataset.category = category; // Usar dataset para identificar la categoría
        return button;
    };

    categories.forEach(category => {
        // Crear y añadir botón para la vista de escritorio
        desktopContainer.appendChild(createButton(category));

        // Crear y añadir botón para la vista móvil correspondiente
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

async function main() {
    console.log("DOM cargado. Iniciando la aplicación...");
    try {
        // Inicializar módulos que interactúan con el DOM
        initAgeVerification();
        init3DBackground();
        initPwaInstall();
        console.log("Módulos base inicializados.");

        let productsLoaded = false;
        // Intentar cargar desde API externa
        try {
            console.log("Intentando cargar productos desde la API central: https://domiz.netlify.app/api/products");
            const apiResponse = await fetch('https://domiz.netlify.app/api/products', { cache: 'no-store' });
            if (apiResponse.ok) {
                const productsData = await apiResponse.json();
                if (productsData && productsData.length > 0) {
                    allProducts = productsData;
                    console.log("Productos cargados exitosamente desde la API externa.");
                    productsLoaded = true;
                } else {
                    console.warn("API externa respondió OK, pero no devolvió productos. Fallback a local.");
                }
            } else {
                console.warn(`API externa respondió con error: ${apiResponse.status}. Fallback a local.`);
            }
        } catch (apiError) {
            console.error("Error al cargar desde API externa. Fallback a local:", apiError);
        }

        // Fallback a products.json local si la carga de la API falló
        if (!productsLoaded) {
            console.log("Intentando fallback a 'products.json' local...");
            const localResponse = await fetch('products.json');
            if (localResponse.ok) {
                allProducts = await localResponse.json();
                console.log("Productos cargados exitosamente desde 'products.json' local.");
            } else {
                throw new Error("No se pudieron cargar los datos de los productos ni desde la API ni localmente.");
            }
        }

        // Cargar configuración de la app
        console.log("Intentando cargar config.json local...");
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) throw new Error('No se pudo cargar la configuración de la aplicación.');
        const appConfig = await configResponse.json();
        console.log("Configuración local procesada.");
        
        // Inicializar el resto de la aplicación con los datos cargados
        initCart(allProducts, appConfig.contactPhone);
        initHeroCarousel(appConfig.banners);
        initBrandsCarousel(appConfig.brands);
        console.log("Carrito y carruseles inicializados.");
        
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        populateCategoryFilter(categories);
        console.log("Categorías renderizadas.");

        displayInitialProducts();
        console.log("Productos iniciales mostrados.");
        
        const firstCategoryButton = document.querySelector('.category-btn');
        if (firstCategoryButton) {
            firstCategoryButton.click();
        }
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Iniciar el heartbeat
        setInterval(() => {
            navigator.sendBeacon('https://domiz.netlify.app/api/stores/ping', JSON.stringify({
                storeName: 'LICORES_ELBORRACHO',
                storeUrl: window.location.href
            }));
        }, 30000);

        console.log("Inicialización de la aplicación completada con éxito.");

    } catch (error) {
        console.error("Error CRÍTICO al inicializar la aplicación:", error);
        const body = document.querySelector('body');
        body.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: white; background-color: #1a1a1a; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">Error al Cargar la Aplicación</h1>
                <p style="margin-bottom: 1rem;">Lo sentimos, algo salió mal. Por favor, intenta recargar la página.</p>
                <p style="font-family: monospace; background-color: #2a2a2a; padding: 1rem; border-radius: 8px; max-width: 80%; overflow-wrap: break-word;">${error.message}</p>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Usar delegación de eventos en el body para manejar clics en toda la app
    document.body.addEventListener('click', event => {
        const target = event.target;

        // Botón para agregar al carrito
        if (target.matches('.add-to-cart-btn')) {
            addToCart(target.dataset.id);
            return;
        }

        // Botón para abrir el carrito
        if (target.closest('#cartOpenBtn')) {
            toggleCartSidebar(true);
            return;
        }

        // Botones de categoría (Desktop y Mobile)
        const categoryButton = target.closest('.category-btn');
        if (categoryButton) {
            const category = categoryButton.dataset.category;
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });
            renderProductsByCategory(category);
            return;
        }

        // Barra de navegación inferior
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

    // Listeners para eventos de 'input' y 'change' en los filtros
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreProducts);
    document.getElementById('mainSearchInput')?.addEventListener('input', applyFiltersAndRender);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('priceSortFilter')?.addEventListener('change', applyFiltersAndRender);
}

document.addEventListener('DOMContentLoaded', main);
