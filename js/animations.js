import anime from 'animejs';

/**
 * Anima un elemento desde su posición inicial hasta el icono del carrito de compras.
 * @param {HTMLElement} clickedElement El elemento que disparó el evento (el botón "Agregar").
 */
export function flyToCartAnimation(clickedElement) {
    const productCard = clickedElement.closest('.product-card');
    if (!productCard) return;

    const productImage = productCard.querySelector('.product-image');
    const cartIcon = document.getElementById('cartOpenBtn');

    if (!productImage || !cartIcon) {
        console.error('No se encontró la imagen del producto o el icono del carrito.');
        return;
    }

    // 1. Clonar la imagen para la animación
    const imgClone = productImage.cloneNode(true);
    const startRect = productImage.getBoundingClientRect();

    // Estilos iniciales del clon
    imgClone.style.position = 'fixed';
    imgClone.style.left = `${startRect.left}px`;
    imgClone.style.top = `${startRect.top}px`;
    imgClone.style.width = `${startRect.width}px`;
    imgClone.style.height = `${startRect.height}px`;
    imgClone.style.objectFit = 'contain';
    imgClone.style.zIndex = '2000'; // Asegurar que esté por encima de todo
    imgClone.style.pointerEvents = 'none'; // Evitar que intercepte clics

    document.body.appendChild(imgClone);

    // 2. Calcular la posición final (el carrito)
    const endRect = cartIcon.getBoundingClientRect();
    const endX = endRect.left + (endRect.width / 2) - (startRect.width / 2);
    const endY = endRect.top + (endRect.height / 2) - (startRect.height / 2);

    // 3. Animar con anime.js
    anime({
        targets: imgClone,
        left: endX,
        top: endY,
        width: 30, // Encoger la imagen
        height: 30,
        opacity: [1, 0.5],
        rotate: '1turn', // Girar en el aire
        scale: [1, 0.1], // Escalar para dar efecto de profundidad
        duration: 800,
        easing: 'easeInOutSine',
        complete: () => {
            // 4. Limpiar y dar feedback en el carrito
            imgClone.remove();
            
            // Animar el carrito para que "reciba" el producto
            anime({
                targets: cartIcon,
                scale: [1, 1.25, 1], // Efecto de rebote
                duration: 300,
                easing: 'easeOutElastic(1, .6)'
            });
        }
    });
}
