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
    if (totalSlides === 0) return; // No hacer nada si no hay slides

    // Ajustar el índice para que sea cíclico
    currentSlide = (index + totalSlides) % totalSlides;

    // Calcular la posición del track
    const offset = -currentSlide * 100; // 100% por slide
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Actualizar los puntos de paginación
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
        dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
    });
}

/**
 * Inicia el avance automático del carrusel.
 */
function startAutoSlide() {
    stopAutoSlide(); // Asegurarse de que no haya múltiples intervalos
    autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, slideDuration);
}

/**
 * Detiene el avance automático del carrusel.
 */
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

/**
 * Reinicia el temporizador de avance automático.
 * Útil después de una interacción manual del usuario.
 */
function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

/**
 * Inicializa el carrusel de banners principal.
 * @param {Array<Object>} bannersData - Array de objetos de banners (de config.json).
 */
export function initCarousel(bannersData) {
    const carouselContainer = document.getElementById('heroCarousel');
    // Añadir mensajes de error más específicos para depuración
    if (!carouselContainer) { console.error('carousel.js: Elemento #heroCarousel no encontrado. Inicialización abortada.'); return; }
    
    carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) { console.error('carousel.js: Elemento #carouselTrack no encontrado. Inicialización abortada.'); return; }
    
    const carouselPrevBtn = carouselContainer.querySelector('.carousel-button.prev');
    if (!carouselPrevBtn) { console.error('carousel.js: Botón .carousel-button.prev no encontrado. Inicialización abortada.'); return; }
    
    const carouselNextBtn = carouselContainer.querySelector('.carousel-button.next');
    if (!carouselNextBtn) { console.error('carousel.js: Botón .carousel-button.next no encontrado. Inicialización abortada.'); return; }
    
    carouselDotsContainer = carouselContainer.querySelector('.carousel-pagination');
    if (!carouselDotsContainer) { console.error('carousel.js: Contenedor .carousel-pagination no encontrado. Inicialización abortada.'); return; }


    // Asegurarse de que haya datos de banners antes de continuar
    if (bannersData && bannersData.length > 0) {
        totalSlides = bannersData.length;
        carouselTrack.innerHTML = ''; // Limpiar cualquier contenido previo
        carouselDotsContainer.innerHTML = ''; // Limpiar dots previos

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
        // Opcional: Ocultar el contenedor del carrusel si no hay datos (¡ID CORREGIDO!)
        document.getElementById('heroCarousel').style.display = 'none'; // Usar el ID correcto
    }
}
