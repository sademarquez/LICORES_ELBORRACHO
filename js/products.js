// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
// Importa addToCart directamente, ya que siempre es necesario cuando se renderizan productos
import { addToCart } from './cart.js';

/**
 * Crea y devuelve un elemento de tarjeta de producto HTML.
 * Se exporta para ser reutilizada por otros módulos (ej. carruseles de productos).
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto.
 */
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.dataset.id = product.id; // Para fácil acceso al ID

    let priceHtml = `<span class="product-price">$${product.price.toLocaleString('es-CO')}</span>`;
    if (product.isOnOffer && product.offerPrice !== null) {
        priceHtml = `
            <span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>
            <span class="product-offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
        `;
    }

    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <div class="product-actions">
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Añadir
                </button>
            </div>
        </div>
    `;

    // Añadir event listener al botón "Añadir al Carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            showToastNotification(`"${product.name}" añadido al carrito.`, 'success');
        });
    }

    return productCard;
}

/**
 * Renderiza un array de productos en un contenedor HTML específico.
 * @param {Array<Object>} productsData - Array de objetos producto a renderizar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 */
export function renderProducts(productsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de productos no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsData.length === 0) {
        container.innerHTML = `<p class="no-results-message">No hay productos disponibles con los criterios seleccionados.</p>`;
        return;
    }

    productsData.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });
    console.log(`products.js: Productos renderizados en ${containerSelector}.`);
}

/**
 * Configura los filtros de productos y la lógica de aplicación de filtros.
 * @param {Array<Object>} products - El array completo de productos a filtrar.
 * @param {string} containerId - El ID del contenedor donde se renderizan los productos filtrados (ej. '#allProductsGrid').
 */
export function setupProductFilters(products, containerId) { // 'containerId' ahora es el selector CSS
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearch'); // Asume que hay un input de búsqueda con este ID

    // Obtener una referencia al contenedor del grid de productos
    const productGridContainer = document.querySelector(containerId); 
    if (!productGridContainer) {
        console.error(`products.js: El contenedor de la cuadrícula de productos con ID ${containerId} no fue encontrado.`);
        return; // Salir si el contenedor no existe
    }


    const applyFilters = () => {
        let filteredProducts = [...products]; // Copia de los productos originales

        // Filtrar por categoría
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
        }

        // Filtrar por rango de precio
        const selectedPriceRange = priceFilter ? priceFilter.value : 'all';
        if (selectedPriceRange !== 'all') {
            const [min, max] = selectedPriceRange.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => product.price >= min && product.price <= max);
        }

        // Filtrar por búsqueda de texto
        const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // Renderizar los productos filtrados
        renderProducts(filteredProducts, containerId); // Usa el containerId para renderizar
    };

    // Llenar el filtro de categorías dinámicamente
    if (categoryFilter) {
        const categories = [...new Set(products.map(product => product.category))];
        categoryFilter.innerHTML = '<option value="all">Todas las Categorías</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Configurar event listeners para los filtros
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
    console.log(`products.js: Filtros configurados para la sección ${containerId}.`);
}

/**
 * Renderiza los logos de las marcas en un contenedor específico.
 * @param {Array<Object>} brandsData - Array de objetos de marca.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los logos.
 */
export function renderBrands(brandsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de marcas no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (brandsData.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay marcas disponibles.</p>`;
        return;
    }

    brandsData.forEach(brand => {
        const brandDiv = document.createElement('div');
        brandDiv.classList.add('brand-logo');
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });
    console.log(`products.js: Marcas renderizadas en ${containerSelector}.`);
}
