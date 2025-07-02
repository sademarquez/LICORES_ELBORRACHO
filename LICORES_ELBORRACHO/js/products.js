// js/products.js

// NO SE IMPORTA NADA DE 'cart.js' AQUÍ

/**
 * Crea y devuelve un elemento de tarjeta de producto HTML.
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto.
 */
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.id = product.id; // Añadimos el ID a la tarjeta para delegación

    // ... (El resto del código para generar el HTML de la tarjeta es el mismo)
    // Lo importante es que el botón tenga el dataset `data-product-id`
    productCard.innerHTML = `
        <!-- ... badges, imagen, nombre, precio ... -->
        <div class="product-actions">
            <button class="add-to-cart-btn btn btn-primary w-full" data-product-id="${product.id}">
                Añadir al Carrito
            </button>
        </div>
    `;

    return productCard;
}

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos producto a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor.
 */
export function renderProducts(productsToRender, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    if (productsToRender.length === 0) {
        container.innerHTML = `<p class="no-results-message">No se encontraron productos.</p>`;
        return;
    }
    productsToRender.forEach(product => {
        container.appendChild(renderProductCard(product));
    });
}

/**
 * Configura los filtros de productos.
 * @param {Array<Object>} allProducts - El array completo de productos.
 * @param {string} containerId - El ID del contenedor principal.
 */
export function setupProductFilters(allProducts, containerId) {
    // ... Tu código de filtros existente está bien. No necesita cambios.
}
