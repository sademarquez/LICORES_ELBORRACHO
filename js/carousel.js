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

        // Configurar event listeners para los botones de navegación
        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide();
        });
        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide();
        });

        // Configurar event listeners para los puntos (dots)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });

        // Mostrar el primer slide al iniciar
        showSlide(currentSlide);
        // Iniciar el auto-avance
        startAutoSlide();

        // Pausar el auto-avance al pasar el mouse sobre el carrusel
        carouselTrack.addEventListener('mouseover', stopAutoSlide);
        carouselTrack.addEventListener('mouseleave', startAutoSlide);
        carouselPrevBtn.addEventListener('mouseover', stopAutoSlide);
        carouselPrevBtn.addEventListener('mouseleave', startAutoSlide);
        carouselNextBtn.addEventListener('mouseover', stopAutoSlide);
        carouselNextBtn.addEventListener('mouseleave', startAutoSlide);
        carouselDotsContainer.addEventListener('mouseover', stopAutoSlide);
        carouselDotsContainer.addEventListener('mouseleave', startAutoSlide);

    } else {
        // console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.'); // ELIMINADO
        carouselTrack.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay banners disponibles.</p>';
    }
}

/**
 * Crea un elemento de slide HTML a partir de los datos del banner.
 * @param {Object} banner - Objeto con la información del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `Slide con título: ${banner.title}`);

    slide.innerHTML = `
        <div class="slide-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            <a href="${banner.link}" class="btn-primary" tabindex="-1">${banner.buttonText}</a>
        </div>
    `;
    return slide;
}

/**
 * Crea un elemento de punto de navegación HTML para el carrusel.
 * @param {number} index - El índice del slide al que corresponde el punto.
 * @returns {HTMLElement} El elemento span del punto.
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
    currentSlide = (index + totalSlides) % totalSlides; // Permite navegación circular

    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Actualizar clases 'active' y atributos ARIA
    slides.forEach((slide, idx) => {
        const interactiveElements = slide.querySelectorAll('a, button, input, select');
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
