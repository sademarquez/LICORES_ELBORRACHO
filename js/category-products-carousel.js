// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProducts } from './products.js'; // Reutilizamos renderProducts

let carousels = {}; // Objeto para almacenar instancias de carruseles por su ID de contenedor

/**
 * Inicializa un carrusel de productos de categoría con navegación.
 * @param {Array<Object>} productsData - Los productos a mostrar en este carrusel.
 * @param {string} containerSelector - El selector CSS del contenedor principal del carrusel (ej: '#newProductsCarousel').
 * @param {Object} options - Opciones de configuración para el carrusel.
 * @param {number} options.itemsPerView - Cuántos items se deben ver simultáneamente en una 'página' del carrusel. Por defecto 1.
 */
export function setupCategoryProductCarousel(productsData, containerSelector, options = { itemsPerView: 1 }) {
    const carouselContainer = document.querySelector(containerSelector);
    if (!carouselContainer) {
        console.error(`category-products-carousel.js: Contenedor del carrusel de categorías no encontrado: ${containerSelector}`);
        return;
    }

    const carouselTrack = carouselContainer.querySelector('.carousel-track-category');
    const prevBtn = carouselContainer.querySelector('.category-prev-btn');
    const nextBtn = carouselContainer.querySelector('.category-next-btn');

    if (!carouselTrack || !prevBtn || !nextBtn) {
        console.warn(`category-products-carousel.js: Elementos del carrusel de categoría (track/botones) no encontrados para ${containerSelector}.`);
        return;
    }

    // Almacenar o actualizar la instancia del carrusel
    carousels[containerSelector] = {
        products: productsData,
        track: carouselTrack,
        prevBtn: prevBtn,
        nextBtn: nextBtn,
        currentScrollPosition: 0,
        itemsPerView: options.itemsPerView || 1, // Default a 1 si no se especifica
        // Handler de scroll para actualizar botones
        scrollHandler: () => updateNavigationButtons(containerSelector)
    };

    // Renderizar los productos inicialmente
    // Nota: renderProducts ya filtra si se le pasa una opción de categoría
    // Aquí, simplemente le pasamos los productos que ya deben estar filtrados para este carrusel.
    renderProducts(productsData, `#${carouselTrack.id}`);

    // Limpiar event listeners previos para evitar duplicados si se llama varias veces
    prevBtn.removeEventListener('click', carousels[containerSelector].prevHandler);
    nextBtn.removeEventListener('click', carousels[containerSelector].nextHandler);
    carouselTrack.removeEventListener('scroll', carousels[containerSelector].scrollHandler);


    // Añadir event listeners para los botones de navegación
    carousels[containerSelector].prevHandler = () => scrollCarousel(containerSelector, -1);
    carousels[containerSelector].nextHandler = () => scrollCarousel(containerSelector, 1);

    prevBtn.addEventListener('click', carousels[containerSelector].prevHandler);
    nextBtn.addEventListener('click', carousels[containerSelector].nextHandler);

    // Añadir listener para actualizar la visibilidad de los botones al hacer scroll manual
    carouselTrack.addEventListener('scroll', carousels[containerSelector].scrollHandler);

    // Resetear posición de scroll y actualizar botones al iniciar/re-inicializar
    carouselTrack.scrollTo({ left: 0, behavior: 'instant' });
    carousels[containerSelector].currentScrollPosition = 0;
    updateNavigationButtons(containerSelector);

    console.log(`category-products-carousel.js: Carrusel para ${containerSelector} inicializado con ${productsData.length} productos. Items por vista: ${options.itemsPerView}`);
}

/**
 * Desplaza el carrusel de productos de categoría.
 * @param {string} containerSelector - El selector CSS del contenedor principal del carrusel.
 * @param {number} direction - -1 para izquierda, 1 para derecha.
 */
function scrollCarousel(containerSelector, direction) {
    const carouselInstance = carousels[containerSelector];
    if (!carouselInstance) return;

    const { track, itemsPerView } = carouselInstance;

    // Obtener el ancho de un solo item (tarjeta de producto)
    const item = track.querySelector('.product-card');
    if (!item) {
        console.warn('category-products-carousel.js: No se encontraron tarjetas de producto en el carrusel para calcular el desplazamiento.');
        return;
    }
    const itemWidth = item.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    // Calcular el monto de desplazamiento basado en itemsPerView
    const scrollAmount = (itemWidth + gap) * itemsPerView;

    if (direction === 1) { // Siguiente
        carouselInstance.currentScrollPosition = Math.min(
            carouselInstance.currentScrollPosition + scrollAmount,
            track.scrollWidth - track.offsetWidth
        );
    } else { // Anterior
        carouselInstance.currentScrollPosition = Math.max(
            carouselInstance.currentScrollPosition - scrollAmount,
            0
        );
    }

    track.scrollTo({
        left: carouselInstance.currentScrollPosition,
        behavior: 'smooth'
    });

    updateNavigationButtons(containerSelector); // Actualizar botones después del scroll
}

/**
 * Actualiza la visibilidad de los botones de navegación de un carrusel específico.
 * @param {string} containerSelector - El selector CSS del contenedor principal del carrusel.
 */
function updateNavigationButtons(containerSelector) {
    const carouselInstance = carousels[containerSelector];
    if (!carouselInstance) return;

    const { track, prevBtn, nextBtn } = carouselInstance;

    if (!track || !prevBtn || !nextBtn) return;

    // Ocultar el botón "Anterior" si está al inicio
    prevBtn.style.display = track.scrollLeft > 5 ? 'flex' : 'none'; // Pequeño margen para la detección

    // Ocultar el botón "Siguiente" si está al final
    // Se considera que está al final si el scrollLeft + offsetWidth es mayor o igual al scrollWidth
    // Se añade un pequeño margen de error (ej: 5px) para evitar problemas de redondeo
    nextBtn.style.display = (track.scrollLeft + track.offsetWidth + 5) < track.scrollWidth ? 'flex' : 'none';
}
