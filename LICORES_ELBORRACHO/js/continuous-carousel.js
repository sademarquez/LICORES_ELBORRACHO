// js/continuous-carousel.js

import { renderProductCard } from './products.js';

/**
 * Inicializa un carrusel de desplazamiento continuo.
 * @param {Array<Object>} itemsData - Datos para mostrar (productos o marcas).
 * @param {string} trackId - ID del elemento track del carrusel.
 * @param {string} type - 'products' o 'brands' para el renderizado.
 * @param {string} carouselName - Nombre para logs.
 */
export function initContinuousCarousel(itemsData, trackId, type, carouselName = 'Carrusel') {
    const track = document.getElementById(trackId);
    if (!track) return console.error(`Track de carrusel no encontrado: #${trackId}`);

    track.innerHTML = '';
    if (itemsData.length === 0) {
        track.innerHTML = `<p class="w-full text-center text-text-color-light">No hay ${carouselName.toLowerCase()} para mostrar.</p>`;
        return;
    }

    // Duplicar elementos para un bucle infinito y suave
    const allItems = [...itemsData, ...itemsData];
    const fragment = document.createDocumentFragment();

    allItems.forEach(item => {
        let element;
        if (type === 'products') {
            element = renderProductCard(item);
        } else if (type === 'brands') {
            element = document.createElement('div');
            element.classList.add('brand-logo');
            element.innerHTML = `<img src="${item.logoUrl}" alt="${item.name}" loading="lazy">`;
        }
        if (element) {
            fragment.appendChild(element);
        }
    });

    track.appendChild(fragment);

    // Calcular duración de la animación basada en el ancho del contenido
    setTimeout(() => {
        const originalContentWidth = Array.from(track.children)
            .slice(0, itemsData.length)
            .reduce((total, el) => total + el.offsetWidth, 0);

        if (originalContentWidth > 0) {
            const scrollSpeedPxPerSecond = 50; // Velocidad de desplazamiento
            const duration = originalContentWidth / scrollSpeedPxPerSecond;
            track.style.setProperty('--scroll-duration', `${duration}s`);
            
            const animationName = type === 'brands' ? 'scroll-left-brands' : 'scroll-left';
            track.style.animation = `${animationName} var(--scroll-duration) linear infinite`;
        }
    }, 100);
}
