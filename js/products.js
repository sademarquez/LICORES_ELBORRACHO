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
    let offerTag = ''; // Variable para la etiqueta de oferta
    let newTag = ''; // Variable para la etiqueta de nuevo

    if (product.isOnOffer && product.offerPrice !== null) {
        const discountPercentage = ((product.price - product.offerPrice) / product.price) * 100;
        priceHtml = `
            <span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>
            <span class="product-offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
        `;
        offerTag = `<div class="offer-tag">-${discountPercentage.toFixed(0)}%</div>`;
    }

    if (product.isNew) {
        newTag = `<div class="new-tag"><i class="fas fa-star"></i> Nuevo</div>`;
    }

    productCard.innerHTML = `
        ${offerTag}
        ${newTag}
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <p class="product-description">${product.description}</p>
        </div>
        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Añadir al Carrito
        </button>
    `;

    // Añadir el event listener para el botón de añadir al carrito
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd, 1); // Añadir 1 unidad del producto
            } else {
                showToastNotification('Error: Producto no encontrado.', 'error');
            }
        });
    }

    return productCard;
}

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - El array de productos a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 */
export function renderProducts(productsToRender, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor de productos no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="no-results-message">No hay productos disponibles con estos criterios.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });
    // console.log(`products.js: ${productsToRender.length} productos renderizados en ${containerSelector}.`); // ELIMINADO
}

/**
 * Configura los filtros de productos y aplica el filtrado y renderizado inicial.
 * @param {Array<Object>} allProducts - El array completo de productos.
 * @param {string} sectionContainerSelector - Selector del contenedor principal de la sección.
 * @param {string} productsGridSelector - Selector del contenedor de la cuadrícula de productos.
 */
export function setupProductFilters(allProducts, sectionContainerSelector, productsGridSelector) {
    const sectionContainer = document.querySelector(sectionContainerSelector);
    if (!sectionContainer) {
        console.warn(`products.js: Contenedor de sección de filtros no encontrado: ${sectionContainerSelector}. Saltando configuración de filtros.`);
        return;
    }

    const categoryFilter = sectionContainer.querySelector('#categoryFilter');
    const priceFilter = sectionContainer.querySelector('#priceFilter');
    const productSearchInput = sectionContainer.querySelector('#productSearchInput');

    const applyFilters = () => {
        let filtered = [...allProducts];

        // Filtrar por categoría
        if (categoryFilter && categoryFilter.value !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter.value);
        }

        // Filtrar por precio máximo
        if (priceFilter && priceFilter.value !== '') {
            const maxPrice = parseFloat(priceFilter.value);
            if (!isNaN(maxPrice)) {
                filtered = filtered.filter(product => product.price <= maxPrice || (product.isOnOffer && product.offerPrice <= maxPrice));
            }
        }

        // Filtrar por término de búsqueda
        if (productSearchInput && productSearchInput.value.trim() !== '') {
            const searchTerm = productSearchInput.value.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        renderProducts(filtered, productsGridSelector);
    };

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('input', applyFilters); // Usar 'input' para reacción instantánea
    if (productSearchInput) productSearchInput.addEventListener('input', applyFilters);

    applyFilters();
    // console.log(`products.js: Filtros configurados para la sección ${sectionContainerSelector}.`); // ELIMINADO
}

/**
 * Renderiza los logos de las marcas en un contenedor específico.
 * NOTA: Esta función no es usada por initContinuousProductCarousel
 * ya que ese módulo crea sus propios elementos de marca.
 * Podría ser usada para otra sección de marcas estática.
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
        brandDiv.classList.add('brand-logo'); // Asegúrate que esta clase tiene estilos
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });
    // console.log(`products.js: Marcas renderizadas en ${containerSelector}.`); // ELIMINADO
}
