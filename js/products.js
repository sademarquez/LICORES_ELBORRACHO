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

        const displayPrice = product.isOnOffer && product.offerPrice !== null ? product.offerPrice : product.price;
        const originalPriceHtml = product.isOnOffer && product.offerPrice !== null ? `<span class="original-price">$${product.price.toLocaleString('es-CO')}</span>` : '';

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
                ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-price">
                ${originalPriceHtml}
                <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
            </div>
            <div class="product-actions">
                <div class="quantity-control">
                    <button class="quantity-decrease-btn" data-id="${product.id}">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}" data-id="${product.id}">
                    <button class="quantity-increase-btn" data-id="${product.id}">+</button>
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Añadir
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners a los botones de cantidad y añadir al carrito
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const quantityInput = event.currentTarget.closest('.product-card').querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value, 10);
            const product = appState.products.find(p => p.id === productId);

            if (product && quantity > 0) {
                if (quantity > product.stock) {
                    showToastNotification(`No hay suficiente stock de ${product.name}. Stock disponible: ${product.stock}.`, 'warning');
                    quantityInput.value = product.stock; // Ajustar a stock máximo
                    return;
                }
                addToCart(product, quantity);
                showToastNotification(`${quantity}x ${product.name} añadido(s) al carrito.`, 'success');
            } else {
                showToastNotification('Cantidad inválida o producto no encontrado.', 'error');
            }
        });
    });

    container.querySelectorAll('.quantity-decrease-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const quantityInput = event.currentTarget.closest('.product-card').querySelector('.quantity-input');
            let currentQuantity = parseInt(quantityInput.value, 10);
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
        });
    });

    container.querySelectorAll('.quantity-increase-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const quantityInput = event.currentTarget.closest('.product-card').querySelector('.quantity-input');
            let currentQuantity = parseInt(quantityInput.value, 10);
            const productId = event.currentTarget.dataset.id;
            const product = appState.products.find(p => p.id === productId);

            if (product && currentQuantity < product.stock) {
                quantityInput.value = currentQuantity + 1;
            } else if (product && currentQuantity >= product.stock) {
                showToastNotification(`No puedes añadir más de ${product.stock} unidades de ${product.name}.`, 'warning');
            }
        });
    });

    // Validar input de cantidad para no exceder stock
    container.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (event) => {
            let value = parseInt(event.target.value, 10);
            const productId = event.target.dataset.id;
            const product = appState.products.find(p => p.id === productId);

            if (product) {
                if (isNaN(value) || value < 1) {
                    event.target.value = 1;
                } else if (value > product.stock) {
                    event.target.value = product.stock;
                    showToastNotification(`Solo hay ${product.stock} unidades de ${product.name} disponibles.`, 'warning');
                }
            }
        });
    });
}


export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, initialCategory = '') {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);
    const targetGrid = document.querySelector(targetGridSelector); // El grid donde se mostrarán los productos

    if (!brandFilter || !priceFilter || !productSearchInput || !targetGrid) {
        console.warn('products.js: Algunos elementos de filtro de productos no se encontraron. La funcionalidad de filtro podría estar limitada.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    // Usar un Set para obtener marcas únicas de los productos de la categoría inicial
    const uniqueBrands = new Set(
        allProducts
            .filter(p => initialCategory === '' || p.category === initialCategory)
            .map(p => p.brand)
    );
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>'; // Opción por defecto
    Array.from(uniqueBrands).sort().forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        let filtered = [...allProducts];

        // 1. Filtrar por categoría si se especificó una
        const categoryToFilter = targetGrid.dataset.category || initialCategory;
        if (categoryToFilter) {
            filtered = filtered.filter(product => product.category === categoryToFilter);
        }

        // 2. Filtrar por marca
        const selectedBrand = brandFilter.value;
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // 3. Filtrar por término de búsqueda
        const searchTerm = productSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // 4. Ordenar por precio
        const priceOrder = priceFilter.value;
        if (priceOrder === 'asc') {
            filtered.sort((a, b) => (a.isOnOffer ? a.offerPrice : a.price) - (b.isOnOffer ? b.offerPrice : b.price));
        } else if (priceOrder === 'desc') {
            filtered.sort((a, b) => (b.isOnOffer ? b.offerPrice : b.price) - (a.isOnOffer ? a.offerPrice : a.price));
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
