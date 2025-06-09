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
 * Configura un carrusel de productos para una categoría específica.
 * @param {Array<Object>} productsData - Todos los productos disponibles.
 * @param {string} containerSelector - Selector CSS del contenedor principal del carrusel (ej. '#licoresCarousel').
 * @param {string} categoryName - El nombre de la categoría a filtrar (ej. 'Licor').
 */
export function setupCategoryProductCarousel(productsData, containerSelector, categoryName) {
    categoryProductsCarouselContainer = document.querySelector(containerSelector);
    if (!categoryProductsCarouselContainer) {
        console.error(`category-products-carousel.js: Contenedor del carrusel de categorías (${containerSelector}) no encontrado.`);
        return;
    }

    categoryCarouselTrack = categoryProductsCarouselContainer.querySelector('.carousel-track-category');
    categoryPrevBtn = categoryProductsCarouselContainer.querySelector('.category-prev-btn');
    categoryNextBtn = categoryProductsCarouselContainer.querySelector('.category-next-btn');

    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) {
        console.warn(`category-products-carousel.js: Elementos del carrusel de categoría (track/botones) no encontrados para ${containerSelector}.`);
        return;
    }

    // Filtrar productos por la categoría deseada
    const filteredCategoryProducts = productsData.filter(product => product.category === categoryName);

    // Renderizar los productos filtrados en el track del carrusel
    renderProducts(filteredCategoryProducts, `${containerSelector} .carousel-track-category`);

    // Añadir event listeners solo si hay productos para desplazar
    if (filteredCategoryProducts.length > 0) {
        categoryPrevBtn.addEventListener('click', () => scrollCarousel(-1));
        categoryNextBtn.addEventListener('click', () => scrollCarousel(1));

        // Listener para actualizar la visibilidad de los botones si el usuario hace scroll manual
        categoryCarouselTrack.addEventListener('scroll', updateNavigationButtons);

        // Inicializar la posición de scroll y visibilidad de los botones
        currentScrollPosition = 0;
        updateNavigationButtons();
    } else {
        // Si no hay productos, ocultar los botones de navegación
        categoryPrevBtn.style.display = 'none';
        categoryNextBtn.style.display = 'none';
        console.log(`category-products-carousel.js: No hay productos para la categoría "${categoryName}".`);
    }

    console.log(`category-products-carousel.js: Productos de la categoría "${categoryName}" cargados y renderizados.`);
}

/**
 * Desplaza el carrusel de categorías.
 * @param {number} direction - 1 para siguiente, -1 para anterior.
 */
function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    // Calcular el ancho de un ítem más el gap para el desplazamiento
    // Se asume que todas las tarjetas de producto tienen el mismo ancho dentro de este carrusel
    const firstProductCard = categoryCarouselTrack.querySelector('.product-card');
    if (!firstProductCard) return;

    const itemWidth = firstProductCard.offsetWidth;
    const computedStyle = getComputedStyle(categoryCarouselTrack);
    // Asegurarse de que 'gap' sea un número válido, puede ser 'normal' o vacío si no se define
    const gap = parseFloat(computedStyle.gap) || 0;

    const scrollAmount = (itemWidth + gap) * 2; // Desplazar 2 items a la vez (o 1 si prefieres)

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

    updateNavigationButtons(); // Actualizar la visibilidad de los botones después del scroll
}

/**
 * Actualiza la visibilidad de los botones de navegación del carrusel de categorías.
 * Los oculta si no hay más contenido para desplazar en esa dirección.
 */
function updateNavigationButtons() {
    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) return;

    // Mostrar/ocultar botones basados en la posición de scroll
    // Usamos una pequeña tolerancia para evitar problemas de coma flotante
    const tolerance = 1;

    // Botón Anterior: Visible si el scroll no está al principio
    categoryPrevBtn.style.display = categoryCarouselTrack.scrollLeft > tolerance ? 'block' : 'none';

    // Botón Siguiente: Visible si no se ha llegado al final del scroll
    const isAtEnd = (categoryCarouselTrack.scrollLeft + categoryCarouselTrack.offsetWidth + tolerance) >= categoryCarouselTrack.scrollWidth;
    categoryNextBtn.style.display = isAtEnd ? 'none' : 'block';
}
