// js/carousel.js

let carouselInstances = {}; // Almacenará múltiples instancias de carrusel

/**
 * Inicializa un carrusel específico.
 * @param {string} trackId - El ID del elemento que actúa como track del carrusel (ej: 'carouselTrack', 'brandsCarouselTrack').
 * @param {string} prevBtnId - El ID del botón de "anterior".
 * @param {string} nextBtnId - El ID del botón de "siguiente".
 * @param {string} dotsContainerId - El ID del contenedor de los puntos indicadores.
 * @param {Array<Object>} data - Un array de objetos con información para cada slide (banners o marcas).
 * @param {string} type - 'banner' o 'brand' para diferenciar el renderizado.
 * @param {number} slideDuration - Duración de cada slide en milisegundos para auto-avance.
 * @param {number} visibleSlides - Número de slides visibles a la vez (para carruseles de items como marcas).
 */
export function initCarousel(trackId, prevBtnId, nextBtnId, dotsContainerId, data, type, slideDuration = 3000, visibleSlides = 1) {
    const carouselTrack = document.getElementById(trackId);
    const carouselPrevBtn = document.getElementById(prevBtnId);
    const carouselNextBtn = document.getElementById(nextBtnId);
    const carouselDotsContainer = document.getElementById(dotsContainerId);

    if (!carouselTrack || !carouselDotsContainer || !carouselPrevBtn || !carouselNextBtn) {
        console.warn(`carousel.js: Elementos del carrusel ${trackId} no encontrados. Inicialización abortada.`);
        return;
    }

    // Limpiar contenido previo para evitar duplicados si se llama varias veces
    carouselTrack.innerHTML = '';
    carouselDotsContainer.innerHTML = '';

    let currentSlide = 0;
    let autoSlideInterval;
    const totalSlides = data.length;

    if (totalSlides === 0) {
        carouselTrack.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay ${type}s disponibles.</p>`;
        // Ocultar botones y dots si no hay slides
        carouselPrevBtn.style.display = 'none';
        carouselNextBtn.style.display = 'none';
        carouselDotsContainer.style.display = 'none';
        return;
    } else {
        // Asegurarse de que los controles estén visibles si hay slides
        carouselPrevBtn.style.display = 'block';
        carouselNextBtn.style.display = 'block';
        carouselDotsContainer.style.display = 'flex';
    }


    const slides = [];
    const dots = [];

    data.forEach((item, index) => {
        let slideElement;
        if (type === 'banner') {
            slideElement = createBannerSlideElement(item);
            slideElement.classList.add('carousel-slide'); // Clase genérica para slides
        } else if (type === 'brand') {
            slideElement = createBrandSlideElement(item);
            slideElement.classList.add('brand-logo-slide'); // Clase específica para slides de marca
            // Para carruseles de elementos múltiples, no queremos que cada uno sea un 'carousel-slide' del 100% de ancho
            // El desplazamiento se manejará por `transform: translateX` basado en el tamaño del contenedor y elementos.
            // Es más simple si no se usa la clase `carousel-slide` que fuerza 100% de width.
            // Aquí, lo manejaremos por el `transform` y la lógica de `visibleSlides`.
        }
        carouselTrack.appendChild(slideElement);
        slides.push(slideElement);

        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoSlide();
        });
        carouselDotsContainer.appendChild(dot);
        dots.push(dot);
    });

    /**
     * Crea un elemento de slide para un banner.
     * @param {Object} banner - Objeto con datos del banner.
     * @returns {HTMLElement} El elemento div del slide.
     */
    function createBannerSlideElement(banner) {
        const slideElement = document.createElement('div');
        slideElement.style.backgroundImage = `url(${banner.imageUrl})`;
        slideElement.setAttribute('role', 'group');
        slideElement.setAttribute('aria-roledescription', 'slide');
        slideElement.setAttribute('tabindex', '-1'); // No enfocable por defecto

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('carousel-content');
        contentDiv.innerHTML = `
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn-primary">${banner.buttonText}</a>` : ''}
        `;
        slideElement.appendChild(contentDiv);
        return slideElement;
    }

    /**
     * Crea un elemento de slide para un logo de marca.
     * @param {Object} brand - Objeto con datos de la marca.
     * @returns {HTMLElement} El elemento div del slide de marca.
     */
    function createBrandSlideElement(brand) {
        const brandDiv = document.createElement('div');
        // No añadimos 'carousel-slide' aquí ya que su CSS es para un slide de ancho completo
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
        brandDiv.setAttribute('role', 'group'); // Usar role 'group' para items en un carrusel
        brandDiv.setAttribute('aria-roledescription', 'slideitem'); // O 'slideitem'
        brandDiv.setAttribute('tabindex', '-1');
        return brandDiv;
    }

    /**
     * Muestra el slide especificado, manejando el desbordamiento (loop).
     * @param {number} index - El índice del slide a mostrar.
     */
    function showSlide(index) {
        currentSlide = index;
        if (currentSlide >= totalSlides) {
            currentSlide = 0;
        } else if (currentSlide < 0) {
            currentSlide = totalSlides - 1;
        }

        let offset = 0;
        if (type === 'banner') {
            offset = -currentSlide * 100; // 100% de ancho para banners
            carouselTrack.style.transform = `translateX(${offset}%)`;
        } else if (type === 'brand') {
            // Calcular el offset para carruseles de marcas
            // Necesitamos el ancho de un slide de marca + su margen
            const brandSlideWidth = slides[0] ? slides[0].offsetWidth + (parseFloat(getComputedStyle(slides[0]).marginRight) * 2) : 0;
            const trackWidth = carouselTrack.offsetWidth;

            // Calcular cuántos slides caben en la vista
            const slidesInView = Math.floor(trackWidth / brandSlideWidth);

            // Asegurarse de que no se desplace más allá del final
            // El último slide visible debe ser el último item del carrusel.
            // `totalSlides - slidesInView` es el índice del primer slide de la "última página"
            const maxOffsetIndex = Math.max(0, totalSlides - slidesInView);
            let targetSlideIndex = currentSlide;

            // Ajustar el índice si estamos cerca del final para que el último grupo se vea completo
            if (currentSlide > maxOffsetIndex) {
                targetSlideIndex = maxOffsetIndex;
            }

            offset = -targetSlideIndex * brandSlideWidth;
            carouselTrack.style.transform = `translateX(${offset}px)`;
            currentSlide = targetSlideIndex; // Actualiza currentSlide al ajustado
        }
        updateCarousel();
    }


    /**
     * Actualiza las clases 'active' y los atributos de accesibilidad de slides y dots.
     */
    function updateCarousel() {
        slides.forEach((slide, index) => {
            if (type === 'banner') {
                if (index === currentSlide) {
                    slide.classList.add('active');
                    slide.setAttribute('aria-hidden', 'false');
                    slide.setAttribute('tabindex', '0');
                } else {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', 'true');
                    slide.setAttribute('tabindex', '-1');
                }
            }
            // Para 'brand', la clase 'active' y tabindex/aria-hidden en el slide individual
            // no es tan relevante si hay múltiples visibles y se desplaza el track.
            // Podemos activar el dot correspondiente al primer elemento visible.
        });

        dots.forEach((dot, index) => {
            if (index === currentSlide) { // Siempre el dot para el 'currentSlide' lógico
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
                dot.setAttribute('tabindex', '0');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-selected', 'false');
                dot.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * Inicia el temporizador para el auto-avance del carrusel.
     */
    function startAutoSlide() {
        stopAutoSlide(); // Asegura que solo un intervalo esté activo
        autoSlideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, slideDuration);
    }

    /**
     * Detiene el temporizador del auto-avance del carrusel.
     */
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    /**
     * Reinicia el temporizador del auto-avance (llamado después de interacción del usuario).
     */
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    // Event Listeners
    carouselPrevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    });

    carouselNextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    });

    // Opcional: Pausar en hover
    carouselTrack.addEventListener('mouseenter', stopAutoSlide);
    carouselTrack.addEventListener('mouseleave', startAutoSlide);

    // Inicializar
    showSlide(currentSlide);
    startAutoSlide();

    // Guardar instancia para referencia externa si es necesario
    carouselInstances[trackId] = {
        showSlide,
        startAutoSlide,
        stopAutoSlide,
        resetAutoSlide,
        totalSlides,
        slides,
        dots
    };

    // Ajustar el carrusel cuando la ventana cambia de tamaño
    window.addEventListener('resize', () => {
        showSlide(currentSlide); // Recalcular la posición en caso de resize
    });
}
