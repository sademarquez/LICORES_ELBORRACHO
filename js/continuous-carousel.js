// js/continuous-carousel.js

// Importar appState y showToastNotification desde main.js para funciones compartidas
import { appState } from './main.js';
import { showToastNotification } from './toast.js';

/**
 * Crea un elemento de tarjeta de producto. (Reutilizado de products.js)
 * NOTA: Esta función es una copia simplificada si no quieres importar el módulo completo de products.js
 * Si products.js exporta renderProductCard, es mejor importar esa.
 * Para evitar dependencias circulares directas con products.js, la mantenemos aquí.
 *
 * @param {Object} product - El objeto producto con sus detalles.
 * @returns {HTMLElement} La tarjeta de producto HTML.
 */
function createContinuousProductCard(product) {
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

    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-price-container">
                ${priceHtml}
            </div>
            <div class="product-rating">
                ${'⭐'.repeat(Math.floor(product.rating))}
                <span>(${product.rating.toFixed(1)})</span>
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" aria-label="Añadir ${product.name} al carrito">
                Añadir al Carrito
            </button>
        </div>
        ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
        ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
    `;
    return productCard;
}


/**
 * Inicializa un carrusel de productos con movimiento continuo infinito.
 * Duplica los elementos para simular un bucle continuo.
 *
 * @param {Array<Object>} productsToDisplay - Array de objetos producto a mostrar.
 * @param {string} trackId - El ID del elemento div que actuará como el track del carrusel.
 * @param {number} itemScrollDuration - La duración deseada para que un solo artículo pase (en segundos).
 */
export function initContinuousProductCarousel(productsToDisplay, trackId, itemScrollDuration = 2) {
    const track = document.getElementById(trackId);
    if (!track) {
        console.error(`continuous-carousel.js: Track del carrusel no encontrado con ID: ${trackId}`);
        return;
    }

    track.innerHTML = ''; // Limpiar contenido previo

    if (productsToDisplay.length === 0) {
        track.innerHTML = '<p class="no-results-message" style="width: 100%; text-align: center; color: var(--text-color-light);">No hay novedades ni ofertas para mostrar en este momento.</p>';
        return;
    }

    // Calcular un número adecuado de duplicaciones para asegurar el bucle fluido
    // Si tienes pocos productos, una duplicación no es suficiente para un carrusel largo.
    // Vamos a duplicar los productos suficientes veces para que el track sea lo suficientemente largo
    // para que la animación no tenga "saltos" obvios.
    const minItemsForSmoothLoop = 15; // Un número de items para asegurar que el scroll se vea continuo
    let effectiveProductsToDisplay = [...productsToDisplay];
    while (effectiveProductsToDisplay.length < minItemsForSmoothLoop && effectiveProductsToDisplay.length > 0) {
        effectiveProductsToDisplay = effectiveProductsToDisplay.concat(productsToDisplay);
    }
    // Si productsToDisplay está vacío, effectiveProductsToDisplay también lo estará y el bucle no correrá,
    // que es el comportamiento deseado.

    // Crear los elementos de las tarjetas de producto
    const productElements = effectiveProductsToDisplay.map(product => {
        return createContinuousProductCard(product); // Usar la función local
    });

    // Añadir los productos originales y sus duplicados al track
    productElements.forEach(el => track.appendChild(el));

    // Duplicar el contenido del track una vez más.
    // Esto es crucial para que la animación translateX(-50%) funcione como un loop.
    // Si el track contiene [A,B,C,D] y luego [A,B,C,D] de nuevo,
    // al desplazarse de 0% a -50% del ancho TOTAL, el último D de la primera secuencia
    // se alinea con el primer A de la segunda secuencia cuando el 50% de desplazamiento se completa.
    // Es mejor duplicar el contenido que ya está en el DOM, ya que asegura que los estilos se apliquen.
    const originalContent = track.innerHTML;
    track.innerHTML += originalContent;


    // Calcular la duración de la animación para mantener una velocidad constante
    // Esto se basa en la idea de que queremos que cada `itemScrollDuration` segundos pase un "item".
    // El 'transform: translateX(-50%)' en el CSS mueve el track el equivalente al ancho de la primera mitad del contenido.
    // Por lo tanto, necesitamos que esa primera mitad del contenido pase en la duración calculada.

    // Necesitamos el ancho de una tarjeta de producto (incluyendo su margen)
    // Se espera que todas las product-card tengan el mismo ancho y margen
    const firstProductCard = track.querySelector('.product-card');
    if (firstProductCard && productsToDisplay.length > 0) { // Asegúrate de que haya productos para calcular
        const itemWidth = firstProductCard.offsetWidth;
        const style = getComputedStyle(firstProductCard);
        const itemMarginRight = parseFloat(style.marginRight);
        const totalItemWidth = itemWidth + itemMarginRight;

        // El número de "items visibles" que componen una "vuelta" completa del carrusel antes de que se repita el contenido.
        // Esto es el número de productos originales *antes* de la duplicación.
        const numberOfOriginalItems = productsToDisplay.length;

        // La duración total de la animación será (número de items originales) * (duración por item)
        const animationDuration = numberOfOriginalItems * itemScrollDuration;

        // Establecer la duración de la animación en el CSS variable
        // Esto permite que el CSS @keyframes use un valor dinámico
        track.style.setProperty('--scroll-animation-duration', `${animationDuration}s`);
        console.log(`continuous-carousel.js: Duración de la animación calculada: ${animationDuration.toFixed(2)}s para ${numberOfOriginalItems} items.`);
    } else {
        console.warn('continuous-carousel.js: No se encontró ninguna tarjeta de producto para calcular el ancho o la duración de la animación (posiblemente no hay productos originales).');
        // Si no hay productos, la animación no se ejecutará, así que no hay problema
    }


    // Delegación de eventos para los botones "Añadir al Carrito"
    // Esto es importante porque los elementos se añaden dinámicamente y se duplican.
    track.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                // Importar addToCart de cart.js solo cuando se necesita
                import('./cart.js').then(({ addToCart }) => {
                    addToCart(productToAdd);
                    showToastNotification(`"${productToAdd.name}" añadido al carrito.`, 'success');
                }).catch(error => {
                    console.error('Error al cargar addToCart para el carrusel continuo:', error);
                    showToastNotification('Error al añadir el producto al carrito. Intenta de nuevo.', 'error');
                });
            } else {
                showToastNotification('Error: Producto no encontrado para añadir al carrito.', 'error');
            }
        }
    });

    console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${productsToDisplay.length} productos originales.`);
}
