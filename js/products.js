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

        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-price">${oldPriceHtml} $${displayPrice.toLocaleString('es-CO')}</p>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    <span>(${product.rating})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <button class="show-details-btn">Ver Detalles</button>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir al Carrito
                </button>
            </div>
        `;

        // Event listener para mostrar/ocultar descripción
        const showDetailsBtn = productCard.querySelector('.show-details-btn');
        const description = productCard.querySelector('.product-description');

        if (showDetailsBtn && description) {
            showDetailsBtn.addEventListener('click', () => {
                description.classList.toggle('visible');
                showDetailsBtn.textContent = description.classList.contains('visible') ? 'Ocultar Detalles' : 'Ver Detalles';
            });
        }


        const addToCartButton = productCard.querySelector('.add-to-cart-btn');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                }
            });
        }
        container.appendChild(productCard);
    });
}


export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearch'); // Este es el input de búsqueda en la sección de filtros

    // Verificar si los elementos del filtro existen en la página
    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro de productos no encontrados. Los filtros no se configurarán.');
        return;
    }

    // Llenar el filtro de marcas
    const brands = [...new Set(productsData.map(product => product.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    brands.forEach(brand => {
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
            filtered.sort((a, b) => (a.isOnOffer ? a.offerPrice : a.price) - (b.isOnOffer ? b.offerPrice : b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.isOnOffer ? b.offerPrice : b.price) - (a.isOnOffer ? a.offerPrice : a.price));
        }

        renderProducts(filtered, '#allProductsGrid', { category: 'Licor' }); // Asegura que se filtre por categoría aquí también
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    console.log('Filtros de productos configurados.');
}

export function renderBrands(brandsData) {
    const brandsContainer = document.getElementById('brandLogosContainer');
    if (!brandsContainer) {
        console.warn('Contenedor de logos de marcas no encontrado.');
        return;
    }
    brandsContainer.innerHTML = ''; // Limpiar el contenedor

    brandsData.forEach(brand => {
        const img = document.createElement('img');
        img.src = brand.logoUrl;
        img.alt = `${brand.name} Logo`;
        brandsContainer.appendChild(img);
    });
    console.log('Logos de marcas renderizados.');
}
