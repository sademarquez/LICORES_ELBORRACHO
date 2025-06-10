// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Importa addToCart directamente

/**
 * Crea y devuelve un elemento de tarjeta de producto HTML.
 * Se exporta para ser reutilizada por otros módulos (ej. carruseles de productos, búsqueda).
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto.
 */
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card', 'reveal-on-scroll'); // Añade la clase para la animación de scroll
    productCard.dataset.id = product.id; // Para fácil acceso al ID

    let priceHtml = `<span class="product-price">$${product.price.toLocaleString('es-CO')}</span>`;
    if (product.isOnOffer && product.offerPrice !== null) {
        priceHtml = `
            <span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>
            <span class="product-offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
        `;
    }

    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <div class="product-actions">
                <button class="add-to-cart-btn btn-primary" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir
                </button>
            </div>
        </div>
    `;

    // Añadir event listener al botón de añadir al carrito
    const addToCartButton = productCard.querySelector('.add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic en el botón active otros eventos de la tarjeta
            const productId = e.currentTarget.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                showToastNotification('Producto no encontrado para añadir al carrito.', 'error');
            }
        });
    }

    return productCard;
}

/**
 * Renderiza un array de productos en un contenedor de grilla específico.
 * @param {Array<Object>} productsToRender - Los productos a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor (ej. '#allProductsGrid').
 */
export function renderProducts(productsToRender, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor de productos no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="no-results-message">No se encontraron productos que coincidan con tu búsqueda o filtros.</p>`;
        return;
    }

    productsToRender.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });

    console.log(`products.js: ${productsToRender.length} productos renderizados en ${containerSelector}.`);
}

/**
 * Configura los filtros de productos para una sección específica.
 * @param {Array<Object>} allProducts - El array completo de productos disponibles.
 * @param {string} containerId - El ID del contenedor de la grilla de productos donde se aplicarán los filtros.
 */
export function setupProductFilters(allProducts, containerId) {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter'); // Asumo que existe un filtro de precio
    const productSearchInput = document.getElementById('productSearchInput'); // Asumo que existe un input de búsqueda para la grilla

    if (!categoryFilter && !productSearchInput) {
        console.warn(`products.js: No se encontraron elementos de filtro para la sección ${containerId}. Los filtros no funcionarán.`);
        return;
    }

    // Llenar dinámicamente las opciones de categoría
    const categories = new Set(allProducts.map(p => p.category));
    categoryFilter.innerHTML = '<option value="all">Todas las Categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    /**
     * Aplica los filtros y renderiza los productos.
     */
    const applyFilters = () => {
        let filtered = [...allProducts];

        // Filtrar por categoría
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Filtrar por búsqueda de texto
        const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // Opcional: Filtrar por precio (si se implementa)
        // if (priceFilter) {
        //     const maxPrice = parseFloat(priceFilter.value);
        //     if (!isNaN(maxPrice)) {
        //         filtered = filtered.filter(product => (product.isOnOffer ? product.offerPrice : product.price) <= maxPrice);
        //     }
        // }

        renderProducts(filtered, containerId); // Renderiza los productos filtrados en el contenedor
    };

    // Añadir event listeners a los filtros
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    // if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (productSearchInput) productSearchInput.addEventListener('input', applyFilters);

    applyFilters(); // Aplica los filtros iniciales al cargar la página
    console.log(`products.js: Filtros configurados para la sección ${containerId}.`);
}

/**
 * Renderiza los logos de las marcas en un contenedor específico.
 * NOTA: Para el carrusel continuo, `initContinuousProductCarousel` es la función preferida.
 * Esta función es más útil si solo se quieren mostrar logos estáticos en una grilla.
 * @param {Array<Object>} brandsData - Array de objetos de marca.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los logos.
 */
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
    console.log(`products.js: Marcas renderizadas en ${containerSelector}.`);
}
