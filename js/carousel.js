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

            const dotElement = document.createElement('span');
            dotElement.classList.add('carousel-dot');
            dotElement.setAttribute('role', 'button');
            dotElement.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
            dotElement.setAttribute('data-slide-index', index);
            dotElement.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
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

        // Mostrar el primer slide y comenzar el auto-avance
        showSlide(currentSlide);
        startAutoSlide();
        // console.log('carousel.js: Carrusel principal inicializado con éxito.'); // ELIMINADO
    } else {
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel principal.');
        // Puedes ocultar el carrusel si no hay banners
        carouselTrack.parentElement.style.display = 'none'; 
    }
}

/**
 * Crea un elemento de slide para el carrusel principal.
 * @param {Object} banner - Objeto con los datos del banner (imageUrl, title, description, link, buttonText).
 * @returns {HTMLElement} El elemento div que representa un slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url(${banner.imageUrl})`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Diapositiva ${currentSlide + 1} de ${totalSlides}`);

    let buttonHtml = '';
    if (banner.link && banner.buttonText) {
        buttonHtml = `<a href="${banner.link}" class="btn-primary carousel-button">${banner.buttonText}</a>`;
    }

    slide.innerHTML = `
        <div class="carousel-content">
            <h2 class="carousel-title">${banner.title}</h2>
            <p class="carousel-description">${banner.description}</p>
            ${buttonHtml}
        </div>
    `;
    return slide;
}

/**
 * Muestra el slide especificado.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (index >= totalSlides) {
        currentSlide = 0; // Vuelve al inicio si pasa el último slide
    } else if (index < 0) {
        currentSlide = totalSlides - 1; // Va al final si retrocede desde el primero
    } else {
        currentSlide = index;
    }

    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    updateCarousel();
}

/**
 * Actualiza las clases 'active' y los atributos de accesibilidad de slides y dots.
 */
function updateCarousel() {
    slides.forEach((slide, index) => {
        const interactiveElements = slide.querySelectorAll('button, a, input, select, textarea'); // Selecciona elementos interactivos

        if (index === currentSlide) {
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
