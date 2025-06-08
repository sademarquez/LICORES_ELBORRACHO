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

    // Limpiar contenido previo para evitar duplicados si se llama varias veces
    carouselTrack.innerHTML = '';
    carouselDotsContainer.innerHTML = '';
    slides = []; // Resetear array de slides
    dots = [];   // Resetear array de dots

    if (bannersData && bannersData.length > 0) {
        bannersData.forEach((banner, index) => {
            const slideElement = createSlideElement(banner);
            carouselTrack.appendChild(slideElement);

            const dotElement = createDotElement(index);
            // Accesibilidad: Añadir role="tab" y aria-controls
            dotElement.setAttribute('role', 'tab');
            dotElement.setAttribute('aria-controls', banner.id);
            dotElement.addEventListener('click', () => showSlide(index));
            carouselDotsContainer.appendChild(dotElement);
        });

        // Asegurarse de que slides y dots sean arrays vivos del DOM o actualizarlos
        slides = Array.from(carouselTrack.children);
        dots = Array.from(carouselDotsContainer.children);

        // Añadir listeners para los botones de navegación
        if (carouselPrevBtn) carouselPrevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        if (carouselNextBtn) carouselNextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

        // Mostrar el primer slide y comenzar el auto-slide
        showSlide(0); // Muestra el primer slide al inicio
        startAutoSlide();

        // Pausar auto-slide al pasar el ratón por el carrusel
        const heroSection = document.getElementById('novedades');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopAutoSlide);
            heroSection.addEventListener('mouseleave', startAutoSlide);
        }

        console.log('Carrusel inicializado con éxito.');
    } else {
        console.log('No hay datos de banners para inicializar el carrusel.');
        // Puedes agregar un mensaje alternativo si no hay banners
        carouselTrack.innerHTML = '<p style="text-align: center; color: var(--text-color-light);">No hay novedades en este momento.</p>';
    }
}

function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');
    // Asignar ID al slide para aria-controls
    slide.setAttribute('id', banner.id);
    slide.style.backgroundImage = `url(${banner.imageUrl})`;
    slide.setAttribute('role', 'tabpanel'); // Para accesibilidad
    slide.setAttribute('aria-labelledby', `dot-${banner.id}`); // Asociar con el dot

    const caption = document.createElement('div');
    caption.classList.add('carousel-caption');
    caption.innerHTML = `
        <h2>${banner.title}</h2>
        <p>${banner.description}</p>
        <a href="${banner.link}" class="btn">${banner.buttonText}</a>
    `;
    slide.appendChild(caption);
    return slide;
}

function createDotElement(index) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    dot.setAttribute('id', `dot-banner${index + 1}`); // Asignar un ID único al dot
    dot.setAttribute('aria-selected', 'false'); // Estado inicial
    dot.setAttribute('tabindex', '-1'); // No enfocable por defecto, solo el activo
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
            dot.setAttribute('tabindex', '0'); // Hacer el dot actual enfocable
        } else {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
            dot.setAttribute('tabindex', '-1'); // Ocultar de la navegación del teclado
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
