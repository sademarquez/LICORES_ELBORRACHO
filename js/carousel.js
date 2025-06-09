// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 4000; // Duración de cada slide en milisegundos (4 segundos)

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0; // Para mantener el conteo de slides

// Variables para el touch-swipe
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50; // Distancia mínima para considerar un swipe

/**
 * Crea un elemento de slide para el carrusel de banners.
 * @param {Object} banner - Objeto con información del banner (title, description, imageUrl, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${banner.id}`);

    slide.innerHTML = `
        <div class="slide-content">
            <h2 class="slide-title">${banner.title}</h2>
            <p class="slide-description">${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn-primary slide-button" aria-label="${banner.buttonText}">${banner.buttonText}</a>` : ''}
        </div>
    `;
    return slide;
}

/**
 * Muestra un slide específico y actualiza la posición del track.
 * Se encarga de manejar el loop infinito del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    // Calcular el índice real para el loop
    currentSlide = (index + totalSlides) % totalSlides;
    const offset = -currentSlide * 100; // Cada slide ocupa el 100% del ancho del contenedor
    carouselTrack.style.transform = `translateX(${offset}%)`;

    updateCarousel();
    resetAutoSlide(); // Reinicia el temporizador después de la interacción o auto-avance
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
            const slideElement = createSlideElement(banner);
            carouselTrack.appendChild(slideElement);
            slides.push(slideElement);

            const dotElement = document.createElement('button');
            dotElement.classList.add('carousel-dot');
            dotElement.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dotElement.setAttribute('role', 'tab');
            dotElement.setAttribute('aria-controls', `carousel-slide-${index}`); // Asumiendo IDs para slides si es necesario
            dotElement.addEventListener('click', () => showSlide(index));
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        // Configurar botones de navegación
        carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        // Inicializar el carrusel
        showSlide(currentSlide);
        startAutoSlide();

        // Pausar auto-avance al pasar el ratón por encima (escritorio) o al tocar (móvil)
        carouselTrack.parentElement.addEventListener('mouseenter', stopAutoSlide);
        carouselTrack.parentElement.addEventListener('mouseleave', startAutoSlide);

        // --- Manejo de Touch-Swipe para dispositivos móviles ---
        carouselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopAutoSlide(); // Pausar auto-avance durante el swipe
        }, { passive: true }); // Usar passive para mejor rendimiento en scroll

        carouselTrack.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        carouselTrack.addEventListener('touchend', () => {
            if (touchEndX < touchStartX - minSwipeDistance) {
                // Swipe a la izquierda (siguiente slide)
                showSlide(currentSlide + 1);
            } else if (touchEndX > touchStartX + minSwipeDistance) {
                // Swipe a la derecha (anterior slide)
                showSlide(currentSlide - 1);
            }
            startAutoSlide(); // Reiniciar auto-avance después del swipe
        });

        console.log('carousel.js: Carrusel principal inicializado con éxito.');

    } else {
        console.warn('carousel.js: No hay datos de banners para inicializar el carrusel.');
        // Ocultar el contenedor del carrusel si no hay slides para mostrar
        document.getElementById('heroSection').style.display = 'none';
    }
}
