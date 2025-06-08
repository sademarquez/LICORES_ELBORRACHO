// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renderiza una lista de productos en un contenedor DOM específico.
 * @param {Array<Object>} productsToRender - El array de objetos de productos a renderizar.
 * @param {string} containerSelector - El selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones de filtrado y límite (isNew, limit, category, isOnOffer).
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender]; // Trabaja con una copia para no modificar el array original

    // Aplicar filtros según las opciones
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
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light); padding: 20px;">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const offerLabel = product.isOnOffer ? `<span class="product-badge offer-badge">Oferta</span>` : '';
        const newLabel = product.isNew && !product.isOnOffer ? `<span class="product-badge new-badge">Nuevo</span>` : ''; // Mostrar 'Nuevo' solo si no está en oferta

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}">
                ${offerLabel}
                ${newLabel}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <div class="product-price">
                    ${oldPriceHtml}
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(product.rating))}
                    ${'☆'.repeat(5 - Math.floor(product.rating))}
                    <span>(${product.rating.toFixed(1)})</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}"
                    ${product.stock === 0 ? 'disabled title="Producto agotado"' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        `;

        // Añadir evento al botón "Añadir al Carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product.id);
            });
        }
        container.appendChild(productCard);
    });
}

/**
 * Configura los filtros de productos y sus event listeners.
 * @param {Array<Object>} productsData - El array completo de productos.
 * @param {string} targetContainerSelector - El selector del contenedor cuyos filtros se están configurando.
 */
export function setupProductFilters(productsData, targetContainerSelector = '#allProductsGrid') {
    const filterContainer = document.querySelector(targetContainerSelector).previousElementSibling; // Asume que los filtros están justo antes del grid
    if (!filterContainer || !filterContainer.classList.contains('product-filters')) {
        console.warn(`products.js: No se encontró el contenedor de filtros (.product-filters) para ${targetContainerSelector}. Los filtros no se inicializarán.`);
        return;
    }

    const brandFilter = filterContainer.querySelector('#brandFilter');
    const priceFilter = filterContainer.querySelector('#priceFilter');
    const productSearchInput = filterContainer.querySelector('#productSearchInput');

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn(`products.js: Faltan elementos de filtro en ${targetContainerSelector}. Los filtros no se inicializarán correctamente.`);
        return;
    }

    // Obtener marcas únicas de los productos (solo licores para este filtro principal)
    const uniqueBrands = [...new Set(productsData.filter(p => p.category === 'Licor').map(p => p.brand))].sort();

    // Limpiar y poblar el filtro de marcas
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        const selectedBrand = brandFilter.value;
        const selectedPriceOrder = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        // **IMPORTANTE:** Este filtro está diseñado SOLO para la sección de 'Licor'.
        // Si necesitas filtros para otras secciones, deberás replicar esta lógica
        // o refactorizar para una solución más genérica.
        let filtered = productsData.filter(product => product.category === 'Licor');

        filtered = filtered.filter(product => {
            const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm) ||
                                  (product.description ? product.description.toLowerCase().includes(searchTerm) : false); // Manejo de descripción opcional
            return matchesBrand && matchesSearch;
        });

        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        renderProducts(filtered, targetContainerSelector, { category: 'Licor' }); // Renderiza los productos filtrados en el contenedor objetivo
    };

    // Event listeners para los filtros
    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);
}

/**
 * Renderiza los logos de las marcas en un carrusel o contenedor.
 * @param {Array<Object>} brandsData - Array de objetos de marcas.
 * @param {string} containerSelector - Selector del contenedor donde se renderizarán.
 */
export function renderBrands(brandsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor no encontrado para renderizar marcas: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar contenido previo

    if (brandsData.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light); padding: 20px;">No hay marcas disponibles.</p>`;
        return;
    }

    brandsData.forEach(brand => {
        const brandItem = document.createElement('div');
        brandItem.classList.add('brand-item');
        brandItem.innerHTML = `
            <img src="${brand.logoUrl}" alt="${brand.name} Logo">
            <span>${brand.name}</span>
        `;
        container.appendChild(brandItem);
    });
    // Si el carrusel de marcas es dinámico, podrías necesitar una función para inicializarlo aquí
    // similar a initCarousel para los banners, pero asumiendo que el CSS maneja el overflow y scroll.
}
