// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Reutilizamos renderProductCard para crear tarjetas

let categoryProductsCarouselContainer;
let categoryCarouselTrack;
let categoryPrevBtn;
let categoryNextBtn;

// Mantiene un registro de la posición actual del scroll para la navegación
let currentScrollPosition = 0;

/**
 * Configura un carrusel de productos específico por categoría.
 * @param {Array<Object>} productsData - Array de objetos producto a mostrar.
 * @param {string} containerSelector - Selector CSS del contenedor principal del carrusel (ej. '#licores-premium-carousel-section').
 */
export function setupCategoryProductCarousel(productsData, containerSelector) {
    categoryProductsCarouselContainer = document.querySelector(containerSelector);
    if (!categoryProductsCarouselContainer) {
        console.error(`category-products-carousel.js: Contenedor del carrusel de categorías no encontrado: ${containerSelector}`);
        return;
    }

    categoryCarouselTrack = categoryProductsCarouselContainer.querySelector('.carousel-track-category');
    categoryPrevBtn = categoryProductsCarouselContainer.querySelector('.category-prev-btn');
    categoryNextBtn = categoryProductsCarouselContainer.querySelector('.category-next-btn');

    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) {
        console.warn('category-products-carousel.js: Elementos del carrusel de categoría (track/botones) no encontrados.');
        return;
    }

    // Limpiar contenido previo
    categoryCarouselTrack.innerHTML = '';
    
    if (productsData.length === 0) {
        categoryCarouselTrack.innerHTML = `<p class="no-results-message">No hay productos en esta categoría especial.</p>`;
        categoryPrevBtn.style.display = 'none';
        categoryNextBtn.style.display = 'none';
        console.log(`category-products-carousel.js: No hay productos para el carrusel de ${containerSelector}.`);
        return;
    }

    productsData.forEach(product => {
        const productCard = renderProductCard(product); // Reutiliza la función para crear la tarjeta
        categoryCarouselTrack.appendChild(productCard);
    });

    // Event Listeners para los botones de navegación
    categoryPrevBtn.addEventListener('click', () => scrollCarousel(-1));
    categoryNextBtn.addEventListener('click', () => scrollCarousel(1));

    // Resetear posición de scroll y actualizar botones al cargar
    currentScrollPosition = 0;
    updateNavigationButtons();
    
    // Escuchar eventos de scroll en el track para actualizar los botones de navegación
    // Esto es útil si el usuario arrastra el carrusel manualmente
    categoryCarouselTrack.addEventListener('scroll', updateNavigationButtons);

    console.log(`category-products-carousel.js: Carrusel para ${containerSelector} inicializado con ${productsData.length} productos.`);
}

/**
 * Desplaza el carrusel horizontalmente.
 * @param {number} direction - -1 para izquierda (anterior), 1 para derecha (siguiente).
 */
function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    // Calcular el ancho de un ítem incluyendo el gap
    const firstProductCard = categoryCarouselTrack.querySelector('.product-card');
    if (!firstProductCard) {
        console.warn('category-products-carousel.js: No se encontraron tarjetas de producto para calcular el desplazamiento.');
        return;
    }
    const itemWidth = firstProductCard.offsetWidth; // Ancho del elemento
    const style = getComputedStyle(categoryCarouselTrack);
    const gap = parseFloat(style.gap) || 0; // Obtener el valor del gap CSS
    const scrollAmount = itemWidth + gap; // Desplazar un item a la vez

    // Calcular cuántos elementos caben visualmente en el contenedor
    const visibleItemsCount = Math.floor(categoryCarouselTrack.offsetWidth / scrollAmount);
    const actualScrollAmount = scrollAmount * Math.max(1, Math.floor(visibleItemsCount * 0.8)); // Desplazar 80% del ancho visible

    if (direction === 1) { // Siguiente
        currentScrollPosition = Math.min(
            currentScrollPosition + actualScrollAmount,
            categoryCarouselTrack.scrollWidth - categoryCarouselTrack.offsetWidth
        );
    } else { // Anterior
        currentScrollPosition = Math.max(
            currentScrollPosition - actualScrollAmount,
            0
        );
    }

    categoryCarouselTrack.scrollTo({
        left: currentScrollPosition,
        behavior: 'smooth'
    });

    updateNavigationButtons();
}

/**
 * Actualiza la visibilidad de los botones de navegación (anterior/siguiente)
 * basándose en la posición actual del scroll del carrusel.
 */
function updateNavigationButtons() {
    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) return;

    const scrollLeft = categoryCarouselTrack.scrollLeft;
    const scrollWidth = categoryCarouselTrack.scrollWidth;
    const offsetWidth = categoryCarouselTrack.offsetWidth;

    // Mostrar/ocultar botones basados en la posición de scroll
    categoryPrevBtn.style.display = scrollLeft > 0 ? 'block' : 'none';
    categoryNextBtn.style.display = (scrollLeft + offsetWidth) < scrollWidth ? 'block' : 'none';
}
