// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 5000; // Duración de cada slide en milisegundos

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];

export function initCarousel(bannersData) {
    carouselTrack = document.getElementById('carouselTrack');
    const carouselPrevBtn = document.getElementById('carouselPrev');
    const carouselNextBtn = document.getElementById('carouselNext');
    carouselDotsContainer = document.getElementById('carouselDots');

    if (!carouselTrack || !carouselDotsContainer) {
        console.warn('Elementos del carrusel no encontrados. Inicialización abortada.');
        return;
    }

    carouselTrack.innerHTML = '';
    carouselDotsContainer.innerHTML = '';

    if (bannersData && bannersData.length > 0) {
        bannersData.forEach((banner, index) => {
            const slideElement = createSlideElement(banner);
            carouselTrack.appendChild(slideElement);

            const dotElement = createDotElement(index);
            dotElement.addEventListener('click', () => showSlide(index));
            carouselDotsContainer.appendChild(dotElement);
        });
        slides = Array.from(carouselTrack.children);
        dots = Array.from(carouselDotsContainer.children);

        if (carouselPrevBtn) carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        if (carouselNextBtn) carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        showSlide(currentSlide); // Muestra el primer slide al inicio
        startAutoSlide(); // Inicia el auto-slide

        // Pausar/Reanudar auto-slide al pasar el ratón por encima
        carouselTrack.addEventListener('mouseenter', stopAutoSlide);
        carouselTrack.addEventListener('mouseleave', startAutoSlide);

    } else {
        console.warn('No se encontraron datos de banners para inicializar el carrusel.');
        // Puedes mostrar un mensaje alternativo o simplemente ocultar el carrusel
        if (carouselTrack.parentElement) {
            carouselTrack.parentElement.style.display = 'none'; // Ocultar el contenedor si no hay banners
        }
    }
}

function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    // Usar background-image para el carrusel ya que el contenido va superpuesto
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.setAttribute('role', 'group'); // Para accesibilidad: indicar que es un grupo de elementos
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${banner.title} - Slide ${currentSlide + 1} de ${slides.length}`);


    const caption = document.createElement('div');
    caption.classList.add('carousel-caption');

    const title = document.createElement('h2');
    title.textContent = banner.title;

    const description = document.createElement('p');
    description.textContent = banner.description;

    const button = document.createElement('a');
    button.classList.add('btn-primary');
    button.href = banner.link || '#'; // Asegúrate de que el link sea válido
    button.textContent = banner.buttonText || 'Ver Más';
    button.setAttribute('aria-label', `Ir a ${banner.title}`);

    caption.appendChild(title);
    caption.appendChild(description);
    caption.appendChild(button);
    slide.appendChild(caption);

    return slide;
}

function createDotElement(index) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.dataset.slideIndex = index;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-controls', `slide-${index}`); // Si cada slide tuviera un ID único
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    return dot;
}

function showSlide(index) {
    if (slides.length === 0) return;

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    updateCarousel();
    resetAutoSlide();
}

function updateCarousel() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            slide.setAttribute('aria-hidden', 'false');
            slide.setAttribute('tabindex', '0'); // Hacer el slide actual enfocable
        } else {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('tabindex', '-1'); // Ocultar de la navegación del teclado
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

function startAutoSlide() {
    stopAutoSlide(); // Asegura que solo un intervalo esté activo
    autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, slideDuration);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}
