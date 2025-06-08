// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 1200; // Duración de cada slide en milisegundos

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0; // Para mantener el conteo de slides

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
            slides.push(slideElement); // Almacenar referencia al slide

            const dotElement = createDotElement(index);
            dotElement.setAttribute('role', 'tab');
            dotElement.setAttribute('aria-controls', banner.id);
            dotElement.addEventListener('click', () => showSlide(index));
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement); // Almacenar referencia al dot
        });

        // Configurar botones de navegación
        carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        showSlide(currentSlide); // Mostrar el primer slide
        startAutoSlide(); // Iniciar el auto-carrusel
        console.log('carousel.js: Carrusel inicializado con', totalSlides, 'banners.');
    } else {
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
        // Ocultar controles si no hay banners
        carouselPrevBtn.style.display = 'none';
        carouselNextBtn.style.display = 'none';
        carouselDotsContainer.style.display = 'none';
        carouselTrack.innerHTML = '<p style="text-align: center; padding: 50px; color: var(--text-color-light);">No hay banners disponibles.</p>';
    }
}

/**
 * Crea un elemento de slide HTML para el carrusel.
 * @param {Object} banner - Objeto con datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} - El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url(${banner.imageUrl})`;
    slide.setAttribute('id', banner.id); // Asegura que el slide tenga un ID para aria-controls
    slide.innerHTML = `
        <div class="carousel-caption">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            <a href="${banner.link}" class="btn-primary">${banner.buttonText}</a>
        </div>
    `;
    return slide;
}

/**
 * Crea un elemento de dot (indicador de slide) HTML.
 * @param {number} index - El índice del slide al que representa el dot.
 * @returns {HTMLElement} - El elemento button del dot.
 */
function createDotElement(index) {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    return dot;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return; // No hacer nada si no hay slides

    if (index >= totalSlides) {
        currentSlide = 0; // Vuelve al principio
    } else if (index < 0) {
        currentSlide = totalSlides - 1; // Vuelve al final
    } else {
        currentSlide = index;
    }

    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    updateCarousel();
    resetAutoSlide();
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
