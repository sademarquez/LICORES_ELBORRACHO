// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 5000; // Duración de cada slide en milisegundos (5 segundos)

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0; // Para mantener el conteo de slides

/**
 * Crea y devuelve un elemento de slide para el carrusel principal.
 * @param {Object} banner - Objeto con los datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div que representa un slide.
 */
function createSlideElement(banner) {
    const slideElement = document.createElement('div');
    slideElement.classList.add('carousel-slide');
    slideElement.style.backgroundImage = `url(${banner.imageUrl})`;
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-label', `Slide ${banner.id}`);

    const slideContent = document.createElement('div');
    slideContent.classList.add('carousel-content');
    slideContent.innerHTML = `
        <h2>${banner.title}</h2>
        <p>${banner.description}</p>
        ${banner.link ? `<a href="${banner.link}" class="btn-primary" tabindex="-1">${banner.buttonText || 'Ver más'}</a>` : ''}
    `;

    slideElement.appendChild(slideContent);
    return slideElement;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return; // No hay slides para mostrar

    // Calcular el índice real para asegurar el bucle infinito
    currentSlide = (index + totalSlides) % totalSlides;

    const offset = -currentSlide * 100; // Desplazamiento en porcentaje
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Actualizar clases 'active' y atributos ARIA
    slides.forEach((slide, idx) => {
        const interactiveElements = slide.querySelectorAll('a, button, input, select, textarea');
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

            // Crear los puntos indicadores
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
            carouselDotsContainer.appendChild(dot);
            dots.push(dot);
        });

        // Event listeners para los botones de navegación
        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide();
        });

        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide();
        });

        // Mostrar el primer slide y empezar el auto-avance
        showSlide(currentSlide);
        startAutoSlide();

        console.log(`carousel.js: Carrusel principal inicializado con ${totalSlides} banners.`);

    } else {
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
        // Opcional: Ocultar el contenedor del carrusel si no hay datos
        document.getElementById('hero-carousel').style.display = 'none';
    }
}
