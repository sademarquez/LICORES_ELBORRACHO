// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
// Importa addToCart directamente, ya que siempre es necesario cuando se renderizan productos
import { addToCart } from './cart.js';

/**
 * Crea y devuelve un elemento de tarjeta de producto HTML.
 * Se exporta para ser reutilizada por otros módulos (ej. carruseles de productos).
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto.
 */
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.dataset.id = product.id; // Para fácil acceso al ID

    let priceHtml = `<span class="product-price">$${product.price.toLocaleString('es-CO')}</span>`;
    if (product.isOnOffer && product.offerPrice !== null) {
        priceHtml = `
            <span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>
            <span class="product-offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
        `;
    }

    // Generar estrellas de rating
    let ratingStars = '';
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
        ratingStars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        ratingStars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < (5 - Math.ceil(product.rating)); i++) {
        ratingStars += '<i class="far fa-star"></i>'; // Estrellas vacías
    }

    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <div class="product-rating">
                ${ratingStars} (${product.rating})
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Añadir al carrito
            </button>
        </div>
    `;

    // Event listener para el botón "Añadir al carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            showToastNotification(`"${product.name}" añadido al carrito.`, 'success');
        });
    }

    return productCard;
}

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsData - Array de objetos producto a renderizar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 */
export function renderProducts(productsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`products.js: Contenedor de productos no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (productsData.length === 0) {
        container.innerHTML = `<p class="no-results-message">No se encontraron productos que coincidan con la búsqueda.</p>`;
        return;
    }

    productsData.forEach(product => {
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
    });
    console.log(`products.js: ${productsData.length} productos renderizados en ${containerSelector}.`);
}

/**
 * Configura los filtros de productos para una sección específica.
 * @param {string} containerId - El ID del contenedor principal de la sección de productos (ej. '#productGrid').
 * @param {Array<Object>} allProducts - Todos los productos disponibles para filtrar.
 */
export function setupProductFilters(containerId, allProducts) {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const priceValueSpan = document.getElementById('priceValue');
    const productGrid = document.querySelector(containerId); // Usar el ID del contenedor para renderizar

    if (!categoryFilter || !priceFilter || !priceValueSpan || !productGrid) {
        console.warn(`products.js: Elementos de filtro o contenedor de productos no encontrados para ${containerId}. Los filtros no funcionarán.`);
        return;
    }

    // Inicializar el valor del rango de precio y su visualización
    priceValueSpan.textContent = `$${parseInt(priceFilter.value).toLocaleString('es-CO')}`;

    priceFilter.addEventListener('input', () => {
        priceValueSpan.textContent = `$${parseInt(priceFilter.value).toLocaleString('es-CO')}`;
        applyFilters();
    });

    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceFilter.value);

        let filteredProducts = allProducts.filter(product => {
            const productPrice = product.isOnOffer && product.offerPrice !== null ? product.offerPrice : product.price;

            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesPrice = productPrice <= maxPrice;

            return matchesCategory && matchesPrice;
        });

        // Vuelve a renderizar el grid con los productos filtrados
        renderProducts(filteredProducts, containerId);
    }

    // Event listeners para los cambios de filtro
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
    console.log(`products.js: Filtros configurados para la sección ${containerId}.`);
}
