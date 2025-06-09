// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Reutilizamos renderProductCard para crear tarjetas

let categoryProductsCarouselContainer;
let categoryCarouselTrack;
let categoryPrevBtn;
let categoryNextBtn;

// Mantiene un registro de la posición actual del scroll para la navegación
let currentScrollPosition = 0;

// Variables para el touch-swipe
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 30; // Distancia mínima para considerar un swipe en carruseles de producto


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
        console.warn('category-products-carousel.js: Elementos del carrusel de categoría (track, botones) no encontrados. Funcionalidad limitada.');
        return;
    }

    // Limpiar contenido previo
    categoryCarouselTrack.innerHTML = '';

    if (productsData.length === 0) {
        categoryCarouselTrack.innerHTML = `<p style="text-align: center; width: 100%; padding: var(--spacing-md); color: var(--text-color-light);">No hay productos en esta categoría.</p>`;
        categoryPrevBtn.style.display = 'none';
        categoryNextBtn.style.display = 'none';
        return;
    }

    productsData.forEach(product => {
        categoryCarouselTrack.appendChild(renderProductCard(product));
    });

    // Añadir event listeners para los botones de navegación
    categoryPrevBtn.addEventListener('click', () => scrollCarousel(-1));
    categoryNextBtn.addEventListener('click', () => scrollCarousel(1));

    // Inicializar la posición del scroll
    currentScrollPosition = categoryCarouselTrack.scrollLeft;
    updateNavigationButtons(); // Ocultar/mostrar botones inicialmente

    // Event listener para actualizar los botones cuando el usuario hace scroll manual
    categoryCarouselTrack.addEventListener('scroll', updateNavigationButtons);

    // --- Manejo de Touch-Swipe para dispositivos móviles ---
    categoryCarouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    categoryCarouselTrack.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    categoryCarouselTrack.addEventListener('touchend', () => {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance < -minSwipeDistance) {
            // Swipe a la izquierda (siguiente conjunto de elementos)
            scrollCarousel(1);
        } else if (swipeDistance > minSwipeDistance) {
            // Swipe a la derecha (anterior conjunto de elementos)
            scrollCarousel(-1);
        }
    });

    console.log(`category-products-carousel.js: Carrusel de categoría configurado para ${containerSelector} con ${productsData.length} productos.`);
}

/**
 * Desplaza el carrusel de productos de categoría.
 * @param {number} direction - 1 para siguiente, -1 para anterior.
 */
function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    // Obtener el ancho de un solo elemento (tarjeta de producto) + su margen/gap
    // Asumimos que todas las tarjetas tienen el mismo ancho y gap definido en CSS
    const firstProductCard = categoryCarouselTrack.querySelector('.product-card');
    let scrollAmount = 0;

    if (firstProductCard) {
        // Obtenemos el ancho total ocupado por una tarjeta, incluyendo su margen derecho
        const cardStyle = window.getComputedStyle(firstProductCard);
        const cardWidth = firstProductCard.offsetWidth;
        const cardMarginRight = parseFloat(cardStyle.marginRight);
        scrollAmount = cardWidth + cardMarginRight;
    } else {
        // Fallback si no hay tarjetas de producto visibles
        scrollAmount = categoryCarouselTrack.offsetWidth / 2; // Desplaza media ventana
    }

    // Calcular cuántos elementos caben visualmente en el contenedor
    // Esta lógica ya es buena y se adapta al ancho visible
    const visibleItemsCount = Math.floor(categoryCarouselTrack.offsetWidth / scrollAmount);
    // Desplazar una cantidad que haga sentido, ej., un 80% del ancho visible o al menos un elemento completo
    const actualScrollAmount = scrollAmount * Math.max(1, Math.floor(visibleItemsCount * 0.8));

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
    // Asegurar que el botón "prev" se oculte solo al inicio exacto
    categoryPrevBtn.style.display = scrollLeft > 1 ? 'block' : 'none'; // Pequeña tolerancia para evitar problemas de float

    // Asegurar que el botón "next" se oculte cuando el final está muy cerca
    // Comparar con una pequeña tolerancia para evitar problemas de redondeo de píxeles
    const atEnd = (scrollLeft + offsetWidth + 1) >= scrollWidth; // +1px de tolerancia
    categoryNextBtn.style.display = atEnd ? 'none' : 'block';
}
