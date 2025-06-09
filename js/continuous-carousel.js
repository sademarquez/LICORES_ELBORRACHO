// js/continuous-carousel.js

// Importar renderProductCard desde products.js para evitar redundancia
import { renderProductCard } from './products.js';
// Importar directamente addToCart ya que es una función central
import { addToCart } from './cart.js';
import { showToastNotification } from './toast.js'; // Importar showToastNotification
import { appState } from './main.js'; // Necesario para acceder a appState.products


/**
 * Inicializa un carrusel de productos con desplazamiento continuo (infinito).
 * Duplica los productos para crear el efecto de bucle.
 * @param {Array<Object>} products - El array de productos a mostrar en el carrusel.
 * @param {string} trackId - El ID del elemento que actúa como 'track' del carrusel.
 */
export function initContinuousProductCarousel(products, trackId) {
    const track = document.getElementById(trackId);
    if (!track) {
        console.error(`continuous-carousel.js: Track del carrusel continuo no encontrado: #${trackId}`);
        return;
    }

    track.innerHTML = ''; // Limpiar contenido existente

    if (products.length === 0) {
        track.innerHTML = `<p style="text-align: center; width: 100%; padding: var(--spacing-md);">No hay productos para el carrusel continuo.</p>`;
        return;
    }

    // Clonar los productos para el efecto de bucle.
    // Esto asegura que haya suficientes elementos para que la animación se vea continua.
    const productsToDisplay = [...products, ...products]; // Duplicamos para un ciclo perfecto

    productsToDisplay.forEach(product => {
        // Usar la función estandarizada de products.js
        const productCard = renderProductCard(product);
        // Remover el event listener añadido por renderProductCard para manejarlo con delegación aquí
        const originalAddToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (originalAddToCartBtn) {
            originalAddToCartBtn.replaceWith(originalAddToCartBtn.cloneNode(true)); // Eliminar el listener original
        }
        track.appendChild(productCard);
    });

    // Calcular la duración de la animación basada en el número de productos
    // Esto es heurístico y puede requerir ajuste fino con CSS.
    // Asumiendo que el ancho de una tarjeta es ~200px + gap, y el track tiene overflow.
    // La duración debe ser proporcional al número total de elementos para que la velocidad sea constante.
    const originalProductsCount = products.length;
    if (originalProductsCount > 0) {
        // Asumiendo un ancho de tarjeta aproximado y un gap para calcular el "ancho" total a desplazar.
        // Esto es un estimado, el CSS real es el que define el ancho.
        // La animación en CSS es del 50%, así que la duración debe basarse en la mitad del track duplicado.
        const durationPerProduct = 3; // segundos por producto, ajustar para velocidad deseada
        const animationDuration = originalProductsCount * durationPerProduct; // Duración total para la mitad del track

        // Establecer la duración de la animación en una variable CSS para que CSS la pueda usar.
        track.style.setProperty('--scroll-animation-duration', `${animationDuration}s`);
    } else {
        console.warn('continuous-carousel.js: No hay productos para calcular el ancho o la duración de la animación (posiblemente no hay productos originales).');
    }


    // Delegación de eventos para los botones "Añadir al Carrito"
    // Esto es importante porque los elementos se añaden dinámicamente y se duplican.
    // Aquí el evento click se maneja para todos los botones dentro del track.
    track.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.dataset.productId;
            // Buscar el producto original en appState.products
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                // Usar la función addToCart importada directamente
                addToCart(productToAdd);
                showToastNotification(`"${productToAdd.name}" añadido al carrito.`, 'success');
            } else {
                showToastNotification('Error: Producto no encontrado para añadir al carrito.', 'error');
                console.error('continuous-carousel.js: Producto con ID', productId, 'no encontrado en appState.products.');
            }
        }
    });

    console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${products.length} productos originales.`);
}
