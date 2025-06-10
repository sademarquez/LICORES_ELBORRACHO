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

            const dotElement = document.createElement('span');
            dotElement.classList.add('carousel-dot');
            dotElement.dataset.slideIndex = index;
            dotElement.addEventListener('click', () => showSlide(index));
            carouselDotsContainer.appendChild(dotElement);

            slides.push(slideElement);
            dots.push(dotElement);
        });

        // Event listeners para botones de navegación
        carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        showSlide(currentSlide); // Mostrar el primer slide
        startAutoSlide(); // Iniciar el auto-avance
        
        // Pausar auto-avance al pasar el mouse sobre el carrusel
        carouselTrack.parentElement.addEventListener('mouseenter', stopAutoSlide);
        carouselTrack.parentElement.addEventListener('mouseleave', startAutoSlide);

    } else {
        console.warn('carousel.js: No hay datos de banners para el carrusel principal.');
        carouselTrack.innerHTML = `<p style="text-align: center; width: 100%; padding: var(--spacing-lg); color: var(--text-color-light);">No hay banners para mostrar.</p>`;
        carouselPrevBtn.style.display = 'none';
        carouselNextBtn.style.display = 'none';
        carouselDotsContainer.style.display = 'none';
    }
    // console.log('carousel.js: Carrusel principal inicializado.'); // ELIMINADO
}

/**
 * Crea un elemento de slide HTML para el carrusel principal.
 * @param {Object} banner - Objeto con los datos del banner (title, description, imageUrl, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `Slide ${banner.id}`);

    let buttonHtml = '';
    if (banner.link && banner.buttonText) {
        buttonHtml = `<a href="${banner.link}" class="btn btn-primary">${banner.buttonText}</a>`;
    }

    slide.innerHTML = `
        <div class="carousel-slide-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${buttonHtml}
        </div>
    `;
    return slide;
}

/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (slides.length === 0) return;

    currentSlide = (index + totalSlides) % totalSlides;
    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Actualizar clases 'active' y atributos de accesibilidad
    slides.forEach((slide, idx) => {
        // Encontrar elementos interactivos dentro del slide
        const interactiveElements = slide.querySelectorAll('a, button, input, select, textarea');

        if (idx === currentSlide) {
            slide.classList.add('active');
            slide.setAttribute('aria-hidden', 'false');
            slide.setAttribute('tabindex', '0'); // Hacer el slide focuseable
            interactiveElements.forEach(el => el.setAttribute('tabindex', '0')); // Hacer focuseables los elementos interactivos
        } else {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('tabindex', '-1'); // Quitar el slide del orden de tabulación
            interactiveElements.forEach(el => el.setAttribute('tabindex', '-1')); // Hacer NO focuseables los elementos interactivos
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
            dot.setAttribute('aria-selected', 'true');
            dot.setAttribute('tabindex', '0'); // Hacer el dot focuseable
        } else {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
            dot.setAttribute('tabindex', '-1'); // Quitar el dot del orden de tabulación
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
