// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProducts } from './products.js'; // Reutilizamos renderProducts

let categoryProductsCarouselContainer;
let categoryCarouselTrack;
let categoryPrevBtn;
let categoryNextBtn;

// Mantiene un registro de la posición actual del scroll para la navegación
let currentScrollPosition = 0;
const scrollStep = 0; // Se calculará dinámicamente

export function setupCategoryProductCarousel(productsData, containerSelector) {
    categoryProductsCarouselContainer = document.querySelector(containerSelector);
    if (!categoryProductsCarouselContainer) {
        console.error('category-products-carousel.js: Contenedor del carrusel de categorías no encontrado.');
        return;
    }

    categoryCarouselTrack = categoryProductsCarouselContainer.querySelector('.carousel-track-category');
    categoryPrevBtn = categoryProductsCarouselContainer.querySelector('.category-prev-btn');
    categoryNextBtn = categoryProductsCarouselContainer.querySelector('.category-next-btn');

    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) {
        console.warn('category-products-carousel.js: Elementos del carrusel de categoría (track/botones) no encontrados.');
        return;
    }

    categoryPrevBtn.addEventListener('click', () => scrollCarousel(-1));
    categoryNextBtn.addEventListener('click', () => scrollCarousel(1));

    // Listen for scroll events to potentially update navigation visibility
    categoryCarouselTrack.addEventListener('scroll', updateNavigationButtons);

    console.log('category-products-carousel.js: Carrusel de productos por categoría configurado.');
}


export function loadCategoryProducts(categoryName) {
    if (!appState.products || appState.products.length === 0) {
        console.warn('category-products-carousel.js: No hay productos cargados en appState para filtrar por categoría.');
        return;
    }

    const filteredProducts = appState.products.filter(product =>
        product.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Reutilizar la función renderProducts del módulo products.js para el track del carrusel
    renderProducts(filteredProducts, '.category-products-carousel .carousel-track-category');

    // Resetear la posición del scroll y actualizar botones al cargar nueva categoría
    categoryCarouselTrack.scrollLeft = 0;
    currentScrollPosition = 0;
    updateNavigationButtons();
    console.log(`category-products-carousel.js: Productos de la categoría "${categoryName}" cargados y renderizados.`);
}

function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    const itemWidth = categoryCarouselTrack.querySelector('.product-card')?.offsetWidth || 0;
    const gap = parseFloat(getComputedStyle(categoryCarouselTrack).gap) || 0; // Obtener el gap si existe
    const scrollAmount = (itemWidth + gap) * 2; // Desplazar 2 items a la vez (2x2 visual)

    if (direction === 1) { // Siguiente
        currentScrollPosition = Math.min(
            currentScrollPosition + scrollAmount,
            categoryCarouselTrack.scrollWidth - categoryProductsCarouselContainer.offsetWidth
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

    updateNavigationButtons();
}

function updateNavigationButtons() {
    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) return;

    // Mostrar/ocultar botones basados en la posición de scroll
    categoryPrevBtn.style.display = categoryCarouselTrack.scrollLeft > 0 ? 'block' : 'none';
    categoryNextBtn.style.display = (categoryCarouselTrack.scrollLeft + categoryCarouselTrack.offsetWidth) < categoryCarouselTrack.scrollWidth ? 'block' : 'none';
}
