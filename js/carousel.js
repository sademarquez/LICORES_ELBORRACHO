// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 3000; // Duración de cada slide en milisegundos (ajustado ligeramente)

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0;

/**
 * Crea un elemento de slide para el carrusel.
 * @param {Object} banner - Objeto con los datos del banner (title, description, imageUrl, link, buttonText).
 * @param {number} index - Índice del slide.
 * @returns {HTMLElement} El elemento div que representa un slide.
 */
function createSlideElement(banner, index) {
    const slideElement = document.createElement('div');
    slideElement.classList.add('carousel-slide');
    slideElement.style.backgroundImage = `url('${banner.imageUrl}')`;
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-roledescription', 'slide');
    slideElement.setAttribute('aria-label', `${index + 1} de ${totalSlides}`);
    slideElement.setAttribute('aria-hidden', 'true'); // Por defecto, oculto
    slideElement.setAttribute('tabindex', '-1'); // Por defecto, no enfocable

    slideElement.innerHTML = `
        <div class="slide-content">
            <h2 class="slide-title">${banner.title}</h2>
            <p class="slide-description">${banner.description}</p>
            <a href="${banner.link}" class="btn-primary" aria-label="${banner.buttonText}">${banner.buttonText}</a>
        </div>
    `;
    return slideElement;
}

/**
 * Crea un dot de navegación para el carrusel.
 * @param {number} index - Índice del dot.
 * @returns {HTMLElement} El elemento button que representa un dot.
 */
function createDotElement(index) {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-controls', `slide-${index}`);
    dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
    dot.setAttribute('tabindex', '-1'); // Por defecto no enfocable
    dot.addEventListener('click', () => {
        showSlide(index);
        resetAutoSlide();
    });
    return dot;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides; // Asegura que el índice esté dentro del rango
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    updateCarousel();
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
            const slideElement = createSlideElement(banner, index);
            carouselTrack.appendChild(slideElement);
            slides.push(slideElement);

            const dotElement = createDotElement(index);
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        // Configurar botones de navegación
        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide();
        });
        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide();
        });

        // Event listeners para pausar/reanudar al interactuar
        carouselTrack.addEventListener('mouseenter', stopAutoSlide);
        carouselTrack.addEventListener('mouseleave', startAutoSlide);
        carouselPrevBtn.addEventListener('mouseenter', stopAutoSlide);
        carouselPrevBtn.addEventListener('mouseleave', startAutoSlide);
        carouselNextBtn.addEventListener('mouseenter', stopAutoSlide);
        carouselNextBtn.addEventListener('mouseleave', startAutoSlide);
        carouselDotsContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselDotsContainer.addEventListener('mouseleave', startAutoSlide);


        showSlide(currentSlide); // Muestra el primer slide
        startAutoSlide(); // Inicia el auto-avance
        console.log('carousel.js: Carrusel inicializado con', totalSlides, 'slides.');
    } else {
        carouselTrack.innerHTML = '<p class="no-banners-message">No hay banners disponibles para mostrar.</p>';
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
    }
}
