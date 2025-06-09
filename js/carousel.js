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

            const dotElement = createDotElement(index);
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        // Configurar event listeners para los botones de navegación
        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide();
        });

        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide();
        });

        // Configurar event listeners para los dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });

        showSlide(currentSlide); // Muestra el primer slide al inicio
        startAutoSlide(); // Inicia el auto-avance
        console.log('carousel.js: Carrusel inicializado con', totalSlides, 'banners.');

    } else {
        console.warn('carousel.js: No hay banners para inicializar el carrusel.');
        // Mostrar un mensaje o un slide de placeholder si no hay banners
        carouselTrack.innerHTML = `<div class="carousel-slide" style="background-color: var(--secondary-color-dark);">
                                     <div class="carousel-content">
                                         <h2>¡Bienvenido a EL BORRACHO!</h2>
                                         <p>Explora nuestras ofertas y productos.</p>
                                         <a href="#novedades" class="btn-primary">Ver Novedades</a>
                                     </div>
                                 </div>`;
        carouselTrack.style.transform = 'translateX(0%)';
    }
}

/**
 * Crea un elemento de slide para el carrusel.
 * @param {Object} banner - Objeto con datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url(${banner.imageUrl})`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `Slide ${banner.id}`);

    slide.innerHTML = `
        <div class="carousel-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn-primary">${banner.buttonText || 'Ver más'}</a>` : ''}
        </div>
    `;
    return slide;
}

/**
 * Crea un elemento de dot para la navegación del carrusel.
 * @param {number} index - El índice del dot.
 * @returns {HTMLElement} El elemento span del dot.
 */
function createDotElement(index) {
    const dot = document.createElement('span');
    dot.classList.add('carousel-dot');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-controls', 'carouselTrack');
    dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
    dot.setAttribute('tabindex', '0'); // Hacer los dots enfocables
    return dot;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return; // No hacer nada si no hay slides

    currentSlide = (index + totalSlides) % totalSlides; // Permite navegación circular
    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
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
