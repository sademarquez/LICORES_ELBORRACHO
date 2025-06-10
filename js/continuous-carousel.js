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
        // console.warn(`continuous-carousel.js: No hay elementos para el carrusel continuo "${carouselName}".`); // ELIMINADO
        track.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay elementos para mostrar en este carrusel.</p>`;
        // Ocultar la sección si no hay contenido relevante. Asume que el contenedor padre es una sección.
        track.parentElement.style.display = 'none';
        return;
    } else {
        // Mostrar la sección si hay contenido (en caso de que se haya ocultado antes)
        if (track.parentElement.style.display === 'none') {
             track.parentElement.style.display = ''; // Restaurar display por defecto
        }
    }

    // Duplicar elementos para crear el efecto de carrusel continuo
    // Calculamos cuántas veces necesitamos duplicar para que el efecto sea "infinito"
    // Esto dependerá del ancho del contenedor y el ancho de los elementos.
    // Un valor seguro es duplicar al menos lo suficiente para llenar el ancho del track un par de veces.
    // Para logos pequeños, podemos duplicar 5-10 veces.
    const duplicateCount = 5; // Cantidad de veces que se duplica el conjunto de logos

    // Crear y añadir los elementos al track
    itemsToDisplay.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('brand-logo'); // Clase específica para logos de marcas
        itemElement.innerHTML = `<img src="${item.logoUrl}" alt="${item.name} Logo" loading="lazy">`;
        track.appendChild(itemElement);
    });

    // Duplicar los elementos existentes para el efecto continuo
    for (let i = 0; i < duplicateCount; i++) {
        itemsToDisplay.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('brand-logo');
            itemElement.innerHTML = `<img src="${item.logoUrl}" alt="${item.name} Logo" loading="lazy">`;
            track.appendChild(itemElement);
        });
    }

    // Configurar la animación CSS
    setTimeout(() => {
        // Calcular el ancho de un solo conjunto de elementos originales
        // Esto se hace sumando el ancho de los primeros `itemsToDisplay.length` elementos
        let originalContentWidth = 0;
        const firstSetElements = track.querySelectorAll('.brand-logo');
        if (firstSetElements.length > 0) {
            for (let i = 0; i < itemsToDisplay.length; i++) {
                if (firstSetElements[i]) {
                    originalContentWidth += firstSetElements[i].offsetWidth;
                    // También añadir el gap si es consistente, asumimos 20px de gap por CSS
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

    // console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${itemsToDisplay.length} elementos originales.`); // ELIMINADO
}
