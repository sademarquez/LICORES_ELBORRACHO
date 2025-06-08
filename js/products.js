// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Asegúrate de importar addToCart

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
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }

    container.innerHTML = ''; // Limpiar el contenedor antes de renderizar

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

        // Determinar el mensaje y clase de stock
        let stockMessage = '';
        let stockClass = '';
        if (typeof product.stock === 'number') {
            if (product.stock === 0) {
                stockMessage = 'Agotado';
                stockClass = 'low-stock';
            } else if (product.stock <= 10) { // Umbral para bajo stock
                stockMessage = `¡Quedan solo ${product.stock} unidades!`;
                stockClass = 'low-stock';
            } else {
                stockMessage = `En stock (${product.stock} unidades)`;
            }
        } else {
            stockMessage = 'Stock no disponible';
        }


        productCard.innerHTML = `
            <div class="product-badges">
                ${product.isNew ? '<span class="badge new">Nuevo</span>' : ''}
                ${product.isOnOffer ? '<span class="badge offer">Oferta</span>' : ''}
            </div>
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <div class="product-price">
                    $${displayPrice.toLocaleString('es-CO')}
                    ${oldPriceHtml}
                </div>
                <p class="product-stock ${stockClass}">${stockMessage}</p>
                <button class="add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : '<i class="fas fa-cart-plus"></i> Añadir al Carrito'}
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners para los botones "Añadir al Carrito"
    container.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            addToCart(productId); // Llama a la función addToCart del módulo cart.js
        });
    });
}

// Función auxiliar para generar las estrellas de rating
function generateStarRating(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    return starsHtml;
}


export function setupProductFilters(allProducts) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('searchInput'); // Usar el input de búsqueda global

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro no encontrados. La funcionalidad de filtro podría estar incompleta.');
        return;
    }

    // Llenar el filtro de marcas
    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
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

        let filtered = appState.products.filter(product => {
            const matchesBrand = !selectedBrand || product.brand === selectedBrand;
            const matchesSearch = !searchTerm ||
                                  product.name.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm);
            return matchesBrand && matchesSearch;
        });

        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        renderProducts(filtered, '#allProductsGrid');
        // Desplazarse a la sección de productos filtrados si se aplica un filtro
        document.getElementById('todos-los-productos').scrollIntoView({ behavior: 'smooth' });
        
        // Mostrar toast si hay un filtro aplicado
        if (selectedBrand || selectedPriceOrder || searchTerm) {
            const filterMessages = [];
            if (selectedBrand) filterMessages.push(`Marca: ${selectedBrand}`);
            if (selectedPriceOrder === 'asc') filterMessages.push('Precio: Menor a Mayor');
            if (selectedPriceOrder === 'desc') filterMessages.push('Precio: Mayor a Menor');
            if (searchTerm) filterMessages.push(`Búsqueda: "${searchTerm}"`);
            showToastNotification(`Filtros aplicados: ${filterMessages.join(', ')}`, 'info');
        }
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    // Nota: El evento 'input' para productSearchInput se maneja en search.js y products.js,
    // Asegúrate de que no haya conflictos o duplicidad de llamadas.
    // Aquí se manejará a través del evento del input de búsqueda global.

    // Aplicar filtro inicial si hay un parámetro 'brand' en la URL
    const urlParams = new URLSearchParams(window.location.hash.substring(1)); // Buscar en el hash
    const initialBrand = urlParams.get('brand');
    if (initialBrand) {
        // Asegurarse de que la opción exista antes de intentar seleccionarla
        if (uniqueBrands.includes(initialBrand)) {
            brandFilter.value = initialBrand;
            applyFilters();
        } else {
            console.warn(`Marca inicial "${initialBrand}" no encontrada en los productos.`);
        }
    }
}

export function renderBrands(brandsData) {
    const brandsListContainer = document.getElementById('brandsList');
    if (!brandsListContainer) {
        console.error('Contenedor de marcas no encontrado.');
        return;
    }

    brandsListContainer.innerHTML = '';

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandItem = document.createElement('a');
            brandItem.href = `#celulares?brand=${encodeURIComponent(brand.name)}`; // Enlace para filtrar por marca
            brandItem.classList.add('brand-item');
            brandItem.setAttribute('aria-label', `Ver productos de la marca ${brand.name}`);
            brandItem.innerHTML = `
                <img src="${brand.logoUrl}" alt="Logo ${brand.name}">
                <span>${brand.name}</span>
            `;
            brandsListContainer.appendChild(brandItem);
        });
    } else {
        console.warn('No se encontraron datos de marcas para renderizar.');
        brandsListContainer.innerHTML = '<p style="text-align: center; width: 100%;">No hay marcas disponibles.</p>';
    }
}
