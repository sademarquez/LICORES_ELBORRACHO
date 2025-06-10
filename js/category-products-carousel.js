// js/continuous-carousel.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

// No es necesario importar renderProductCard aquí si solo se usan logos de marcas.
// Si se quiere un carrusel continuo de PRODUCTOS, entonces sí se usaría.
// Para este caso, solo logos de marcas.

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
        // console.warn(`continuous-carousel.js: No hay elementos para el carrusel continuo "${carouselName}".`); // ELIMINADO para producción
        track.innerHTML = `<p style="text-align: center; color: var(--text-color-light);">No hay elementos para mostrar en este carrusel.</p>`;
        return;
    }

    // Duplicar elementos para el efecto infinito
    // Esto se hace solo si hay suficientes elementos para justificar la duplicación
    const minItemsForInfiniteScroll = 5; // Un número arbitrario, ajusta si tus elementos son muy anchos/pocos
    let itemsToClone = itemsToDisplay;

    // Duplicamos los elementos varias veces para asegurar un loop suave
    // Depende del ancho de los elementos y el ancho de la ventana
    // Por simplicidad, duplicamos un número fijo de veces, o si no hay suficientes elementos
    while (itemsToClone.length < minItemsForInfiniteScroll * 2 && itemsToDisplay.length > 0) {
        itemsToClone = itemsToClone.concat(itemsToDisplay);
    }
    // Si todavía no hay suficientes después de la concatenación inicial, se puede duplicar más veces
    // para asegurar que siempre haya suficiente contenido para el scroll infinito visualmente
    if (itemsToClone.length < 20 && itemsToDisplay.length > 0) { // Duplicar hasta tener al menos 20 elementos visuales
        const timesToRepeat = Math.ceil(20 / itemsToClone.length);
        for (let i = 0; i < timesToRepeat; i++) {
            itemsToClone = itemsToClone.concat(itemsToDisplay);
        }
    }


    itemsToClone.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('continuous-carousel-item');
        // Asumiendo que `item` tiene `logoUrl` y `name`
        itemDiv.innerHTML = `<img src="${item.logoUrl}" alt="${item.name} Logo" loading="lazy">`;
        track.appendChild(itemDiv);
    });

    // Calcular el ancho total de los elementos para determinar la duración de la animación
    // Se usa setTimeout para asegurar que los elementos ya estén renderizados en el DOM
    setTimeout(() => {
        let originalContentWidth = 0;
        const firstSetOfOriginalItems = track.querySelectorAll('.continuous-carousel-item'); // Seleccionamos solo el primer conjunto original

        if (firstSetOfOriginalItems.length > 0) {
            // Sumar el ancho de los elementos y sus márgenes
            for (let i = 0; i < itemsData.length; i++) { // Solo iteramos sobre la cantidad original de itemsData
                const item = firstSetOfOriginalItems[i];
                if (item) {
                    originalContentWidth += item.offsetWidth;
                    // Añadir el valor de gap si existe entre elementos, o el margen derecho
                    // Asumiendo que el gap o margin-right es consistente (ej. 20px)
                    // Podrías obtenerlo computado si necesitas precisión:
                    // const style = window.getComputedStyle(item);
                    // originalContentWidth += parseFloat(style.marginRight);
                    // Por ahora, asumimos un valor estático de 20px de margin-right + 20px de gap por CSS
                    originalContentWidth += 2 * 20; // Aproximación: 20px de margin-left y 20px de margin-right
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
        // Velocidad: ej. 50px/segundo. Duración = Ancho_a_desplazar / velocidad_en_px_por_segundo
        const scrollSpeedPxPerSecond = 80; // Ajusta este valor para cambiar la velocidad
        const duration = originalContentWidth / scrollSpeedPxPerSecond; // Duración para un solo ciclo de desplazamiento

        // Establecer la variable CSS para la duración de la animación
        track.style.setProperty('--scroll-duration', `${duration}s`);
        
        // Asegurarse de que la animación se aplique
        track.style.animation = `scroll-left var(--scroll-duration) linear infinite`;

    }, 100); // Pequeño retraso para que el navegador calcule los anchos

    // console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${itemsToDisplay.length} elementos originales.`); // ELIMINADO para producción
}
