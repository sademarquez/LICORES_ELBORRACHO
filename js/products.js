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
                ${'⭐'.repeat(Math.floor(product.rating))}
                <span>(${product.rating.toFixed(1)})</span>
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" aria-label="Añadir ${product.name} al carrito">
                Añadir al Carrito
            </button>
        </div>
        ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
        ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
    `;

    // Añadir event listener al botón de añadir al carrito
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product); // Llama a la función addToCart del módulo cart.js
            showToastNotification(`"${product.name}" añadido al carrito.`, 'success');
        });
    }

    return productCard;
}


/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos producto.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones de filtrado y límite inicial.
 * @param {string} [options.category] - Filtra por categoría.
 * @param {boolean} [options.isNew] - Filtra por productos nuevos.
 * @param {boolean} [options.isOnOffer] - Filtra por productos en oferta.
 * @param {number} [options.limit] - Limita el número de productos mostrados.
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    // Aplicar filtros iniciales basados en las opciones
    if (options.isNew) {
        filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (options.isOnOffer) { // Añadir filtro para ofertas
        filteredProducts = filteredProducts.filter(p => p.isOnOffer);
    }
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }


    container.innerHTML = ''; // Limpiar el contenido anterior

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p class="no-results-message">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });
}

/**
 * Configura los filtros para una sección de productos específica.
 * @param {string} targetGridSelector - Selector CSS de la grilla de productos a filtrar.
 * @param {string} categoryToFilter - La categoría principal de esta sección de la grilla.
 */
export function setupProductFilters(targetGridSelector, categoryToFilter) {
    const containerId = targetGridSelector.replace('#', '').replace('ProductGrid', ''); // Ej: 'licores'
    const brandFilter = document.getElementById(`${containerId}BrandFilter`);
    const priceFilter = document.getElementById(`${containerId}PriceFilter`);
    const productSearchInput = document.getElementById(`${containerId}SearchInput`);

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn(`products.js: Elementos de filtro no encontrados para la sección ${containerId}.`);
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    const brandsForCategory = [...new Set(
        appState.products
            .filter(p => p.category === categoryToFilter)
            .map(p => p.brand)
            .sort() // Ordenar alfabéticamente
    )];

    brandFilter.innerHTML = '<option value="">Todas las marcas</option>';
    brandsForCategory.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });


    const applyFilters = () => {
        let filtered = appState.products.filter(p => p.category === categoryToFilter);

        // Filtrar por marca
        const selectedBrand = brandFilter.value;
        if (selectedBrand) {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }

        // Filtrar por texto de búsqueda
        const searchTerm = productSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }

        // Ordenar por precio
        const sortOrder = priceFilter.value;
        if (sortOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (sortOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: categoryToFilter }); // Asegura que se mantenga la categoría
    };

    brandFilter.addEventListener('change', applyFilters);
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
