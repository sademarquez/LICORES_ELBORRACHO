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
            <div class="product-rating">
                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                <span class="rating-value">(${product.rating})</span>
            </div>
            <button class="add-to-cart-btn btn-primary" data-product-id="${product.id}" aria-label="Añadir ${product.name} al carrito">
                Añadir al Carrito <i class="fas fa-cart-plus"></i>
            </button>
        </div>
    `;

    // Añadir event listener para el botón "Añadir al Carrito"
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
 * Renderiza una lista de productos en un contenedor específico, aplicando filtros si es necesario.
 * @param {Array<Object>} productsToRender - Array de objetos producto.
 * @param {string} containerId - ID del contenedor donde se renderizarán los productos.
 */
export function renderProducts(productsToRender, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`products.js: Contenedor de productos no encontrado: #${containerId}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="no-results-message">No se encontraron productos en esta categoría o con los filtros aplicados.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        container.appendChild(renderProductCard(product));
    });
    console.log(`products.js: Productos renderizados en #${containerId}.`);
}

/**
 * Configura los filtros de productos para una sección específica.
 * @param {string} filtersContainerId - ID del contenedor de los filtros (ej. 'productFilters').
 * @param {Array<Object>} allProducts - El array completo de productos disponibles.
 * @param {string} targetGridId - ID del contenedor de la grilla donde se mostrarán los productos filtrados.
 * @param {string} [initialCategory='all'] - Categoría inicial a aplicar al cargar.
 */
export function setupProductFilters(filtersContainerId, allProducts, targetGridId, initialCategory = 'all') {
    const filtersContainer = document.getElementById(filtersContainerId);
    if (!filtersContainer) {
        console.warn(`products.js: Contenedor de filtros no encontrado: #${filtersContainerId}. Los filtros no se configurarán.`);
        return;
    }

    const categoryFilter = filtersContainer.querySelector('#categoryFilter');
    const priceFilter = filtersContainer.querySelector('#priceFilter');
    const productSearchInput = filtersContainer.querySelector('#productSearchInput'); // Asumiendo que hay un input de búsqueda específico para esta sección

    if (!categoryFilter || !priceFilter || !productSearchInput) {
        console.warn(`products.js: Elementos de filtro (categoría, precio, búsqueda) no encontrados en #${filtersContainerId}. Los filtros no funcionarán correctamente.`);
        return;
    }

    // Llenar el filtro de categorías dinámicamente
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];
    categoryFilter.innerHTML = categories.map(cat =>
        `<option value="${cat}">${cat === 'all' ? 'Todas las Categorías' : cat}</option>`
    ).join('');
    categoryFilter.value = initialCategory; // Establecer la categoría inicial

    const applyFilters = () => {
        const selectedCategory = categoryFilter.value;
        const selectedPriceRange = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        let filtered = allProducts;

        // Filtrar por categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Filtrar por rango de precio
        if (selectedPriceRange !== 'all') {
            filtered = filtered.filter(product => {
                const price = product.isOnOffer && product.offerPrice !== null ? product.offerPrice : product.price;
                if (selectedPriceRange === '0-20000') return price >= 0 && price <= 20000;
                if (selectedPriceRange === '20001-50000') return price > 20000 && price <= 50000;
                if (selectedPriceRange === '50001-100000') return price > 50000 && price <= 100000;
                if (selectedPriceRange === '100001-plus') return price > 100000;
                return true;
            });
        }

        // Filtrar por término de búsqueda (nombre, marca, descripción)
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        renderProducts(filtered, targetGridId);
    };

    // Añadir event listeners a los filtros
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
