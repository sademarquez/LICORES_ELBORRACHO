// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProductsCard } from './products.js'; // Renombrada para claridad

let categoryProductsCarouselContainer;
let categoryCarouselTrack;
let categoryPrevBtn;
let categoryNextBtn;
let currentScrollPosition = 0; // Mantiene la posición del scroll para la navegación

export function setupCategoryProductCarousel() {
    categoryProductsCarouselContainer = document.getElementById('categoryProductsCarousel');
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

    // Inicializar listeners para las categorías
    const categoryFilterList = document.getElementById('categoryFilterList');
    if (categoryFilterList) {
        categoryFilterList.addEventListener('click', (event) => {
            const target = event.target.closest('.category-item');
            if (target && target.dataset.category) {
                // Eliminar clase 'active' de todos los items
                categoryFilterList.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Añadir clase 'active' al item clicado
                target.classList.add('active');

                const selectedCategory = target.dataset.category;
                displayProductsByCategory(selectedCategory);
            }
        });
    }

    // Mostrar todos los productos por defecto al cargar
    displayProductsByCategory('Todos');
    console.log('category-products-carousel.js: Módulo de carrusel de categorías configurado.');
}

/**
 * Renderiza los productos de una categoría específica en el carrusel.
 * @param {string} categoryName - El nombre de la categoría a mostrar ('Todos' para todos los productos).
 */
export function displayProductsByCategory(categoryName) {
    if (!categoryCarouselTrack) return;

    let filteredProducts = [];
    if (categoryName === 'Todos') {
        filteredProducts = appState.products;
    } else {
        filteredProducts = appState.products.filter(p => p.category === categoryName);
    }

    categoryCarouselTrack.innerHTML = ''; // Limpiar productos anteriores
    currentScrollPosition = 0; // Resetear la posición de scroll
    categoryCarouselTrack.scrollTo({ left: 0, behavior: 'smooth' }); // Volver al inicio

    if (filteredProducts.length === 0) {
        categoryCarouselTrack.innerHTML = `<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en la categoría de "${categoryName}".</p>`;
        categoryPrevBtn.style.display = 'none';
        categoryNextBtn.style.display = 'none';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = renderProductsCard(product); // Reutiliza la función para crear la tarjeta
        categoryCarouselTrack.appendChild(productCard);
    });

    // Pequeño timeout para permitir que el DOM se renderice antes de calcular el scroll
    setTimeout(() => {
        updateNavigationButtons();
    }, 100);

    console.log(`category-products-carousel.js: Productos de la categoría "${categoryName}" cargados y renderizados.`);
}

/**
 * Desplaza el carrusel de categorías.
 * @param {number} direction - 1 para siguiente, -1 para anterior.
 */
function scrollCarousel(direction) {
    if (!categoryCarouselTrack) return;

    // Calcular el ancho de un "grupo" de 2 productos (2x2)
    // Asumimos que product-card es el elemento hijo directo para calcular su ancho.
    const productCard = categoryCarouselTrack.querySelector('.product-card');
    if (!productCard) {
        console.warn('No product cards found in category carousel track for scroll calculation.');
        return;
    }
    const itemWidth = productCard.offsetWidth; // Ancho de una tarjeta
    const gap = parseFloat(getComputedStyle(categoryCarouselTrack).gap) || 0; // Obtener el gap si existe

    // Para un layout 2x2, scroll por el ancho de 1.5 productos para "pasar" el bloque central o similar.
    // O si es 2x2 horizontalmente, el scroll amount debería ser el ancho de 2 tarjetas + 2 gaps.
    // Si el CSS está haciendo grid-auto-flow: column y grid-template-rows: repeat(2, 1fr);
    // significa que cada "columna" tiene 2 productos verticalmente.
    // Entonces, para mover una "columna", necesitamos el ancho de UN producto + el gap.
    const scrollAmount = itemWidth + gap; // Desplazar una "columna" de productos

    if (direction === 1) { // Siguiente
        currentScrollPosition = Math.min(
            currentScrollPosition + scrollAmount,
            categoryCarouselTrack.scrollWidth - categoryCarouselTrack.clientWidth
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

/**
 * Actualiza la visibilidad de los botones de navegación del carrusel de categorías.
 */
function updateNavigationButtons() {
    if (!categoryCarouselTrack || !categoryPrevBtn || !categoryNextBtn) return;

    // Comprobar si el contenido es más ancho que el contenedor
    const canScrollLeft = categoryCarouselTrack.scrollLeft > 0;
    const canScrollRight = (categoryCarouselTrack.scrollLeft + categoryCarouselTrack.clientWidth) < categoryCarouselTrack.scrollWidth - 1; // -1 para tolerancia flotante

    categoryPrevBtn.style.display = canScrollLeft ? 'flex' : 'none'; // Usar flex para centrar iconos
    categoryNextBtn.style.display = canScrollRight ? 'flex' : 'none';

    // Si no hay scroll posible en ninguna dirección, ocultar ambos
    if (!canScrollLeft && !canScrollRight && categoryCarouselTrack.scrollWidth <= categoryCarouselTrack.clientWidth) {
         categoryPrevBtn.style.display = 'none';
         categoryNextBtn.style.display = 'none';
    }
}

// Escuchar cambios de tamaño de ventana para actualizar la visibilidad de los botones
window.addEventListener('resize', () => {
    // Retrasar un poco para que el layout se recalcule
    setTimeout(updateNavigationButtons, 200);
});
// También en scroll, aunque ya se maneja en scrollCarousel
categoryCarouselTrack?.addEventListener('scroll', updateNavigationButtons);
