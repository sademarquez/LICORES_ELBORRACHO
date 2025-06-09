// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renderiza una lista de productos en un contenedor dado.
 * @param {Array<Object>} productsToRender - Array de objetos producto a renderizar.
 * @param {HTMLElement} containerElement - El elemento DOM donde se renderizarán los productos.
 * @param {Object} options - Opciones para filtrar y controlar la renderización (isNew, isOnOffer, category, limit).
 */
export function renderProducts(productsToRender, containerElement, options = {}) {
    if (!containerElement) {
        console.error(`Contenedor no encontrado para renderizar productos.`);
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

    containerElement.innerHTML = ''; // Limpiar el contenido anterior

    if (filteredProducts.length === 0) {
        containerElement.innerHTML = `<p class="no-results-message">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const priceDisplay = product.isOnOffer ?
            `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span> <span class="price">$${product.offerPrice.toLocaleString('es-CO')}</span>` :
            `<span class="price">$${product.price.toLocaleString('es-CO')}</span>`;

        const offerBadge = product.isOnOffer ? `<span class="offer-badge">Oferta</span>` : '';
        const newBadge = product.isNew && !product.isOnOffer ? `<span class="offer-badge" style="background-color: var(--info-color);">Nuevo</span>` : ''; // Si es nuevo y no oferta

        productCard.innerHTML = `
            ${offerBadge}
            ${newBadge}
            <div class="product-card-content">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <p>${product.description.substring(0, 50)}...</p>
                <div class="price-container">
                    ${priceDisplay}
                </div>
                <button class="add-to-cart-btn btn btn-primary" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir
                </button>
            </div>
        `;

        productCard.querySelector('.add-to-cart-btn').addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                showToastNotification('Producto no encontrado.', 'error');
            }
        });

        containerElement.appendChild(productCard);
    });
}

/**
 * Renderiza los logos de las marcas en un contenedor.
 * @param {Array<Object>} brandsData - Array de objetos marca.
 * @param {string} containerSelector - Selector CSS del contenedor donde renderizar las marcas.
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
