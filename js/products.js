// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos de producto a renderizar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones para filtrar o limitar los productos.
 * @param {boolean} [options.isNew=false] - Si solo se deben mostrar productos nuevos.
 * @param {boolean} [options.isOnOffer=false] - Si solo se deben mostrar productos en oferta.
 * @param {string} [options.category] - Si solo se deben mostrar productos de una categoría específica.
 * @param {number} [options.limit] - Número máximo de productos a mostrar.
 * @param {string} [options.title] - Título opcional para la sección.
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    // Aplicar filtros basados en las opciones
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

    container.innerHTML = ''; // Limpiar contenido anterior

    // Si se proporciona un título para la sección (ej: para Novedades, Licores, etc.)
    if (options.title) {
        const sectionTitle = document.createElement('h2');
        sectionTitle.classList.add('section-title');
        sectionTitle.textContent = options.title;
        container.appendChild(sectionTitle);
    }

    if (filteredProducts.length === 0) {
        const noProductsMessage = document.createElement('p');
        noProductsMessage.style.textAlign = 'center';
        noProductsMessage.style.gridColumn = '1 / -1';
        noProductsMessage.style.color = 'var(--text-color-light)';
        noProductsMessage.textContent = 'No hay productos disponibles en esta sección.';
        container.appendChild(noProductsMessage);
        return;
    }

    const productGrid = document.createElement('div');
    productGrid.classList.add('product-grid'); // Aplicar la clase de grid aquí

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const offerBadge = product.isOnOffer ? `<span class="badge offer-badge">Oferta</span>` : '';
        const newBadge = product.isNew ? `<span class="badge new-badge">Nuevo</span>` : '';

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                ${offerBadge}
                ${newBadge}
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price">
                <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                ${oldPriceHtml}
            </div>
            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}" aria-label="Añadir ${product.name} al carrito">Añadir al Carrito</button>
        `;

        // Añadir evento al botón "Añadir al Carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product.id);
            });
        }

        productGrid.appendChild(productCard);
    });
    container.appendChild(productGrid);
}

/**
 * Configura los filtros para una sección de productos específica.
 * @param {Array<Object>} allProducts - El array completo de productos disponibles.
 * @param {string} brandFilterSelector - Selector para el elemento select de filtro por marca.
 * @param {string} priceFilterSelector - Selector para el elemento select de filtro por precio.
 * @param {string} productSearchInputSelector - Selector para el input de búsqueda de productos.
 * @param {string} targetGridSelector - Selector del contenedor donde se renderizarán los productos filtrados.
 * @param {string} categoryToFilter - La categoría principal a la que se aplican estos filtros.
 */
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, categoryToFilter) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);
    const targetGridContainer = document.querySelector(targetGridSelector); // Contenedor que tiene los filtros y el grid

    if (!brandFilter || !priceFilter || !productSearchInput || !targetGridContainer) {
        console.warn('products.js: Algunos elementos del filtro de productos no se encontraron. La funcionalidad de filtro podría estar limitada.');
        return;
    }

    // Poblar el filtro de marcas
    const uniqueBrands = [...new Set(allProducts.filter(p => p.category === categoryToFilter).map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        let filtered = allProducts.filter(p => p.category === categoryToFilter); // Siempre filtrar por la categoría base

        const selectedBrand = brandFilter.value;
        const selectedPriceOrder = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: categoryToFilter, title: `Productos de ${categoryToFilter}` });
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
}

/**
 * Función para renderizar marcas (como en el carrusel de marcas).
 * @param {Array<Object>} brandsData - Array de objetos de marca.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán las marcas.
 */
export function renderBrands(brandsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor de marcas no encontrado: ${containerSelector}`);
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
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
        container.appendChild(brandDiv);
    });
}
