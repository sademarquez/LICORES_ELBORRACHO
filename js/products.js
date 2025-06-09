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
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const newBadge = product.isNew ? '<span class="product-badge new">Nuevo</span>' : '';
        const offerBadge = product.isOnOffer ? '<span class="product-badge offer">Oferta</span>' : '';

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
                ${newBadge}
                ${offerBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <div class="product-price">
                    ${oldPriceHtml}
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Añadir
                    </button>
                    <div class="product-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                        ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        <span>(${product.rating})</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners para los botones "Añadir al carrito"
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const product = appState.products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Función para configurar filtros para una sección de productos específica
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, searchInputSelector, targetGridSelector, categoryToFilter = null) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(searchInputSelector);

    if (!brandFilter || !priceFilter || !productSearchInput || !document.querySelector(targetGridSelector)) {
        console.warn(`setupProductFilters: Algunos elementos de filtro no encontrados para ${targetGridSelector}. La funcionalidad podría estar limitada.`);
        // Renderiza sin filtros si los elementos no se encuentran, para al menos mostrar algo
        const initialProducts = categoryToFilter
            ? allProducts.filter(p => p.category === categoryToFilter)
            : allProducts;
        renderProducts(initialProducts, targetGridSelector);
        return;
    }

    // Llenar el filtro de marcas dinámicamente si es para una categoría específica
    if (categoryToFilter) {
        const brandsInCategory = [...new Set(allProducts
            .filter(p => p.category === categoryToFilter)
            .map(p => p.brand)
        )].sort();
        
        // Limpiar opciones existentes (excepto la primera que es "Todas las Marcas")
        brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
        brandsInCategory.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    const applyFilters = () => {
        let filtered = categoryToFilter
            ? allProducts.filter(p => p.category === categoryToFilter)
            : [...allProducts]; // Si no hay categoría específica, trabaja con todos los productos

        const searchTerm = productSearchInput.value.toLowerCase().trim();
        const selectedBrand = brandFilter.value;
        const selectedOrder = priceFilter.value;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // Filtrar por marca
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // Ordenar por precio
        if (selectedOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedOrder === 'desc') {
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
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });
}
