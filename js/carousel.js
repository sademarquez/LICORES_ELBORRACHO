// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 2500; // Duración de cada slide en milisegundos (2.5 segundos)

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
    } else {
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
        carouselTrack.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: var(--text-color-light);">No hay banners disponibles.</p>';
        return;
    }

    // Configurar event listeners
    carouselPrevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    });
    carouselNextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoSlide();
        });
    });

    // Mostrar el primer slide al inicio
    showSlide(currentSlide);
    startAutoSlide(); // Iniciar auto-avance
    // console.log('carousel.js: Carrusel principal inicializado.'); // ELIMINADO para producción
}

/**
 * Crea un elemento de slide (banner) para el carrusel.
 * @param {Object} banner - Objeto con datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.innerHTML = `
        <div class="carousel-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn btn-primary" aria-label="${banner.buttonText}">${banner.buttonText}</a>` : ''}
        </div>
    `;
    return slide;
}

/**
 * Crea un elemento de punto de navegación para el carrusel.
 * @param {number} index - El índice del punto.
 * @returns {HTMLElement} El elemento span del punto.
 */
function createDotElement(index) {
    const dot = document.createElement('span');
    dot.classList.add('carousel-dot');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    return dot;
}

/**
 * Muestra el slide especificado.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return;

    // Lógica para loop infinito
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    // Mueve el track del carrusel
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Actualiza clases 'active' y atributos ARIA
    slides.forEach((slide, idx) => {
        const interactiveElements = slide.querySelectorAll('a, button'); // Elementos focuseables dentro del slide
        if (idx === currentSlide) {
            slide.classList.add('active');
            slide.setAttribute('aria-hidden', 'false');
            slide.setAttribute('tabindex', '0');
            interactiveElements.forEach(el => el.setAttribute('tabindex', '0')); // Hacer focuseables los elementos interactivos
        } else {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('tabindex', '-1');
            interactiveElements.forEach(el => el.setAttribute('tabindex', '-1')); // Hacer NO focuseables los elementos interactivos
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
