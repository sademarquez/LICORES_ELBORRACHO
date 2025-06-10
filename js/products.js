// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Importa addToCart directamente

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

    let badgesHtml = '';
    if (product.isNew) {
        badgesHtml += `<span class="badge badge-new">NUEVO</span>`;
    }
    if (product.isOnOffer) {
        badgesHtml += `<span class="badge badge-offer" style="right: ${product.isNew ? '60px' : 'var(--spacing-sm)'};">OFERTA</span>`; // Ajusta posición si hay ambos
    }


    productCard.innerHTML = `
        ${badgesHtml}
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <div class="product-actions">
                <button class="add-to-cart-btn btn btn-primary w-full" data-product-id="${product.id}">
                    Añadir al Carrito
                </button>
            </div>
        </div>
    `;

    // Añadir el event listener directamente al botón "Añadir al Carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (event) => {
            // Detener la propagación para evitar que el clic en el botón afecte la tarjeta completa
            event.stopPropagation();
            const productId = event.target.dataset.productId;
            addToCart(productId);
        });
    }

    return productCard;
}

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos producto a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 */
export function renderProducts(productsToRender, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de productos no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="no-results-message text-center text-text-color-light text-lg">No se encontraron productos que coincidan con tu búsqueda o filtros.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });
}

/**
 * Configura los filtros de productos y aplica el filtrado inicial.
 * @param {Array<Object>} allProducts - El array completo de productos.
 * @param {string} containerId - El ID del contenedor principal de la sección donde están los filtros y la cuadrícula de productos.
 */
export function setupProductFilters(allProducts, containerId) {
    const sectionContainer = document.querySelector(containerId);
    if (!sectionContainer) {
        console.warn(`products.js: Contenedor de filtros no encontrado para ${containerId}.`);
        return;
    }

    const categoryFilter = sectionContainer.querySelector('#categoryFilter');
    const priceFilter = sectionContainer.querySelector('#priceFilter');
    const priceValueSpan = sectionContainer.querySelector('#priceValue');
    const productSearchInput = sectionContainer.querySelector('#productSearch');
    const productGrid = sectionContainer.querySelector('#productGrid');

    if (!categoryFilter || !priceFilter || !priceValueSpan || !productSearchInput || !productGrid) {
        console.warn(`products.js: Algunos elementos de filtro no encontrados en ${containerId}. La funcionalidad de filtrado podría estar limitada.`);
        return;
    }

    // Poblar el filtro de categorías dinámicamente
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="all">Todas</option>' +
        categories.filter(cat => cat !== 'all')
                  .map(cat => `<option value="${cat}">${cat}</option>`)
                  .join('');

    // Establecer el valor inicial del rango de precio y mostrarlo
    const maxPrice = Math.max(...allProducts.map(p => p.price));
    priceFilter.max = maxPrice;
    priceFilter.value = maxPrice;
    priceValueSpan.textContent = `$${maxPrice.toLocaleString('es-CO')}`;

    priceFilter.addEventListener('input', () => {
        priceValueSpan.textContent = `$${parseInt(priceFilter.value).toLocaleString('es-CO')}`;
        applyFilters();
    });


    /**
     * Aplica los filtros actuales a los productos y los renderiza.
     */
    const applyFilters = () => {
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseInt(priceFilter.value);
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        let filteredProducts = allProducts.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesPrice = (product.isOnOffer && product.offerPrice !== null ? product.offerPrice : product.price) <= maxPrice;
            const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm) || product.brand.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesPrice && matchesSearchTerm;
        });

        renderProducts(filteredProducts, '#productGrid');
    };

    // Asignar event listeners
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    applyFilters();
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
}
