// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 3000;

let carouselTrack, dotsContainer, slides = [], dots = [], totalSlides = 0;

export function initCarousel(bannersData) {
    carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    dotsContainer = document.getElementById('carouselDots');

    if (!carouselTrack || !prevBtn || !nextBtn || !dotsContainer) {
        console.warn('carousel.js: Faltan elementos del carrusel. Inicialización abortada.');
        return;
    }
    
    // CORRECCIÓN: Verificación para evitar el error 'Cannot read properties of undefined'
    if (!bannersData) {
        console.warn('carousel.js: No se proporcionaron datos de banners (bannersData is undefined).');
        carouselTrack.innerHTML = '<p class="w-full text-center text-text-color-light p-5">Cargando banners...</p>';
        return;
    }

    // Limpiar y resetear estado
    carouselTrack.innerHTML = '';
    dotsContainer.innerHTML = '';
    slides = [];
    dots = [];
    totalSlides = bannersData.length; // Esta línea ya no dará error

    if (totalSlides === 0) {
        carouselTrack.innerHTML = '<p class="w-full text-center text-text-color-light p-5">No hay banners disponibles.</p>';
        return;
    }

    bannersData.forEach((banner, index) => {
        const slideElement = createSlideElement(banner);
        carouselTrack.appendChild(slideElement);
        slides.push(slideElement);

        const dotElement = createDotElement(index);
        dotsContainer.appendChild(dotElement);
        dots.push(dotElement);
    });

    prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); resetAutoSlide(); });
    nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); resetAutoSlide(); });
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetAutoSlide(); });
    });

    showSlide(0);
    startAutoSlide();
}

function createSlideElement(banner) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.backgroundImage = `url('${banner.imageUrl}')`;
    slide.innerHTML = `
        <div class="carousel-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn btn-primary">${banner.buttonText}</a>` : ''}
        </div>
    `;
    return slide;
}

function createDotElement(index) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.dataset.index = index;
    return dot;
}

function showSlide(index) {
    if (totalSlides === 0) return;
    currentSlide = (index + totalSlides) % totalSlides; // Fórmula matemática para loop infinito
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentSlide));
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => showSlide(currentSlide + 1), slideDuration);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}
