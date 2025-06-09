// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Asegúrate de importar addToCart si se usa aquí

/**
 * Renderiza todos los productos en un contenedor de grid específico.
 * Esta función es para la sección de "Todos los Productos".
 * @param {Array<Object>} productsToRender - Array de productos a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 */
export function renderAllProducts(productsToRender, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar todos los productos: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar el contenido anterior

    if (productsToRender.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        const productCard = renderProductsCard(product); // Reutiliza la función para crear la tarjeta
        container.appendChild(productCard);
    });
}

/**
 * Crea y devuelve un elemento HTML de tarjeta de producto.
 * Esto permite reutilizar la lógica de creación de tarjetas en diferentes lugares (grid, carrusel).
 * @param {Object} product - Objeto con los datos del producto.
 * @returns {HTMLElement} El elemento div de la tarjeta de producto.
 */
export function renderProductsCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.dataset.id = product.id;

    let priceHtml = `<span class="product-price">$${product.price.toLocaleString('es-CO')}</span>`;
    if (product.isOnOffer && product.offerPrice) {
        priceHtml = `
            <span class="product-price offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
            <span class="original-price">$${product.price.toLocaleString('es-CO')}</span>
        `;
    }

    const badgesHtml = `
        ${product.isNew ? '<span class="badge new">Nuevo</span>' : ''}
        ${product.isOnOffer ? '<span class="badge offer">Oferta</span>' : ''}
    `;

    productCard.innerHTML = `
        <div class="product-badges">${badgesHtml}</div>
        <img src="${product.imageUrl}" alt="${product.name}" class="product-card-image" loading="lazy">
        <h3>${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
        <div class="product-rating">
            ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
            ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
            <span>(${product.rating})</span>
        </div>
        <p class="product-price-container">${priceHtml}</p>
        <button class="add-to-cart-btn" data-product-id="${product.id}">Agregar al Carrito</button>
    `;
    return productCard;
}


/**
 * Configura los filtros de productos y el campo de búsqueda para la sección de "Todos los Productos".
 * Aplica los filtros y renderiza los productos en el grid especificado.
 * @param {Array<Object>} productsData - Los productos completos para filtrar.
 * @param {string} targetGridSelector - El selector del grid donde se mostrarán los productos filtrados.
 */
export function setupProductFilters(productsData, targetGridSelector) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('products.js: Elementos de filtro de productos no encontrados. La funcionalidad de filtro podría estar limitada.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    const uniqueBrands = [...new Set(productsData.map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        let filtered = [...productsData];

        // Filtrar por búsqueda
        const searchTerm = productSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // Filtrar por marca
        const selectedBrand = brandFilter.value;
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // Ordenar por precio
        const sortOrder = priceFilter.value;
        if (sortOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (sortOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderAllProducts(filtered, targetGridSelector);
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice
    applyFilters();
    console.log('products.js: Filtros de productos configurados.');
}

/**
 * Función para renderizar marcas (como en el carrusel de marcas).
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
    console.log('products.js: Marcas renderizadas.');
}
