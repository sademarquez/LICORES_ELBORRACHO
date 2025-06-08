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

    if (options.isNew) {
        filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }
    if (options.category) { // Filtrar por categoría si se especifica
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
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
        const oldPriceHtml = product.isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const offerBadge = product.isOnOffer ? `<span class="offer-badge">Oferta</span>` : '';
        const newBadge = product.isNew && !product.isOnOffer ? `<span class="new-badge">Nuevo</span>` : ''; // Si no está en oferta, muestra "Nuevo"

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                ${offerBadge}
                ${newBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    ${oldPriceHtml}
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <button class="add-to-cart-btn btn-primary" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Añadir al Carrito
                </button>
            </div>
        `;

        // Añadir evento al botón "Añadir al Carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                    showToastNotification(`${productToAdd.name} añadido al carrito.`, 'success');
                }
            });
        }

        container.appendChild(productCard);
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>'; // far para estrella vacía
    }
    return starsHtml;
}


export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');

    // *** VERIFICACIÓN CRÍTICA: Asegurarse de que los elementos existan ***
    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro de productos NO ENCONTRADOS en el DOM. Revisa sus IDs en index.html.');
        return; // Detiene la función si no se encuentran los elementos
    } else {
        console.log('Elementos de filtro de productos ENCONTRADOS.');
    }

    // Limpia opciones previas para evitar duplicados si se llama varias veces
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';

    // Recopila marcas únicas de los productos (solo licores para este filtro principal)
    const uniqueBrands = [...new Set(productsData.filter(p => p.category === 'Licor').map(product => product.brand))];
    uniqueBrands.sort(); // Ordenar alfabéticamente

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

        // Filtra solo los productos de la categoría "Licor" para esta cuadrícula principal
        let filtered = productsData.filter(product => product.category === 'Licor');

        filtered = filtered.filter(product => {
            const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm);
            return matchesBrand && matchesSearch;
        });

        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        renderProducts(filtered, '#allProductsGrid', { category: 'Licor' }); // Asegura que se filtre por categoría aquí también
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);
}

export function renderBrands(brandsData) {
    const brandsContainer = document.getElementById('brandsContainer');
    // *** VERIFICACIÓN CRÍTICA: Asegurarse de que el elemento exista ***
    if (!brandsContainer) {
        console.warn('Contenedor de logos de marcas NO ENCONTRADO en el DOM. Revisa su ID en index.html.');
        return; // Detiene la función si no se encuentra el elemento
    } else {
        console.log('Contenedor de logos de marcas ENCONTRADO.');
    }

    brandsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandElement = document.createElement('div');
            brandElement.classList.add('brand-item');
            brandElement.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
            brandsContainer.appendChild(brandElement);
        });
    } else {
        brandsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay marcas disponibles.</p>`;
    }
}
