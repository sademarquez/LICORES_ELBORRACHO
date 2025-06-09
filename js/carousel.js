// js/carousel.js

let currentSlide = 0;
let autoSlideInterval;
const slideDuration = 2300; // Duración de cada slide en milisegundos (2.3 segundos)

let carouselTrack;
let carouselDotsContainer;
let slides = [];
let dots = [];
let totalSlides = 0; // Para mantener el conteo de slides

/**
 * Inicializa el carrusel con los datos proporcionados.
 * Puede ser usado para banners estáticos o para productos (ofertas/novedades).
 *
 * @param {Array<Object>} itemsData - Un array de objetos con información de los items (banners o productos).
 * @param {string} trackId - El ID del elemento que actúa como 'track' del carrusel.
 * @param {string} prevBtnId - El ID del botón de 'anterior'.
 * @param {string} nextBtnId - El ID del botón de 'siguiente'.
 * @param {string} dotsContainerId - El ID del contenedor de los 'dots' de navegación.
 * @param {boolean} isProductCarousel - Si es true, renderiza tarjetas de producto; si es false, renderiza banners.
 */
export function initCarousel(itemsData, trackId, prevBtnId, nextBtnId, dotsContainerId, isProductCarousel = false) {
    carouselTrack = document.getElementById(trackId);
    const carouselPrevBtn = document.getElementById(prevBtnId);
    const carouselNextBtn = document.getElementById(nextBtnId);
    carouselDotsContainer = document.getElementById(dotsContainerId);

    if (!carouselTrack || !carouselDotsContainer || !carouselPrevBtn || !carouselNextBtn) {
        console.warn(`carousel.js: Elementos del carrusel (${trackId}) no encontrados. Inicialización abortada.`);
        return;
    }

    // Limpiar contenido previo para evitar duplicados si se llama varias veces
    carouselTrack.innerHTML = '';
    carouselDotsContainer.innerHTML = '';
    slides = []; // Resetear array de slides
    dots = [];   // Resetear array de dots
    currentSlide = 0; // Resetear slide actual

    if (itemsData && itemsData.length > 0) {
        totalSlides = itemsData.length;
        itemsData.forEach((item, index) => {
            let slideElement;
            if (isProductCarousel) {
                // Aquí se espera que 'item' sea un objeto de producto
                slideElement = createProductSlideElement(item);
            } else {
                // Aquí se espera que 'item' sea un objeto de banner
                slideElement = createBannerSlideElement(item);
            }
            carouselTrack.appendChild(slideElement);
            slides.push(slideElement);

            const dotElement = document.createElement('span');
            dotElement.classList.add('dot');
            dotElement.setAttribute('role', 'button');
            dotElement.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dotElement.setAttribute('tabindex', '0');
            dotElement.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide(); // Reiniciar el auto-avance al interactuar con los dots
            });
            carouselDotsContainer.appendChild(dotElement);
            dots.push(dotElement);
        });

        carouselPrevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            resetAutoSlide();
        });
        carouselNextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            resetAutoSlide();
        });

        // Event listeners para detener/reiniciar el auto-avance al pasar el mouse
        carouselTrack.addEventListener('mouseenter', stopAutoSlide);
        carouselTrack.addEventListener('mouseleave', startAutoSlide);
        carouselPrevBtn.addEventListener('mouseenter', stopAutoSlide);
        carouselNextBtn.addEventListener('mouseenter', stopAutoSlide);
        carouselPrevBtn.addEventListener('mouseleave', startAutoSlide);
        carouselNextBtn.addEventListener('mouseleave', startAutoSlide);

        showSlide(currentSlide); // Muestra el primer slide al inicializar
        startAutoSlide(); // Inicia el auto-avance
        console.log(`carousel.js: Carrusel (${trackId}) inicializado con ${totalSlides} slides.`);
    } else {
        carouselTrack.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay elementos para mostrar en el carrusel.</p>';
        console.warn(`carousel.js: No hay datos para inicializar el carrusel (${trackId}).`);
    }
}

/**
 * Crea un elemento de slide para un banner.
 * @param {Object} banner - Objeto con los datos del banner (id, title, description, imageUrl, link, buttonText).
 * @returns {HTMLElement} El elemento div del slide.
 */
function createBannerSlideElement(banner) {
    const slideElement = document.createElement('div');
    slideElement.classList.add('carousel-slide');
    slideElement.style.backgroundImage = `url(${banner.imageUrl})`;
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-label', `Slide ${banner.title}`);

    slideElement.innerHTML = `
        <div class="carousel-slide-content">
            <h2>${banner.title}</h2>
            <p>${banner.description}</p>
            ${banner.link ? `<a href="${banner.link}" class="btn-primary">${banner.buttonText || 'Ver más'}</a>` : ''}
        </div>
    `;
    return slideElement;
}

/**
 * Crea un elemento de slide para un producto (similar a una product-card).
 * @param {Object} product - Objeto con los datos del producto.
 * @returns {HTMLElement} El elemento div del slide/tarjeta de producto.
 */
function createProductSlideElement(product) {
    const slideElement = document.createElement('div');
    slideElement.classList.add('carousel-slide', 'product-carousel-card'); // Añadir clase específica
    slideElement.setAttribute('role', 'group');
    slideElement.setAttribute('aria-label', `Producto: ${product.name}`);

    // Reutiliza la estructura de product-card para la visualización en el carrusel
    let priceHtml = `<span class="product-price">$${product.price.toLocaleString('es-CO')}</span>`;
    if (product.isOnOffer && product.offerPrice) {
        priceHtml = `
            <span class="product-price offer-price">$${product.offerPrice.toLocaleString('es-CO')}</span>
            <span class="original-price">$${product.price.toLocaleString('es-CO')}</span>
        `;
    }

    const badgesHtml = `
        ${product.isNew ? '<span class="badge new">Nuevo</span>' : ''}
        ${product.isOnOffer ? '<span class="badge offer">Oferta</span>' : ''}
    `;

    slideElement.innerHTML = `
        <div class="product-card" data-id="${product.id}">
            <div class="product-badges">${badgesHtml}</div>
            <img src="${product.imageUrl}" alt="${product.name}" class="product-card-image" loading="lazy">
            <h3>${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <div class="product-rating">
                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                (${product.rating})
            </div>
            <p class="product-price-container">${priceHtml}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">Agregar al Carrito</button>
        </div>
    `;
    return slideElement;
}


/**
 * Muestra un slide específico del carrusel.
 * @param {number} index - El índice del slide a mostrar.
 */
function showSlide(index) {
    if (totalSlides === 0) return;

    // Lógica para carrusel infinito
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
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
