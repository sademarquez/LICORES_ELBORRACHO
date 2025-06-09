// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renders products into a grid or a 2x2 carousel format.
 * @param {Array<Object>} productsToRender - The array of product objects to display.
 * @param {string} containerSelector - The CSS selector for the container where products will be rendered.
 * This should now be the `.product-carousel-track` or `.product-grid` ID.
 * @param {Object} options - Options for filtering and rendering.
 * @param {boolean} options.isNew - Filter for new products.
 * @param {boolean} options.isOnOffer - Filter for products on offer.
 * @param {string} options.category - Filter by product category.
 * @param {boolean} options.isCarousel - True if rendering into a 2x2 carousel, false for a standard grid.
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    // Apply initial filters based on options
    if (options.isNew) {
        filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (options.isOnOffer) {
        filteredProducts = filteredProducts.filter(p => p.isOnOffer);
    }
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }
    // `limit` option is no longer directly applied here for carousels as we render all, then slide.
    // For non-carousel grids (like search results), it might still be useful if you had pagination.

    container.innerHTML = ''; // Clear existing content

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    // Determine if it's a carousel or a static grid based on the HTML structure
    const isCarouselContainer = container.classList.contains('product-carousel-track');

    if (isCarouselContainer) {
        // --- Carousel 2x2 logic ---
        const productsPerSlide = 4; // For a 2x2 grid
        let slideIndex = 0;

        for (let i = 0; i < filteredProducts.length; i += productsPerSlide) {
            const slideProducts = filteredProducts.slice(i, i + productsPerSlide);

            const slideElement = document.createElement('div');
            slideElement.classList.add('product-carousel-slide');
            slideElement.dataset.slideIndex = slideIndex++; // Assign a slide index

            slideProducts.forEach(product => {
                const productCard = createProductCardElement(product);
                slideElement.appendChild(productCard);
            });
            container.appendChild(slideElement);
        }

        // Initialize product carousel navigation for this specific container's parent
        // The parent of product-carousel-track is product-carousel-container
        setupProductCarouselNavigation(container.parentElement);

    } else {
        // --- Standard Grid (e.g., for search results) ---
        filteredProducts.forEach(product => {
            const productCard = createProductCardElement(product);
            container.appendChild(productCard);
        });
    }
}

/**
 * Creates and returns a product card HTML element.
 * @param {Object} product - The product data object.
 * @returns {HTMLElement} The created product card div.
 */
function createProductCardElement(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.dataset.id = product.id;

    const displayPrice = product.isOnOffer ? product.offerPrice : product.price;
    const priceHtml = product.isOnOffer
        ? `<p class="product-price offer-price">$${displayPrice.toLocaleString('es-CO')}</p><p class="product-old-price">$${product.price.toLocaleString('es-CO')}</p>`
        : `<p class="product-price">$${displayPrice.toLocaleString('es-CO')}</p>`;

    // Correct image path for products, ensuring they are rendered correctly
    const imageUrl = product.imageUrl.startsWith('images/products/') ? product.imageUrl : `images/products/${product.imageUrl}`;

    productCard.innerHTML = `
        ${product.isNew ? '<span class="product-badge new-badge">Nuevo</span>' : ''}
        ${product.isOnOffer ? '<span class="product-badge offer-badge">Oferta</span>' : ''}
        <img src="${imageUrl}" alt="${product.name}" class="product-image">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
        <div class="product-price-info">
            ${priceHtml}
        </div>
        <div class="product-rating">
            ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
            <span class="rating-value">(${product.rating})</span>
        </div>
        <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
            <i class="fas fa-shopping-cart"></i> Añadir
        </button>
    `;

    // Add to cart event listener
    const addToCartButton = productCard.querySelector('.add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click if it had one
            const productId = e.currentTarget.dataset.productId;
            const productToAdd = appState.products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            } else {
                showToastNotification('Error: Producto no encontrado para añadir al carrito.', 'error');
            }
        });
    }
    return productCard;
}


/**
 * Sets up navigation for a product carousel (2x2 grid).
 * @param {HTMLElement} carouselContainer - The `.product-carousel-container` element.
 */
function setupProductCarouselNavigation(carouselContainer) {
    const track = carouselContainer.querySelector('.product-carousel-track');
    const prevBtn = carouselContainer.querySelector('.carousel-nav-btn.prev');
    const nextBtn = carouselContainer.querySelector('.carousel-nav-btn.next');
    // Ensure we get the actual slide elements within the track
    const slides = Array.from(track.children).filter(child => child.classList.contains('product-carousel-slide'));
    const totalSlides = slides.length;
    let currentSlideIndex = 0;

    // Hide buttons if there's only one slide or no slides
    if (totalSlides <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
        return;
    } else {
        if(prevBtn) prevBtn.style.display = 'flex'; // Use flex to re-show (matches CSS display)
        if(nextBtn) nextBtn.style.display = 'flex';
    }

    const updateSlidePosition = () => {
        // Apply transform to the track to show the current slide
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

        // Update active class for accessibility/styling (optional, as transform does the visual)
        slides.forEach((slide, index) => {
            if (index === currentSlideIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            updateSlidePosition();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            updateSlidePosition();
        });
    }

    // Initial position
    updateSlidePosition();
}


// Existing functions for filters and brands remain the same, but ensure they call the updated renderProducts
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, categoryToFilter = null) {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('products.js: Algunos elementos de filtro de productos no se encontraron. La funcionalidad de filtro podría estar limitada.');
        return;
    }

    // Populate brand filter dropdown
    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="all">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        let filtered = categoryToFilter
            ? allProducts.filter(p => p.category === categoryToFilter)
            : [...allProducts];

        const selectedBrand = brandFilter.value;
        const priceOrder = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        if (selectedBrand !== 'all') {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        if (priceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (priceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo.
        // `isCarousel` option is implicitly handled by the containerSelector (whether it's a track or a grid).
        renderProducts(filtered, targetGridSelector);
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
}

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

    // Duplicate brands to ensure continuous loop for the infinite scroll animation
    const brandsToRender = [...brandsData, ...brandsData];

    brandsToRender.forEach(brand => {
        const brandDiv = document.createElement('div');
        brandDiv.classList.add('brand-logo');
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
        container.appendChild(brandDiv);
    });
}
