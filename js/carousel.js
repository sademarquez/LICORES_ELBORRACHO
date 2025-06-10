// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 3000; // 3 segundos

// Se declaran fuera para que sean accesibles en todo el módulo
let carouselTrack, dotsContainer, slides = [], dots = [], totalSlides = 0;

export function initCarousel(bannersData) {
    carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    dotsContainer = document.getElementById('carouselDots');

    // CORRECCIÓN: Verificación robusta de la existencia de todos los elementos necesarios
    if (!carouselTrack || !prevBtn || !nextBtn || !dotsContainer) {
        console.warn('carousel.js: Faltan uno o más elementos del carrusel en el HTML (#carouselTrack, #carouselPrev, #carouselNext, #carouselDots). Inicialización abortada.');
        return;
    }

    // Limpiar y resetear estado
    carouselTrack.innerHTML = '';
    dotsContainer.innerHTML = '';
    slides = [];
    dots = [];
    totalSlides = bannersData.length;

    if (totalSlides === 0) {
        carouselTrack.innerHTML = '<p class="w-full text-center text-text-color-light p-5">No hay banners disponibles.</p>';
        return;
    }

    // Crear slides y dots
    bannersData.forEach((banner, index) => {
        // ... (el resto del código de creación de slides y dots es igual)
    });

    // Configurar event listeners
    prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); resetAutoSlide(); });
    nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); resetAutoSlide(); });
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetAutoSlide(); });
    });

    showSlide(0);
    startAutoSlide();
}

// Las funciones createSlideElement, createDotElement, showSlide, startAutoSlide, stopAutoSlide y resetAutoSlide permanecen igual.
