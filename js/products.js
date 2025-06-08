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
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price-info">
                ${oldPriceHtml}
                <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Agregar al Carrito
            </button>
        `;

        // Event listener para el botón "Agregar al Carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                    showToastNotification(`${productToAdd.name} agregado al carrito`, 'success');
                } else {
                    showToastNotification('Error al agregar producto', 'error');
                }
            });
        }

        container.appendChild(productCard);
    });
}

// Función para cargar las marcas y renderizarlas
export function renderBrands(brandsData) {
    const brandsListContainer = document.getElementById('brandsList');
    if (!brandsListContainer) return;

    brandsListContainer.innerHTML = '';

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandItem = document.createElement('a');
            // Cambiar el enlace para que filtre por la categoría de licores con la marca
            brandItem.href = `#licores?brand=${encodeURIComponent(brand.name)}`;
            brandItem.classList.add('brand-item');
            brandItem.innerHTML = `
                <img src="${brand.logoUrl}" alt="Logo ${brand.name}">
                <span>${brand.name}</span>
            `;
            brandsListContainer.appendChild(brandItem);
        });
    } else {
        console.warn('No se encontraron datos de marcas para renderizar.');
    }
}

// Configuración de filtros de productos (solo aplica a la sección principal de licores por su ID)
export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');
    const allProductsGrid = document.getElementById('allProductsGrid'); // Asumimos que este es el contenedor principal a filtrar

    if (!brandFilter || !priceFilter || !productSearchInput || !allProductsGrid) {
        console.warn('Elementos de filtro no encontrados. Los filtros no funcionarán.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    const uniqueBrands = [...new Set(productsData.map(p => p.brand))].sort();
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
