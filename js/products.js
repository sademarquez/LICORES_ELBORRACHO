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


    container.innerHTML = ''; // Limpiar el contenido anterior

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id; // Añadir data-id para fácil referencia

        const isOnOffer = product.isOnOffer && product.offerPrice !== null;
        const displayPrice = isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';

        productCard.innerHTML = `
            <div class="product-card-image">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <p class="category">${product.category}</p>
                <p class="price ${isOnOffer ? 'offer-price' : ''}">$${displayPrice.toLocaleString('es-CO')} ${oldPriceHtml}</p>
            </div>
            <div class="product-card-actions">
                <button class="add-to-cart-btn" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        `;

        // Añadir event listener al botón de añadir al carrito
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                } else {
                    console.error('Producto no encontrado para añadir al carrito:', productId);
                    showToastNotification('Error: Producto no disponible.', 'error');
                }
            });
        }

        container.appendChild(productCard);
    });
}

// Función para configurar los filtros de productos
export function setupProductFilters(productsData, targetGridSelector, options = {}) {
    const categoryFilter = document.getElementById(options.targetCategoryFilterId || 'categoryFilter');
    const priceFilter = document.getElementById(options.targetPriceFilterId || 'priceFilter');
    const productSearchInput = document.getElementById(options.targetSearchInputId || 'allProductsSearchInput');

    if (!document.querySelector(targetGridSelector)) {
        console.warn(`Grid de productos objetivo no encontrado para filtros: ${targetGridSelector}`);
        return;
    }

    // Populate categories filter
    if (categoryFilter) {
        const uniqueCategories = [...new Set(productsData.map(p => p.category))];
        categoryFilter.innerHTML = '<option value="">Todas las Categorías</option>'; // Reset
        uniqueCategories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        // Si hay una categoría activa preseleccionada (ej. desde un clic en el menú), la aplicamos
        if (appState.activeCategory) {
            categoryFilter.value = appState.activeCategory;
        }
    } else {
        console.warn('Filtro de categorías no encontrado.');
    }

    const applyFilters = () => {
        let filtered = [...productsData];

        // Filter by category
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(product => product.category === categoryFilter.value);
            // Actualizar la categoría activa para mantenerla al refrescar filtros
            appState.activeCategory = categoryFilter.value;
        } else {
            appState.activeCategory = null;
        }

        // Filter by search input
        if (productSearchInput && productSearchInput.value) {
            const searchTerm = productSearchInput.value.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by price
        if (priceFilter && priceFilter.value) {
            if (priceFilter.value === 'asc') {
                filtered.sort((a, b) => (a.isOnOffer ? a.offerPrice : a.price) - (b.isOnOffer ? b.offerPrice : b.price));
            } else if (priceFilter.value === 'desc') {
                filtered.sort((a, b) => (b.isOnOffer ? b.offerPrice : b.price) - (a.isOnOffer ? a.offerPrice : a.price));
            }
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: categoryFilter ? categoryFilter.value : null }); // Asegura que se mantenga la categoría
    };

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (productSearchInput) productSearchInput.addEventListener('input', applyFilters);

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
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });
}
