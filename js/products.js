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
        const originalPriceHtml = product.isOnOffer ? `<span class="original-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const isNewTag = product.isNew ? '<span class="new-badge">Nuevo</span>' : '';
        const isOnOfferTag = product.isOnOffer ? '<span class="offer-badge">Oferta</span>' : '';


        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}">
                ${isNewTag}
                ${isOnOfferTag}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    ${originalPriceHtml}
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir al carrito
                </button>
            </div>
        `;

        // Añadir evento al botón "Añadir al carrito"
        const addToCartButton = productCard.querySelector('.add-to-cart-btn');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', () => {
                addToCart(product.id);
            });
        }

        container.appendChild(productCard);
    });
}

// Función para configurar filtros de productos (para las secciones principales)
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, categoryToFilter = null) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);
    const targetGrid = document.querySelector(targetGridSelector); // Asegurarse de que el targetGrid es correcto

    if (!brandFilter || !priceFilter || !productSearchInput || !targetGrid) {
        console.warn(`products.js: Algunos elementos de filtro o grid no se encontraron para ${targetGridSelector}. La funcionalidad de filtro podría estar limitada.`);
        return;
    }

    // Llenar el filtro de marcas
    const uniqueBrands = [...new Set(allProducts.filter(p => categoryToFilter ? p.category === categoryToFilter : true).map(p => p.brand))];
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        let filtered = allProducts.filter(product => {
            // Filtrar por categoría si se especifica
            if (categoryToFilter && product.category !== categoryToFilter) {
                return false;
            }

            // Filtrar por marca
            if (brandFilter.value && product.brand !== brandFilter.value) {
                return false;
            }

            // Filtrar por búsqueda de texto
            const searchTerm = productSearchInput.value.toLowerCase().trim();
            if (searchTerm && !(product.name.toLowerCase().includes(searchTerm) ||
                                product.brand.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm))) {
                return false;
            }
            return true;
        });

        // Ordenar por precio
        if (priceFilter.value === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (priceFilter.value === 'desc') {
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
}

// Función para renderizar marcas (como en el carrusel de marcas)
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
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
        container.appendChild(brandDiv);
    });
}
