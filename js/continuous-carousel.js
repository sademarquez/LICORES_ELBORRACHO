// js/continuous-carousel.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

/**
 * Inicializa un carrusel de logos continuo.
 * Crea un efecto de desplazamiento infinito duplicando los elementos.
 * @param {Array<Object>} itemsData - Array de objetos (ej. marcas) a mostrar.
 * @param {string} trackId - El ID del elemento del track del carrusel (ej. 'continuousCarouselTrack').
 * @param {string} carouselName - Nombre para los logs de consola.
 */
export function initContinuousProductCarousel(itemsData, trackId, carouselName = 'Carrusel Continuo') {
    const track = document.getElementById(trackId);
    if (!track) {
        console.error(`continuous-carousel.js: Track del carrusel continuo no encontrado: #${trackId}. Inicialización abortada.`);
        return;
    }

    // Limpiar contenido previo para evitar duplicados si se llama varias veces
    track.innerHTML = '';
    track.style.animation = 'none'; // Detener animación si ya existía
    track.style.transform = 'translateX(0)'; // Resetear posición

    const itemsToDisplay = itemsData;

    if (itemsToDisplay.length === 0) {
        console.warn(`continuous-carousel.js: No hay elementos para el carrusel continuo "${carouselName}".`);
        track.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay elementos para mostrar.</p>`;
        return;
    }

    // Duplicar los elementos para crear el efecto de carrusel infinito
    const originalItems = itemsToDisplay.map(item => createBrandLogoElement(item)); // Usar nueva función
    const clonedItems = itemsToDisplay.map(item => createBrandLogoElement(item));   // Usar nueva función

    originalItems.forEach(item => track.appendChild(item));
    clonedItems.forEach(item => track.appendChild(item.cloneNode(true))); // Clonar para el efecto infinito

    // Calcula la duración de la animación basada en el ancho del contenido
    // Es importante que este cálculo se haga DESPUÉS de que los elementos estén en el DOM.
    // Usamos setTimeout para dar tiempo al navegador a renderizar y calcular los anchos.
    setTimeout(() => {
        let originalContentWidth = 0;
        // Solo calcular el ancho de los elementos originales
        const children = Array.from(track.children).slice(0, itemsToDisplay.length);
        if (children.length > 0) {
            children.forEach(child => {
                originalContentWidth += child.offsetWidth;
                // Añadir el margin-right que tienen los elementos en CSS
                const style = window.getComputedStyle(child);
                originalContentWidth += parseFloat(style.marginRight);
            });
        } else {
            console.warn('continuous-carousel.js: No se encontraron elementos de marca para calcular el ancho.');
            return;
        }

        if (originalContentWidth === 0) {
            console.warn('continuous-carousel.js: El ancho calculado de los logos es cero, no se aplicará la animación continua.');
            return;
        }
        
        // Ajustar la velocidad basada en la cantidad de elementos y su ancho
        const scrollSpeedPxPerSecond = 80; // Ajusta este valor para cambiar la velocidad (ej. 50px/segundo)
        const duration = originalContentWidth / scrollSpeedPxPerSecond; // Duración para un solo ciclo de desplazamiento

        // Establecer la variable CSS para la duración de la animación
        track.style.setProperty('--scroll-duration', `${duration}s`);
        
        // Asegurarse de que la animación se aplique
        track.style.animation = `scroll-left var(--scroll-duration) linear infinite`;

    }, 100); // Pequeño retraso para que el navegador calcule los anchos

    // console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${itemsToDisplay.length} elementos originales.`); // ELIMINADO
}

/**
 * Crea un elemento HTML para un logo de marca.
 * @param {Object} brand - Objeto de marca con 'name' y 'logoUrl'.
 * @returns {HTMLElement} El elemento div que representa el logo de la marca.
 */
function createBrandLogoElement(brand) {
    const brandDiv = document.createElement('div');
    brandDiv.classList.add('brand-logo'); // Asegúrate que esta clase tiene estilos
    brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
    return brandDiv;
}
