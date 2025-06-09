// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProducts } from './products.js'; // Reutilizamos renderProducts

let categoryProductsCarouselContainer;
let categoryCarouselTrack;
let categoryPrevBtn;
let categoryNextBtn;

// Mantiene un registro de la posición actual del scroll para la navegación
let currentScrollPosition = 0;

/**
 * Configura un carrusel de productos por categoría en un contenedor específico.
 * @param {Array<Object>} productsData - Array de productos a mostrar en este carrusel.
 * @param {string} containerSelector - Selector CSS del contenedor principal del carrusel.
 * @param {string} categoryName - Opcional, nombre de la categoría para filtrar.
 */
export function setupCategoryProductCarousel(productsData, containerSelector, categoryName = null) {
    categoryProductsCarouselContainer = document.querySelector(containerSelector);
    if (!categoryProductsCarouselContainer) {
        console.warn(`category-products-carousel.js: Contenedor del carrusel de categorías no encontrado para "${containerSelector}".`);
        return;
    }

    categoryCarouselTrack = categoryProductsCarouselContainer.querySelector('.carousel-track-category');
    categoryPrevBtn = categoryProductsCarouselContainer.querySelector('.category-prev-btn');
    categoryNextBtn = categoryProductsCarouselContainer.querySelector('.category-next-btn');

    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) {
        console.warn('category-products-carousel.js: Elementos del carrusel de categoría (track/botones) no encontrados en el contenedor. La funcionalidad podría estar limitada.');
        return;
    }

    // Limpiar event listeners previos para evitar duplicados si se llama varias veces
    const newPrevBtn = categoryPrevBtn.cloneNode(true);
    const newNextBtn = categoryNextBtn.cloneNode(true);
    categoryPrevBtn.parentNode.replaceChild(newPrevBtn, categoryPrevBtn);
    categoryNextBtn.parentNode.replaceChild(newNextBtn, categoryNextBtn);
    categoryPrevBtn = newPrevBtn;
    categoryNextBtn = newNextBtn;

    categoryPrevBtn.addEventListener('click', () => scrollCarousel(-1));
    categoryNextBtn.addEventListener('click', () => scrollCarousel(1));

    // Filtrar productos si se especifica una categoría
    const productsToDisplay = categoryName
        ? productsData.filter(p => p.category === categoryName)
        : productsData;

    // Renderizar los productos en el track del carrusel.
    // Usamos renderProducts pero directamente en el track, sin el grid por defecto.
    renderProducts(productsToDisplay, categoryCarouselTrack, {
        isCarousel: true // Una opción para que renderProducts sepa que está en un carrusel
    });

    // Resetear posición de scroll y actualizar botones
    currentScrollPosition = 0;
    categoryCarouselTrack.scrollTo({ left: currentScrollPosition, behavior: 'auto' });
    updateNavigationButtons();

    // Escuchar eventos de scroll en el track para actualizar la visibilidad de los botones
    categoryCarouselTrack.addEventListener('scroll', updateNavigationButtons);

    console.log(`category-products-carousel.js: Carrusel para "${categoryName || 'Todos'}" configurado en "${containerSelector}".`);
}

function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    // Calcular el ancho de un ítem y el gap entre ítems
    const productCard = categoryCarouselTrack.querySelector('.product-card');
    if (!productCard) {
        console.warn('category-products-carousel.js: No se encontraron product-cards en el carrusel para calcular el scroll.');
        return;
    }

    const itemWidth = productCard.offsetWidth;
    const computedStyle = getComputedStyle(categoryCarouselTrack);
    // Asumiendo que el gap se define en el CSS como 'gap' o 'grid-gap'
    const gap = parseFloat(computedStyle.gap || computedStyle.gridGap) || 0;

    // Calcular el ancho de scroll basado en el número de ítems visibles o un valor fijo.
    // Por ejemplo, desplazar 2 ítems a la vez o el 80% del ancho del contenedor.
    const scrollAmount = (itemWidth + gap) * 2; // Desplazar 2 items a la vez

    if (direction === 1) { // Siguiente
        currentScrollPosition = Math.min(
            currentScrollPosition + scrollAmount,
            categoryCarouselTrack.scrollWidth - categoryCarouselTrack.offsetWidth
        );
    } else { // Anterior
        currentScrollPosition = Math.max(
            currentScrollPosition - scrollAmount,
            0
        );
    }

    categoryCarouselTrack.scrollTo({
        left: currentScrollPosition,
        behavior: 'smooth'
    });

    // La actualización de botones se manejará por el evento 'scroll' del track
}

function updateNavigationButtons() {
    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) return;

    const { scrollLeft, scrollWidth, offsetWidth } = categoryCarouselTrack;

    // Mostrar/ocultar botones basados en la posición de scroll
    categoryPrevBtn.style.display = scrollLeft > 0 ? 'block' : 'none';
    // Se considera que hay más contenido si el scrollLeft actual + el ancho visible es menor que el ancho total
    categoryNextBtn.style.display = (scrollLeft + offsetWidth + 1) < scrollWidth ? 'block' : 'none'; // +1 para margen de error
}
