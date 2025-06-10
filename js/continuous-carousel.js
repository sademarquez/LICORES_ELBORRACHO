// js/continuous-carousel.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Necesario para el carrusel de productos

/**
 * Inicializa un carrusel continuo (productos o logos).
 * Crea un efecto de desplazamiento infinito duplicando los elementos.
 * @param {Array<Object>} itemsData - Array de objetos (ej. productos en oferta o marcas) a mostrar.
 * @param {string} trackId - El ID del elemento del track del carrusel (ej. 'continuousProductCarouselTrack').
 * @param {string} type - 'products' o 'brands' para aplicar el renderizado y estilos correctos.
 * @param {string} carouselName - Nombre para los logs de consola.
 */
export function initContinuousCarousel(itemsData, trackId, type, carouselName = 'Carrusel Continuo') {
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
        track.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay elementos para el carrusel continuo "${carouselName}".</p>`;
        return;
    }

    // Duplicar los elementos para crear el efecto infinito
    // Se duplican al menos dos veces para asegurar un loop suave
    const fragment = document.createDocumentFragment();
    let originalElements = [];

    itemsToDisplay.forEach(item => {
        let element;
        if (type === 'products') {
            element = renderProductCard(item); // Reutiliza la función para tarjetas de producto
            element.classList.add('continuous-carousel-product-card'); // Clase específica para este carrusel
        } else if (type === 'brands') {
            element = document.createElement('div');
            element.classList.add('brand-logo');
            element.innerHTML = `<img src="${item.logoUrl}" alt="${item.name} Logo" loading="lazy">`;
        } else {
            console.warn(`Tipo de carrusel continuo desconocido: ${type}`);
            return;
        }
        fragment.appendChild(element);
        originalElements.push(element); // Guardar referencia a los elementos originales
    });

    // Añadir los elementos originales al track
    track.appendChild(fragment.cloneNode(true));
    // Duplicar y añadir los elementos nuevamente
    track.appendChild(fragment.cloneNode(true));
    
    // Calcular el ancho total del contenido original para la animación
    // Esto debe hacerse después de que los elementos estén en el DOM para obtener sus anchos reales
    setTimeout(() => {
        let originalContentWidth = 0;
        if (type === 'products') {
            // Sumar el ancho de cada tarjeta más su margen derecho
            // Suponemos que cada tarjeta tiene un ancho fijo (ej. 250px + 16px de gap)
            // Se debe usar el ancho real de los elementos calculados por el navegador
            if (originalElements.length > 0) {
                 // Acceder al primer hijo del track, que es el primer elemento original
                const firstElement = track.children[0];
                if (firstElement) {
                    const style = getComputedStyle(firstElement);
                    const width = firstElement.offsetWidth + parseFloat(style.marginRight);
                    originalContentWidth = width * itemsToDisplay.length;
                } else {
                    console.warn('continuous-carousel.js: No se encontró el primer elemento para calcular el ancho.');
                    return;
                }
            }
        } else if (type === 'brands') {
             if (originalElements.length > 0) {
                const firstElement = track.children[0];
                if (firstElement) {
                    const style = getComputedStyle(firstElement);
                    const width = firstElement.offsetWidth + parseFloat(style.marginRight); // ancho + margin-right
                    originalContentWidth = width * itemsToDisplay.length;
                } else {
                    console.warn('continuous-carousel.js: No se encontraron elementos de marca para calcular el ancho.');
                    return;
                }
            }
        } else {
            console.warn('continuous-carousel.js: No se encontraron elementos de marca para calcular el ancho.');
            return;
        }

        // Si el totalWidth es 0, no se puede animar
        if (originalContentWidth === 0) {
            console.warn('continuous-carousel.js: El ancho calculado de los logos es cero, no se aplicará la animación continua.');
            return;
        }
        
        // Ajustar la velocidad basada en la cantidad de elementos y su ancho
        // Velocidad: ej. 80px/segundo. Duración = Ancho_a_desplazar / velocidad_en_px_por_segundo
        const scrollSpeedPxPerSecond = 80; // Ajusta este valor para cambiar la velocidad
        const duration = originalContentWidth / scrollSpeedPxPerSecond; // Duración para un solo ciclo de desplazamiento

        // Establecer la variable CSS para la duración de la animación
        track.style.setProperty('--scroll-duration', `${duration}s`);
        
        // Asegurarse de que la animación se aplique
        if (type === 'brands') {
            track.style.animation = `scroll-left-brands var(--scroll-duration) linear infinite`;
        } else {
            track.style.animation = `scroll-left var(--scroll-duration) linear infinite`;
        }

    }, 100); // Pequeño retraso para que el navegador calcule los anchos
}
