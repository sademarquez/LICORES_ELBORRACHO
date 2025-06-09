// js/continuous-carousel.js

/**
 * Inicializa un carrusel de productos con movimiento continuo infinito.
 * Duplica los elementos para simular un bucle continuo.
 *
 * @param {Array<Object>} productsToDisplay - Array de objetos producto a mostrar.
 * @param {string} trackId - El ID del elemento div que actuará como el track del carrusel.
 * @param {number} itemScrollDuration - La duración de la animación para cada "item" (en segundos).
 */
export function initContinuousProductCarousel(productsToDisplay, trackId, itemScrollDuration = 2) {
    const track = document.getElementById(trackId);
    if (!track) {
        console.error(`continuous-carousel.js: Track del carrusel no encontrado con ID: ${trackId}`);
        return;
    }

    track.innerHTML = ''; // Limpiar contenido previo

    if (productsToDisplay.length === 0) {
        track.innerHTML = '<p class="no-results-message">No hay productos para mostrar en este carrusel.</p>';
        return;
    }

    // Clonar los productos (para evitar modificar los originales) y prepararlos para el track
    const productElements = productsToDisplay.map(product => {
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
                    <span>(${product.rating})</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" aria-label="Añadir ${product.name} al carrito">
                    Añadir al Carrito
                </button>
            </div>
            ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
            ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
        `;
        return productCard;
    });

    // Añadir los productos originales
    productElements.forEach(el => track.appendChild(el));

    // Duplicar los productos para crear el efecto de bucle continuo
    // Duplicamos al menos una vez para que el final de la primera secuencia se conecte con el inicio de la segunda.
    // Podrías duplicar más veces si el carrusel es muy largo o los items muy pequeños.
    productElements.forEach(el => track.appendChild(el.cloneNode(true)));

    // Calcular la duración de la animación
    // Esto es un poco más complejo porque depende del ancho de los items y del track.
    // Una forma simple es estimar la cantidad de items y multiplicar por la duración deseada por item.
    // Esto hará que la velocidad sea constante, no la duración total.

    // Obtenemos el estilo computado para obtener el margin-right real
    const style = getComputedStyle(productElements[0]);
    const itemWidth = productElements[0].offsetWidth;
    const itemMarginRight = parseFloat(style.marginRight); // Obtener el margen derecho

    const totalItemWidth = itemWidth + itemMarginRight; // Ancho total de un item incluyendo su margen
    const totalContentWidth = totalItemWidth * productsToDisplay.length; // Ancho de una sola "vuelta"

    // La animación `scroll-left` se mueve un 50% del ancho del track.
    // Si duplicamos los elementos una vez, el track es el doble de ancho que `totalContentWidth`.
    // Por lo tanto, el 50% del track duplicado es `totalContentWidth`.
    // Queremos que `totalContentWidth` se desplace en `totalContentWidth / itemWidth * itemScrollDuration` segundos.
    const animationDuration = (totalContentWidth / totalItemWidth) * itemScrollDuration; // Duración total para una "vuelta" completa

    // Establecer la duración de la animación en el CSS variable (si tienes) o directamente
    track.style.setProperty('--scroll-animation-duration', `${animationDuration}s`);
    // Asegúrate de que el keyframe 'scroll-left' en tu CSS usa esta variable:
    // @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-1 * var(--scroll-animation-width, 50%))); } }
    // O si no, simplemente deja el 50% en el CSS y calcula bien el totalContentWidth para el duplicado.
    // Para el CSS actual, el 50% de `transform: translateX(-50%)` funciona si el track es el doble de ancho.

    // Para la delegación de eventos del carrito, ya que los elementos se añaden dinámicamente
    // Usamos el contenedor padre que es estático
    track.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                // Importar addToCart de cart.js
                import('./cart.js').then(({ addToCart }) => {
                    addToCart(productToAdd);
                }).catch(error => {
                    console.error('Error al cargar addToCart para el carrusel continuo:', error);
                    showToastNotification('Error al añadir el producto al carrito. Intenta de nuevo.', 'error');
                });
            } else {
                showToastNotification('Error: Producto no encontrado para añadir al carrito.', 'error');
            }
        }
    });

    console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId}. Duración de animación: ${animationDuration.toFixed(2)}s`);
}
