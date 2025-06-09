// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Asegúrate de importar addToCart

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos producto a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones de filtrado/renderizado (isNew, isOnOffer, category, limit, isCarousel).
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
    if (options.isOnOffer) {
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
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
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
                    <span>(${product.rating})</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" aria-label="Añadir ${product.name} al carrito">
                    Añadir al Carrito
                </button>
            </div>
            ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
            ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
        `;
        container.appendChild(productCard);
    });

    // Delegación de eventos para los botones "Añadir al Carrito"
    // Esto es más eficiente que añadir un listener a cada botón individualmente.
    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                showToastNotification('Error: Producto no encontrado para añadir al carrito.', 'error');
            }
        }
    });

    console.log(`productos.js: ${filteredProducts.length} productos renderizados en ${containerSelector}.`);
}


/**
 * Configura los filtros de productos en una sección específica.
 * @param {string} containerSelector - Selector CSS del contenedor de filtros.
 * @param {string} targetGridSelector - Selector CSS del grid donde se renderizarán los productos filtrados.
 * @param {string} initialCategory - La categoría inicial para filtrar si es relevante para la sección.
 */
export function setupProductFilters(containerSelector, targetGridSelector, initialCategory = null) {
    const filterContainer = document.querySelector(containerSelector);
    if (!filterContainer) {
        console.warn(`products.js: Contenedor de filtros no encontrado: ${containerSelector}`);
        return;
    }

    const brandFilter = filterContainer.querySelector('.filter-brand');
    const priceFilter = filterContainer.querySelector('.filter-price');
    const productSearchInput = filterContainer.querySelector('.filter-search-input');
    const categoryFilter = filterContainer.querySelector('.filter-category'); // Asumiendo un filtro de categoría si existe

    if (!brandFilter && !priceFilter && !productSearchInput && !categoryFilter) {
        console.warn(`products.js: No se encontraron elementos de filtro en ${containerSelector}.`);
        return;
    }

    // Poblar filtro de marcas si existe
    if (brandFilter) {
        // Limpiar opciones existentes primero
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>';
        const uniqueBrands = [...new Set(appState.products.map(p => p.brand))].sort();
        uniqueBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Poblar filtro de categorías si existe y no se usa un initialCategory fijo
    if (categoryFilter && !initialCategory) { // Solo si no es una sección de categoría fija
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        appState.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }


    const applyFilters = () => {
        let filtered = [...appState.products]; // Empezar con todos los productos

        // Aplicar filtro de categoría inicial si existe y es una sección dedicada
        if (initialCategory) {
            filtered = filtered.filter(p => p.category === initialCategory);
        } else if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(p => p.category === categoryFilter.value);
        }

        // Filtrar por marca
        if (brandFilter && brandFilter.value) {
            filtered = filtered.filter(p => p.brand === brandFilter.value);
        }

        // Filtrar por texto de búsqueda
        if (productSearchInput && productSearchInput.value.trim() !== '') {
            const searchTerm = productSearchInput.value.toLowerCase().trim();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }

        // Ordenar por precio
        if (priceFilter && priceFilter.value) {
            if (priceFilter.value === 'asc') {
                filtered.sort((a, b) => (a.isOnOffer ? a.offerPrice : a.price) - (b.isOnOffer ? b.offerPrice : b.price));
            } else if (priceFilter.value === 'desc') {
                filtered.sort((a, b) => (b.isOnOffer ? b.offerPrice : b.price) - (a.isOnOffer ? a.offerPrice : a.price));
            }
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: initialCategory }); // Asegura que se mantenga la categoría inicial si aplica
    };

    if (brandFilter) brandFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (productSearchInput) productSearchInput.addEventListener('input', applyFilters);
    if (categoryFilter && !initialCategory) categoryFilter.addEventListener('change', applyFilters); // Solo si es un filtro dinámico

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con los filtros iniciales
    applyFilters();
    console.log(`products.js: Filtros configurados para ${containerSelector}.`);
}


/**
 * Renderiza marcas en un contenedor específico.
 * @param {Array<Object>} brandsData - Array de objetos de marca (name, logoUrl).
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
    console.log(`products.js: ${brandsData.length} marcas renderizadas en ${containerSelector}.`);
}
