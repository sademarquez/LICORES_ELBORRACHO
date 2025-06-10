// js/continuous-carousel.js

// No es necesario importar appState o showToastNotification si solo se usa para el carrusel de marcas
// import { appState } from './main.js';
// import { showToastNotification } from './toast.js';

/**
 * Inicializa un carrusel de logos continuo.
 * Crea un efecto de desplazamiento infinito duplicando los elementos.
 * La animación se controla puramente por CSS.
 * @param {Array<Object>} itemsData - Array de objetos (ej. marcas) a mostrar, cada uno con { name, logoUrl }.
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
        console.warn(`continuous-carousel.js: No hay elementos para el carrusel continuo \"${carouselName}\".`);
        track.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay ${carouselName} disponibles.</p>`;
        return;
    }

    // Crear y añadir los elementos al track
    itemsToDisplay.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('brand-logo'); // Clase para los estilos de logo de marca
        itemDiv.innerHTML = `<img src="${item.logoUrl}" alt="${item.name} Logo" loading="lazy">`;
        track.appendChild(itemDiv);
    });

    // Duplicar los elementos para crear el efecto de bucle infinito
    // Clona los nodos directamente del DOM y los añade al final.
    const originalContent = track.innerHTML;
    track.innerHTML += originalContent; // Duplicar el contenido

    // Calcular el ancho del contenido original para la animación
    // Se necesita un pequeño retraso para que el navegador renderice los elementos
    // y podamos obtener su ancho real.
    setTimeout(() => {
        const firstItem = track.querySelector('.brand-logo');
        let originalContentWidth = 0;

        if (firstItem) {
            // Sumar el ancho de cada elemento original para obtener el ancho total que debe desplazarse
            // Es importante que los elementos no tengan 'flex-grow' ni 'width: 100%' en el track.
            // Los elementos deben ser `display: inline-block;` o `flex-shrink: 0;` con un ancho definido.
            const allItems = track.querySelectorAll('.brand-logo');
            for (let i = 0; i < itemsToDisplay.length; i++) { // Solo iterar sobre los originales
                const item = allItems[i];
                originalContentWidth += item.offsetWidth; // Ancho del elemento incluyendo padding/border
                const style = window.getComputedStyle(item);
                originalContentWidth += parseFloat(style.marginLeft) + parseFloat(style.marginRight); // Sumar márgenes
            }

            // Fallback si por alguna razón el cálculo es 0 (ej. elementos no visibles o sin ancho)
            if (originalContentWidth === 0 && itemsToDisplay.length > 0) {
                // Si el ancho sigue siendo 0, intentamos una aproximación o un valor fijo
                // (ej. 100px por logo + 20px de margen)
                originalContentWidth = itemsToDisplay.length * (firstItem.offsetWidth + 20); // Asumiendo un ancho promedio
            }

            // Si el totalWidth es 0, no se puede animar
            if (originalContentWidth === 0) {
                console.warn('continuous-carousel.js: El ancho calculado de los logos es cero, no se aplicará la animación continua.');
                return;
            }
            
            // Ajustar la velocidad basada en la cantidad de elementos y su ancho
            // Velocidad: ej. 80px/segundo. Duración = Ancho_a_desplazar / velocidad_en_px_por_segundo
            const scrollSpeedPxPerSecond = 80; // Ajusta este valor para cambiar la velocidad (más alto = más rápido)
            const duration = originalContentWidth / scrollSpeedPxPerSecond; // Duración para un solo ciclo de desplazamiento

            // Establecer la variable CSS para la duración de la animación
            // Esto permite que la animación CSS 'scroll-left' se ajuste dinámicamente.
            track.style.setProperty('--scroll-duration', `${duration}s`);
            
            // Asegurarse de que la animación se aplique
            track.style.animation = `scroll-left var(--scroll-duration) linear infinite`;

            console.log(`continuous-carousel.js: Carrusel continuo inicializado para ${trackId} con ${itemsToDisplay.length} elementos originales.`);
            console.log(`Ancho total calculado para un ciclo de animación: ${originalContentWidth}px. Duración: ${duration}s.`);

        } else {
            console.warn('continuous-carousel.js: No se encontraron elementos de marca para calcular el ancho.');
            track.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No se pudieron cargar los logos de marcas.</p>`;
        }

    }, 100); // Pequeño retraso para que el navegador calcule los anchos
}
