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
        const oldPriceHtml = product.isOnOffer ? `<span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                ${product.isNew ? '<span class="product-badge new">NUEVO</span>' : ''}
                ${product.isOnOffer ? '<span class="product-badge offer">OFERTA</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="product-current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                    ${oldPriceHtml}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Añadir al Carrito
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners a los botones "Añadir al Carrito"
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                console.error('Producto no encontrado para añadir al carrito:', productId);
            }
        });
    });
}

export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearch');

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro de productos no encontrados. Los filtros no funcionarán.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
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

// NUEVA FUNCIÓN: renderBrands (Asegúrate de que esta función exista en products.js y esté exportada)
export function renderBrands(brandsData) {
    const brandsContainer = document.getElementById('brandsGrid');
    if (!brandsContainer) {
        console.warn('Contenedor de marcas no encontrado (#brandsGrid). Las marcas no se renderizarán.');
        return;
    }

    brandsContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandItem = document.createElement('div');
            brandItem.classList.add('brand-item');
            brandItem.innerHTML = `
                <img src="${brand.logoUrl}" alt="${brand.name} Logo" class="brand-logo">
                <p class="brand-name">${brand.name}</p>
            `;
            brandsContainer.appendChild(brandItem);
        });
    } else {
        brandsContainer.innerHTML = `<p class="text-center">No hay marcas disponibles.</p>`;
    }
}
