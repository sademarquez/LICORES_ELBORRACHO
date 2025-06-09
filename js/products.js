// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Importar el nuevo módulo

/**
 * Renders products into a specified container.
 * Simplified product card structure, no description.
 * @param {Array<Object>} productsToRender - The array of product objects to display.
 * @param {string} containerSelector - The CSS selector of the container element.
 * @param {Object} options - Options for filtering and limiting products.
 * @param {boolean} options.isNew - Filter by new products.
 * @param {boolean} options.isOnOffer - Filter by products on offer.
 * @param {string} options.category - Filter by a specific category.
 * @param {number} options.limit - Limit the number of products.
 * @param {boolean} options.isCategoryCarousel - Flag to indicate if rendering for a category carousel.
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
    if (options.category && options.category !== 'Todos') { // 'Todos' es un filtro especial
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
        productCard.dataset.id = product.id; // Almacena el ID del producto en el dataset

        // Determinar el precio a mostrar (oferta vs. normal)
        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const originalPriceHtml = product.isOnOffer ? `<span class="original-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const priceClass = product.isOnOffer ? 'price offer-price' : 'price';

        // Determinar las etiquetas (Novedad, Oferta)
        let labelsHtml = '';
        if (product.isNew) {
            labelsHtml += '<span class="product-label new">Novedad</span>';
        }
        if (product.isOnOffer) {
            labelsHtml += '<span class="product-label offer">Oferta</span>';
        }

        // Estructura simplificada de la tarjeta de producto
        productCard.innerHTML = `
            ${labelsHtml}
            <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="${priceClass}">$${displayPrice.toLocaleString('es-CO')}</p>
            ${originalPriceHtml}
            <button class="add-to-cart-btn btn-primary" data-product-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Añadir
            </button>
        `;

        // Añadir evento al botón "Añadir al carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                } else {
                    showToastNotification('Error: Producto no encontrado.', 'error');
                }
            });
        }
        container.appendChild(productCard);
    });

    console.log(`products.js: ${filteredProducts.length} productos renderizados en ${containerSelector}`);
}

/**
 * Sets up filters and search functionality for product listing sections.
 * This function will be deprecated or heavily modified for the new category buttons approach.
 * For now, it will be refactored to handle category buttons.
 */
export function setupProductFilters() {
    const categoryButtons = document.querySelectorAll('#licores .category-button');
    const filteredProductsGrid = document.getElementById('filteredProductsGrid');

    if (!categoryButtons.length || !filteredProductsGrid) {
        console.warn('products.js: No se encontraron botones de categoría o el contenedor de productos filtrados. Los filtros de categoría no funcionarán.');
        return;
    }

    // Inicializar el carrusel de productos filtrados al cargar la página
    // Renderiza la categoría "Todos" por defecto
    renderProducts(appState.products, '#filteredProductsGrid', { category: 'Todos' });
    setupCategoryProductCarousel(appState.products, '#filteredProductsCarousel', { itemsPerView: 2 });


    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedCategory = event.target.dataset.category;

            // Remover clase 'active' de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase 'active' al botón clicado
            event.target.classList.add('active');

            let productsToDisplay = [];
            if (selectedCategory === 'Todos') {
                productsToDisplay = appState.products;
            } else {
                productsToDisplay = appState.products.filter(p => p.category === selectedCategory);
            }

            // Renderizar los productos filtrados en el carrusel 2x2
            renderProducts(productsToDisplay, '#filteredProductsGrid', { category: selectedCategory });
            // Re-inicializar/actualizar el carrusel para la nueva categoría
            // Resetear la posición del carrusel al cambiar de categoría
            setupCategoryProductCarousel(productsToDisplay, '#filteredProductsCarousel', { itemsPerView: 2 });
            
            console.log(`products.js: Cambiando a categoría: ${selectedCategory}`);
        });
    });

    console.log('products.js: Filtros de categoría configurados.');
}


/**
 * Function to render brands (as in the brands section).
 * Improved with more dynamic/futuristic styling.
 * @param {Array<Object>} brandsData - Array of brand objects.
 * @param {string} containerSelector - CSS selector for the container.
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
        brandDiv.classList.add('brand-logo'); // Clase para el estilo de flotabilidad
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });

    console.log(`products.js: ${brandsData.length} marcas renderizadas en ${containerSelector}.`);
}
