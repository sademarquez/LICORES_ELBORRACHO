// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renderiza productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de productos a renderizar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones de filtrado/visualización (isNew, isOnOffer, category, limit, gridColumns).
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    // Aplicar filtros iniciales basados en las opciones
    if (options.isNew) {
        filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (options.isOnOffer) {
        filteredProducts = filteredProducts.filter(p => p.isOnOffer);
    }
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }

    container.innerHTML = ''; // Limpiar contenido anterior

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    // Si se especifica un número de columnas para grid, aplicar la clase
    if (options.gridColumns === 2) {
        container.classList.add('product-grid-2x2');
    } else {
        container.classList.remove('product-grid-2x2'); // Asegurarse de que no tenga la clase si no es 2x2
    }


    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer ? `<span class="price old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const offerBadge = product.isOnOffer ? `<span class="badge offer">Oferta</span>` : '';
        const newBadge = product.isNew && !product.isOnOffer ? `<span class="badge new">Nuevo</span>` : ''; // Si es nuevo y NO en oferta

        productCard.innerHTML = `
            ${offerBadge}
            ${newBadge}
            <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <div class="price-container">
                ${oldPriceHtml}
                <span class="price ${product.isOnOffer ? 'offer-price' : ''}">$${displayPrice.toLocaleString('es-CO')}</span>
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
        `;

        // Event listener para el botón "Añadir al Carrito"
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                } else {
                    showToastNotification('Error: Producto no encontrado.', 'error');
                }
            });
        }

        container.appendChild(productCard);
    });
}

/**
 * Configura los filtros para la sección principal de productos.
 * @param {Array<Object>} productsData - Todos los productos disponibles.
 * @param {string} brandFilterSelector - Selector del elemento <select> para filtrar por marca.
 * @param {string} priceFilterSelector - Selector del elemento <select> para ordenar por precio.
 * @param {string} productSearchInputSelector - Selector del elemento <input> para buscar por texto.
 * @param {string} targetGridSelector - Selector del contenedor donde se renderizarán los productos filtrados.
 * @param {string} categoryToFilter - La categoría específica a filtrar para esta sección (ej. 'Licor').
 */
export function setupProductFilters(productsData, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, categoryToFilter) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);

    if (!brandFilter || !priceFilter || !productSearchInput || !document.querySelector(targetGridSelector)) {
        console.warn('setupProductFilters: Elementos de filtro o contenedor no encontrados. Saltando configuración de filtros.');
        return;
    }

    // Llenar el filtro de marcas dinámicamente
    const uniqueBrands = [...new Set(productsData.map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });


    const applyFilters = () => {
        let filtered = productsData;

        // 1. Filtrar por categoría (fija para esta sección)
        filtered = filtered.filter(p => p.category === categoryToFilter);

        // 2. Filtrar por marca
        const selectedBrand = brandFilter.value;
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // 3. Filtrar por texto de búsqueda
        const searchTerm = productSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm)
            );
        }

        // 4. Ordenar por precio
        const selectedPriceOrder = priceFilter.value;
        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector, { category: categoryToFilter });
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
}

/**
 * Renderiza marcas (logos) en un contenedor de carrusel.
 * @param {Array<Object>} brandsData - Array de objetos de marca.
 * @param {string} containerSelector - Selector CSS del contenedor.
 */
export function renderBrands(brandsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de marcas no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (brandsData.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay marcas disponibles.</p>`;
        return;
    }

    brandsData.forEach(brand => {
        const brandDiv = document.createElement('div');
        brandDiv.classList.add('brand-logo');
        // Lazy loading para los logos también
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo" loading="lazy">`;
        container.appendChild(brandDiv);
    });
}

// --- NUEVA FUNCIONALIDAD: PRODUCTOS POR CATEGORÍA CON CARRUSEL 2X2 ---

let dynamicProductCarouselTrack;
let dynamicProductCarouselPrevBtn;
let dynamicProductCarouselNextBtn;
let dynamicProductCarouselDotsContainer;
let currentDynamicSlide = 0;
let dynamicSlides = [];
let totalDynamicSlides = 0;


/**
 * Inicializa la sección de productos por categoría: crea los botones y maneja la visualización del carrusel.
 */
export function setupProductCategories() {
    const productCategoryNav = document.getElementById('productCategoryNav');
    dynamicProductCarouselTrack = document.getElementById('dynamicProductCarouselTrack');
    dynamicProductCarouselPrevBtn = document.getElementById('dynamicProductCarouselPrev');
    dynamicProductCarouselNextBtn = document.getElementById('dynamicProductCarouselNext');
    dynamicProductCarouselDotsContainer = document.getElementById('dynamicProductCarouselDots');


    if (!productCategoryNav || !dynamicProductCarouselTrack || !dynamicProductCarouselPrevBtn || !dynamicProductCarouselNextBtn || !dynamicProductCarouselDotsContainer) {
        console.warn('setupProductCategories: Elementos necesarios para la sección de categorías no encontrados.');
        return;
    }

    // Obtener categorías únicas de los productos
    const uniqueCategories = [...new Set(appState.products.map(p => p.category))].sort();

    // Crear botones para cada categoría
    productCategoryNav.innerHTML = '';
    uniqueCategories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        button.textContent = category;
        button.dataset.category = category; // Almacenar la categoría en el dataset
        productCategoryNav.appendChild(button);

        button.addEventListener('click', () => {
            // Eliminar clase 'active' de todos los botones
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            // Añadir clase 'active' al botón clicado
            button.classList.add('active');
            // Renderizar el carrusel de productos para la categoría seleccionada
            renderCategoryProductsCarousel(category);
        });
    });

    // Seleccionar la primera categoría por defecto al cargar la página
    if (uniqueCategories.length > 0) {
        const firstButton = productCategoryNav.querySelector('.category-btn');
        if (firstButton) {
            firstButton.classList.add('active');
            renderCategoryProductsCarousel(firstButton.dataset.category);
        }
    }

    // Configurar navegación del carrusel dinámico
    dynamicProductCarouselPrevBtn.addEventListener('click', () => showDynamicSlide(currentDynamicSlide - 1));
    dynamicProductCarouselNextBtn.addEventListener('click', () => showDynamicSlide(currentDynamicSlide + 1));
}

/**
 * Renderiza los productos de una categoría específica en un carrusel con cuadrículas 2x2.
 * @param {string} category - La categoría de productos a mostrar.
 */
function renderCategoryProductsCarousel(category) {
    const productsInCategory = appState.products.filter(p => p.category === category);

    dynamicProductCarouselTrack.innerHTML = '';
    dynamicProductCarouselDotsContainer.innerHTML = '';
    dynamicSlides = [];
    currentDynamicSlide = 0;

    if (productsInCategory.length === 0) {
        dynamicProductCarouselTrack.innerHTML = `<p style="text-align: center; width: 100%; padding: var(--spacing-xl); color: var(--text-color-light);">No hay productos en la categoría "${category}".</p>`;
        totalDynamicSlides = 0;
        updateDynamicCarouselControls();
        return;
    }

    // Agrupar productos en grupos de 4 para la cuadrícula 2x2
    const productsPerSlide = 4;
    for (let i = 0; i < productsInCategory.length; i += productsPerSlide) {
        const slideProducts = productsInCategory.slice(i, i + productsPerSlide);

        const slideElement = document.createElement('div');
        slideElement.classList.add('product-category-carousel-slide');

        const gridContainer = document.createElement('div');
        gridContainer.classList.add('product-grid-2x2'); // Clase para la cuadrícula 2x2

        // Renderizar los productos en la cuadrícula de este slide
        slideProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.id = product.id;

            const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
            const oldPriceHtml = product.isOnOffer ? `<span class="price old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
            const offerBadge = product.isOnOffer ? `<span class="badge offer">Oferta</span>` : '';
            const newBadge = product.isNew && !product.isOnOffer ? `<span class="badge new">Nuevo</span>` : '';

            productCard.innerHTML = `
                ${offerBadge}
                ${newBadge}
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <div class="price-container">
                    ${oldPriceHtml}
                    <span class="price ${product.isOnOffer ? 'offer-price' : ''}">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
            `;

            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    const productToAdd = appState.products.find(p => p.id === productId);
                    if (productToAdd) {
                        addToCart(productToAdd);
                    } else {
                        showToastNotification('Error: Producto no encontrado.', 'error');
                    }
                });
            }

            gridContainer.appendChild(productCard);
        });

        slideElement.appendChild(gridContainer);
        dynamicProductCarouselTrack.appendChild(slideElement);
        dynamicSlides.push(slideElement);

        // Crear punto de navegación
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => showDynamicSlide(Math.floor(i / productsPerSlide)));
        dynamicProductCarouselDotsContainer.appendChild(dot);
        dots.push(dot); // Añadir a los dots globales (o crear unos específicos para este carrusel)
    }

    totalDynamicSlides = dynamicSlides.length;
    showDynamicSlide(0); // Mostrar el primer slide
}

/**
 * Muestra un slide específico del carrusel de categorías.
 * @param {number} index - El índice del slide a mostrar.
 */
function showDynamicSlide(index) {
    if (totalDynamicSlides === 0) return;

    if (index < 0) {
        currentDynamicSlide = totalDynamicSlides - 1;
    } else if (index >= totalDynamicSlides) {
        currentDynamicSlide = 0;
    } else {
        currentDynamicSlide = index;
    }

    const offset = -currentDynamicSlide * 100;
    dynamicProductCarouselTrack.style.transform = `translateX(${offset}%)`;

    updateDynamicCarouselControls();
}

/**
 * Actualiza las clases 'active' de los slides y los puntos del carrusel de categorías.
 */
function updateDynamicCarouselControls() {
    dynamicSlides.forEach((slide, index) => {
        if (index === currentDynamicSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Actualizar los puntos del carrusel de categorías
    const dynamicDots = dynamicProductCarouselDotsContainer.querySelectorAll('.dot');
    dynamicDots.forEach((dot, index) => {
        if (index === currentDynamicSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Ocultar/mostrar botones si solo hay un slide
    if (totalDynamicSlides <= 1) {
        dynamicProductCarouselPrevBtn.style.display = 'none';
        dynamicProductCarouselNextBtn.style.display = 'none';
        dynamicProductCarouselDotsContainer.style.display = 'none';
    } else {
        dynamicProductCarouselPrevBtn.style.display = 'block';
        dynamicProductCarouselNextBtn.style.display = 'block';
        dynamicProductCarouselDotsContainer.style.display = 'flex';
    }
}
