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

            const dotElement = document.createElement('span');
            dotElement.classList.add('carousel-dot');
            dotElement.setAttribute('role', 'button');
            dotElement.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dotElement.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide(); // Reiniciar el auto-avance después de interacción manual
            });
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide(); // Reiniciar el auto-avance después de interacción manual
        });

        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide(); // Reiniciar el auto-avance después de interacción manual
        });

        showSlide(currentSlide); // Mostrar el primer slide
        startAutoSlide(); // Iniciar el auto-avance

        console.log('carousel.js: Carrusel inicializado con éxito.');
    } else {
        console.warn('carousel.js: No se encontraron datos de banners para inicializar el carrusel.');
        carouselTrack.innerHTML = '<p style="text-align:center; padding:50px;">No hay banners disponibles.</p>';
    }
}

/**
 * Crea un elemento de slide HTML para el carrusel.
 * @param {Object} banner - Objeto con los datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url(${banner.imageUrl})`;
    slide.setAttribute('aria-hidden', 'true');
    slide.setAttribute('tabindex', '-1');

    const content = `
        <div class="carousel-slide-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            <a href="${banner.link}" class="btn btn-primary">${banner.buttonText}</a>
        </div>
    `;
    slide.innerHTML = content;
    return slide;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return;

    // Manejar el bucle del carrusel
    currentSlide = (index + totalSlides) % totalSlides;

    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
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
