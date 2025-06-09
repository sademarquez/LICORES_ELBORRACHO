// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 2300; // Duración de cada slide en milisegundos

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0; // Para mantener el conteo de slides

/**
 * Crea un elemento de slide para el carrusel.
 * @param {Object} banner - Objeto con los datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slideElement = document.createElement('div');
    slideElement.classList.add('carousel-slide');
    slideElement.style.backgroundImage = `url('${banner.imageUrl}')`;
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-label', `Slide ${banner.id}`);

    // Asegurarse de que el link existe antes de añadir el botón
    const buttonHtml = banner.link && banner.buttonText ?
        `<a href="${banner.link}" class="btn btn-primary carousel-button">${banner.buttonText}</a>` : '';

    slideElement.innerHTML = `
        <div class="carousel-content">
            <h1 class="carousel-title">${banner.title}</h1>
            <p class="carousel-description">${banner.description}</p>
            ${buttonHtml}
        </div>
    `;
    return slideElement;
}

/**
 * Muestra un slide específico, manejando el desbordamiento.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return; // Evitar errores si no hay slides

    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    updateCarousel();
    resetAutoSlide(); // Reinicia el temporizador después de una interacción o avance
}

/**
 * Actualiza las clases 'active' y los atributos de accesibilidad de slides y dots.
 */
function updateCarousel() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            slide.setAttribute('aria-hidden', 'false');
            slide.setAttribute('tabindex', '0');
        } else {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('tabindex', '-1');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
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

/**
 * Inicializa el carrusel con los datos de banners proporcionados.
 * @param {Array<Object>} bannersData - Un array de objetos con información de los banners.
 */
export function initCarousel(bannersData) {
    carouselTrack = document.getElementById('carouselTrack');
    const carouselPrevBtn = document.getElementById('carouselPrev');
    const carouselNextBtn = document.getElementById('carouselNext');
    carouselDotsContainer = document.getElementById('carouselDots');

    if (!carouselTrack || !carouselDotsContainer || !carouselPrevBtn || !carouselNextBtn) {
        console.warn('carousel.js: Elementos del carrusel no encontrados. Inicialización abortada.');
        return;
    }

    // Limpiar contenido previo para evitar duplicados si se llama varias veces
    carouselTrack.innerHTML = '';
    carouselDotsContainer.innerHTML = '';
    slides = []; // Resetear array de slides
    dots = [];   // Resetear array de dots
    currentSlide = 0; // Resetear slide actual

    if (bannersData && bannersData.length > 0) {
        totalSlides = bannersData.length;
        bannersData.forEach((banner, index) => {
            const slideElement = createSlideElement(banner);
            carouselTrack.appendChild(slideElement);
            slides.push(slideElement);

            const dotElement = document.createElement('button');
            dotElement.classList.add('carousel-dot');
            dotElement.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotElement.addEventListener('click', () => {
                showSlide(index);
            });
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        // Configurar botones de navegación
        carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        // Mostrar el primer slide y comenzar auto-avance
        showSlide(currentSlide);
        startAutoSlide();
        console.log('carousel.js: Carrusel inicializado correctamente con', totalSlides, 'banners.');
    } else {
        console.warn('carousel.js: No se proporcionaron datos de banners para inicializar el carrusel.');
        // Ocultar el carrusel si no hay banners para evitar un espacio vacío
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = 'none';
        }
    }
}

// Exportar funciones si se necesitan externamente (aunque initCarousel es la principal)
// export { showSlide, startAutoSlide, stopAutoSlide };
