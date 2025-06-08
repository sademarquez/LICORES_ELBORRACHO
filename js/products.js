// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

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
    // MODIFICADO: Para aceptar una sola categoría o un array de categorías
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    } else if (options.categories && Array.isArray(options.categories)) {
        filteredProducts = filteredProducts.filter(p => options.categories.includes(p.category));
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
                <p>${product.description}</p>
                <div class="product-price">
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                    ${oldPriceHtml}
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        `;
        container.appendChild(productCard);

        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const productId = addToCartBtn.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addProductToCart(productToAdd);
                }
            });
        }
    });
}

// Función para añadir productos al carrito (debería estar en cart.js pero la duplicamos aquí por simplicidad del ejemplo si no está conectada)
// IMPORTANTE: Asegúrate de que esta función exista y se importe correctamente si ya la tienes en cart.js
// En este caso, ya se importa appState, así que debería ser manejado por cart.js
import { addProductToCart } from './cart.js'; // Asegúrate de que cart.js exporte esta función

export function setupProductFilters(allProducts) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');
    const licoresGrid = document.getElementById('licoresGrid'); // Asegúrate que el ID sea correcto para la sección principal de licores

    if (!brandFilter || !priceFilter || !productSearchInput || !licoresGrid) {
        console.warn('Elementos de filtro o contenedor de licores no encontrados. Los filtros no funcionarán.');
        return;
    }

    // Llenar el filtro de marcas
    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
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

        // MODIFICADO: Filtrar solo productos de la categoría 'Licores' para esta sección de filtros
        let filtered = allProducts.filter(product => {
            const isLiquor = product.category === 'Licores'; // Asegura que solo se filtren licores aquí
            if (!isLiquor) return false; // Excluye otros productos de este filtro

            const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm);
            return matchesBrand && matchesSearch;
        });


        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        renderProducts(filtered, '#licoresGrid', { category: 'Licores' }); // Vuelve a renderizar solo licores
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);
}

export function renderBrands(brandsData) {
    const brandsListContainer = document.getElementById('brandsList');
    if (!brandsListContainer) return;

    brandsListContainer.innerHTML = '';

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandItem = document.createElement('a');
            // MODIFICADO: Enlace de marca para filtrar por categoría 'Licores' y marca
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
