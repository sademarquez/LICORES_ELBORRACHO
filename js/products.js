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

    let filteredProducts = [...productsToRender]; // Copia para no modificar el original

    // Aplicar filtros basados en las opciones
    if (options.isNew !== undefined) { // Usar undefined para verificar si la opción existe
        filteredProducts = filteredProducts.filter(p => p.isNew === options.isNew);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }
    if (options.category) { // Filtrar por categoría si se especifica
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
        productCard.dataset.id = product.id; // Almacena el ID del producto en el dataset

        const displayPrice = product.isOnOffer && product.offerPrice !== null ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer && product.offerPrice !== null ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const badgeHtml = product.isOnOffer ? `<span class="badge">Oferta</span>` : (product.isNew ? `<span class="badge new-badge">Nuevo</span>` : '');

        productCard.innerHTML = `
            ${badgeHtml}
            <img src="${product.imageUrl}" alt="${product.name}">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price-container">
                    <span class="price">$${displayPrice.toLocaleString('es-CO')}</span>
                    ${oldPriceHtml}
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Añadir ${product.name} al carrito">Añadir al Carrito</button>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners a los botones de añadir al carrito después de renderizar
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                showToastNotification('Producto no encontrado.', 'error');
            }
        });
    });
}

export function renderBrands(brandsToRender) {
    const brandsGrid = document.getElementById('brandsGrid');
    if (!brandsGrid) {
        console.warn('Contenedor de marcas no encontrado. No se pueden renderizar las marcas.');
        return;
    }

    brandsGrid.innerHTML = ''; // Limpiar el contenedor

    if (brandsToRender.length === 0) {
        brandsGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay marcas disponibles en este momento.</p>`;
        return;
    }

    brandsToRender.forEach(brand => {
        const brandItem = document.createElement('div');
        brandItem.classList.add('brand-item');
        brandItem.innerHTML = `
            <img src="${brand.logoUrl}" alt="Logo de ${brand.name}">
        `;
        brandsGrid.appendChild(brandItem);
    });
    console.log('Marcas renderizadas con éxito.');
}


export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro de productos no encontrados. Los filtros no funcionarán.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    const brands = [...new Set(productsData.filter(p => p.category === 'Licor').map(p => p.brand))].sort();
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
            filtered.sort((a, b) => (a.isOnOffer && a.offerPrice !== null ? a.offerPrice : a.price) - (b.isOnOffer && b.offerPrice !== null ? b.offerPrice : b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.isOnOffer && b.offerPrice !== null ? b.offerPrice : b.price) - (a.isOnOffer && a.offerPrice !== null ? a.offerPrice : a.price));
        }

        renderProducts(filtered, '#allProductsGrid', { category: 'Licor' }); // Asegura que se filtre por categoría aquí también
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters); // 'input' es mejor que 'keypress' para búsqueda en tiempo real
    console.log('Filtros de producto configurados.');
}
