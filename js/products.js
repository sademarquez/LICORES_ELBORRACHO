// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

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


    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer ? `<span class="product-price on-offer">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const newBadge = product.isNew ? '<span class="product-badge new">NUEVO</span>' : '';
        const offerBadge = product.isOnOffer ? '<span class="product-badge offer">OFERTA</span>' : '';

        productCard.innerHTML = `
            ${newBadge}
            ${offerBadge}
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <p class="product-description">${product.description}</p>
                <div class="price-container">
                    ${oldPriceHtml}
                    <span class="product-price-new">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? '<i class="fas fa-cart-plus"></i> Añadir' : 'Agotado'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners a los botones "Añadir al Carrito"
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            const product = appState.products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

/**
 * Configura los filtros y la búsqueda para una sección específica de productos.
 * @param {Array<Object>} allProducts - El array completo de productos.
 * @param {string} brandFilterSelector - Selector del elemento select para filtrar por marca.
 * @param {string} priceFilterSelector - Selector del elemento select para ordenar por precio.
 * @param {string} productSearchInputSelector - Selector del input de búsqueda.
 * @param {string} targetGridSelector - Selector del contenedor donde se renderizarán los productos.
 * @param {string} categoryToFilter - La categoría específica para esta sección (ej: 'Licor', 'Snack').
 */
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, categoryToFilter) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);
    const clearSearchButton = productSearchInput ? productSearchInput.nextElementSibling : null; // Asumiendo que el botón está inmediatamente después del input

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn(`products.js: No se encontraron todos los elementos de filtro para la sección ${categoryToFilter}.`);
        return;
    }

    // Poblar las opciones de marca
    const brands = [...new Set(allProducts.filter(p => p.category === categoryToFilter).map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        const selectedBrand = brandFilter.value;
        const selectedOrder = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        let filtered = allProducts.filter(product => {
            const matchesCategory = product.category === categoryToFilter;
            const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;
            const matchesSearch = searchTerm === '' ||
                                  product.name.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesBrand && matchesSearch;
        });

        // Ordenar por precio
        if (selectedOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: categoryToFilter }); // Asegura que se mantenga la categoría
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            productSearchInput.value = '';
            applyFilters();
        });
    }

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
}

/**
 * Renderiza las cards de categoría.
 * @param {HTMLElement} container - El contenedor donde se renderizarán las cards.
 * @param {Array<Object>} categoriesData - Array de objetos de categoría (nombre, imagen, link, etc.).
 */
export function renderCategoryCards(container, categoriesData) {
    if (!container) {
        console.error('products.js: Contenedor para cards de categoría no encontrado.');
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (categoriesData.length === 0) {
        container.innerHTML = `<p class="no-results-message" style="grid-column: 1 / -1;">No hay categorías disponibles.</p>`;
        return;
    }

    categoriesData.forEach(category => {
        const categoryCard = document.createElement('a');
        categoryCard.href = category.link || `#${category.id}`; // Enlaza a la sección o usa un ID
        categoryCard.classList.add('category-card');
        categoryCard.dataset.category = category.name; // Para identificar la categoría

        categoryCard.innerHTML = `
            <img src="${category.imageUrl}" alt="${category.name}">
            <h3>${category.name}</h3>
        `;
        container.appendChild(categoryCard);
    });
}
