// js/product-carousel.js

import { renderProducts } from './products.js'; // Reutilizamos renderProducts

/**
 * Inicializa un carrusel de productos genérico.
 * @param {Array<Object>} productsData - Los datos de los productos a mostrar en el carrusel.
 * @param {string} trackSelector - Selector CSS del elemento que contiene las tarjetas de producto (el "track").
 * @param {string} prevBtnSelector - Selector CSS del botón de "anterior".
 * @param {string} nextBtnSelector - Selector CSS del botón de "siguiente".
 * @param {number} [productsPerPage=1] - Cuántos productos se "desplazan" por click en la navegación.
 * @param {string} [cardWidth='220px'] - Ancho de las tarjetas de producto en CSS (usado para calcular scroll).
 * @param {string} [gap='20px'] - Espaciado entre las tarjetas en CSS (usado para calcular scroll).
 */
export function initProductCarousel(productsData, trackSelector, prevBtnSelector, nextBtnSelector, productsPerPage = 1, cardWidth = '220px', gap = '20px') {
    const carouselTrack = document.querySelector(trackSelector);
    const prevBtn = document.querySelector(prevBtnSelector);
    const nextBtn = document.querySelector(nextBtnSelector);

    if (!carouselTrack || !prevBtn || !nextBtn) {
        console.warn(`product-carousel.js: Elementos del carrusel no encontrados para ${trackSelector}. Inicialización abortada.`);
        return;
    }

    // Renderizar los productos en el track del carrusel
    renderProducts(productsData, carouselTrack);

    let currentScrollPosition = 0;
    const itemWidth = parseFloat(cardWidth.replace('px', ''));
    const itemGap = parseFloat(gap.replace('px', ''));
    const scrollAmount = (itemWidth + itemGap) * productsPerPage; // Desplazar x items a la vez

    const updateNavigationButtons = () => {
        // Mostrar/ocultar botones basados en la posición de scroll
        prevBtn.style.display = carouselTrack.scrollLeft > 0 ? 'block' : 'none';
        // Ajustar el umbral para el botón 'siguiente'
        const maxScrollLeft = carouselTrack.scrollWidth - carouselTrack.clientWidth;
        nextBtn.style.display = carouselTrack.scrollLeft < maxScrollLeft ? 'block' : 'none';
    };

    const scrollCarousel = (direction) => {
        if (!carouselTrack) return;

        if (direction === 1) { // Siguiente
            currentScrollPosition = Math.min(
                carouselTrack.scrollLeft + scrollAmount,
                carouselTrack.scrollWidth - carouselTrack.clientWidth
            );
        } else { // Anterior
            currentScrollPosition = Math.max(
                carouselTrack.scrollLeft - scrollAmount,
                0
            );
        }
        carouselTrack.scrollTo({
            left: currentScrollPosition,
            behavior: 'smooth'
        });

        // Dar un pequeño tiempo para que el scroll termine antes de actualizar los botones
        setTimeout(updateNavigationButtons, 300);
    };

    prevBtn.addEventListener('click', () => scrollCarousel(-1));
    nextBtn.addEventListener('click', () => scrollCarousel(1));

    // Asegurarse de que los botones estén visibles al inicio
    // y cuando se redimensiona la ventana
    window.addEventListener('resize', updateNavigationButtons);
    // Un pequeño delay para que el renderProducts se asiente y el scrollWidth sea correcto
    setTimeout(updateNavigationButtons, 100); 

    console.log(`product-carousel.js: Carrusel inicializado para ${trackSelector}`);
}
