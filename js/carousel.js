// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 4000; // Duración de cada slide en milisegundos

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
    stopAutoSlide(); // Asegurarse de limpiar cualquier intervalo previo

    if (bannersData && bannersData.length > 0) {
        totalSlides = bannersData.length;
        bannersData.forEach((banner, index) => {
            const slideElement = createSlideElement(banner);
            carouselTrack.appendChild(slideElement);
            slides.push(slideElement); // Almacenar referencia al elemento del slide

            const dotElement = createDotElement(index);
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement); // Almacenar referencia al elemento del dot
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

        // Mostrar el primer slide y comenzar el auto-avance
        showSlide(currentSlide);
        startAutoSlide();
        console.log('carousel.js: Carrusel inicializado con éxito.');
    } else {
        carouselTrack.innerHTML = '<p style="text-align: center; color: var(--text-color-light); padding: 50px;">No hay banners disponibles.</p>';
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
    }
}

/**
 * Crea un elemento de slide HTML para el carrusel.
 * @param {Object} banner - Objeto con la información del banner.
 * @returns {HTMLElement} El elemento div que representa un slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.innerHTML = `
        <div class="carousel-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn-primary">${banner.buttonText || 'Ver Más'}</a>` : ''}
        </div>
    `;
    return slide;
}

/**
 * Crea un elemento de dot HTML para el carrusel.
 * @param {number} index - El índice del dot.
 * @returns {HTMLElement} El elemento span que representa un dot.
 */
function createDotElement(index) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    return dot;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    // Calcular el índice del slide, manejando el bucle infinito
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    // Mover el track del carrusel
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Actualizar las clases 'active' y los atributos de accesibilidad de slides y dots.
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
