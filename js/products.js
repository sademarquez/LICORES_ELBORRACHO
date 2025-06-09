// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

/**
 * Renderiza una lista de productos en un contenedor específico.
 * @param {Array<Object>} productsToRender - Array de objetos de producto a renderizar.
 * @param {string} containerSelector - Selector CSS del contenedor donde se renderizarán los productos.
 * @param {Object} options - Opciones de filtrado/limitación (isNew, isOnOffer, category, limit).
 */
export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    // Aplicar filtros iniciales basados en las opciones pasadas a renderProducts
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
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light); padding: 20px;">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id; // Guarda el ID del producto para referencia

        // Determinar precio a mostrar (oferta vs. normal)
        const displayPrice = product.isOnOffer && product.offerPrice ? product.offerPrice : product.price;
        const oldPriceHtml = product.isOnOffer && product.offerPrice ? `<span class="product-old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';
        const priceClass = product.isOnOffer ? 'product-price offer-price' : 'product-price';

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-name" title="${product.name}">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="${priceClass}">$${displayPrice.toLocaleString('es-CO')}${oldPriceHtml}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Añadir event listeners a los botones "Añadir al Carrito"
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const product = appState.products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            } else {
                showToastNotification('Error: Producto no encontrado.', 'error');
            }
        });
    });
}

/**
 * Renderiza los botones de categoría y configura su funcionalidad de filtro.
 * @param {Array<string>} categories - Array de nombres de categorías únicas.
 * @param {string} buttonsContainerSelector - Selector CSS del contenedor de los botones de categoría.
 * @param {Array<Object>} allProducts - Todos los productos disponibles para filtrar.
 * @param {string} targetGridSelector - Selector CSS del grid donde se mostrarán los productos filtrados.
 */
export function renderCategoryButtons(categories, buttonsContainerSelector, allProducts, targetGridSelector) {
    const container = document.querySelector(buttonsContainerSelector);
    if (!container) {
        console.error(`Contenedor de botones de categoría no encontrado: ${buttonsContainerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar contenido anterior

    // Botón "Todos"
    const allButton = document.createElement('button');
    allButton.classList.add('category-button', 'active'); // Activo por defecto
    allButton.textContent = 'Todos';
    allButton.dataset.category = 'all';
    container.appendChild(allButton);

    allButton.addEventListener('click', () => {
        // Remover 'active' de todos los botones y añadirlo al clicado
        container.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        // Renderizar todos los productos sin filtro de categoría
        renderProducts(allProducts, targetGridSelector);
        // Resetear otros filtros si es necesario, o hacer que applyFilters maneje el 'all'
        // NOTA: setupProductFilters ya se encargará de esto al ser llamada con null para la categoría
        const productSearchInput = document.getElementById('licorProductSearch');
        const brandFilter = document.getElementById('licorBrandFilter');
        const priceFilter = document.getElementById('licorPriceFilter');
        if (productSearchInput) productSearchInput.value = '';
        if (brandFilter) brandFilter.value = '';
        if (priceFilter) priceFilter.value = '';
        applyFilters(allProducts, targetGridSelector, {
            productSearchInputId: 'licorProductSearch',
            brandFilterId: 'licorBrandFilter',
            priceFilterId: 'licorPriceFilter',
            initialCategory: null // No filtrar por categoría específica
        });
    });

    // Botones de categorías individuales
    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-button');
        button.textContent = category;
        button.dataset.category = category;
        container.appendChild(button);

        button.addEventListener('click', () => {
            // Remover 'active' de todos los botones y añadirlo al clicado
            container.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Renderizar productos solo de esta categoría
            // Pasamos la categoría activa a setupProductFilters
            const productSearchInput = document.getElementById('licorProductSearch');
            const brandFilter = document.getElementById('licorBrandFilter');
            const priceFilter = document.getElementById('licorPriceFilter');
            if (productSearchInput) productSearchInput.value = '';
            if (brandFilter) brandFilter.value = '';
            if (priceFilter) priceFilter.value = '';

            applyFilters(allProducts, targetGridSelector, {
                productSearchInputId: 'licorProductSearch',
                brandFilterId: 'licorBrandFilter',
                priceFilterId: 'licorPriceFilter',
                initialCategory: category // Filtrar por la categoría seleccionada
            });
        });
    });
}

/**
 * Función interna para aplicar todos los filtros y renderizar los productos.
 * Utilizada por setupProductFilters y los listeners de category buttons.
 * @param {Array<Object>} allProducts - Todos los productos disponibles.
 * @param {string} targetGridSelector - Selector CSS del grid donde se mostrarán los productos.
 * @param {Object} filterOptions - Opciones de filtros (IDs de elementos y categoría inicial).
 */
function applyFilters(allProducts, targetGridSelector, filterOptions) {
    const productSearchInput = document.getElementById(filterOptions.productSearchInputId);
    const brandFilter = document.getElementById(filterOptions.brandFilterId);
    const priceFilter = document.getElementById(filterOptions.priceFilterId);

    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
    const selectedBrand = brandFilter ? brandFilter.value : '';
    const priceOrder = priceFilter ? priceFilter.value : '';

    // Obtener la categoría activa de los botones de categoría
    const activeCategoryButton = document.querySelector('#categoryFilters .category-button.active');
    let activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : (filterOptions.initialCategory || null);

    // Si el botón "Todos" está activo, la categoría activa es nula para no filtrar por categoría
    if (activeCategory === 'all') {
        activeCategory = null;
    }


    let filtered = [...allProducts];

    // 1. Filtrar por categoría (si hay una activa)
    if (activeCategory && activeCategory !== 'all') { // Asegurarse de no filtrar por 'all'
        filtered = filtered.filter(p => p.category === activeCategory);
    }

    // 2. Filtrar por término de búsqueda
    if (searchTerm) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }

    // 3. Filtrar por marca
    if (selectedBrand) {
        filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // 4. Ordenar por precio
    if (priceOrder === 'asc') {
        filtered.sort((a, b) => (a.isOnOffer ? a.offerPrice : a.price) - (b.isOnOffer ? b.offerPrice : b.price));
    } else if (priceOrder === 'desc') {
        filtered.sort((a, b) => (b.isOnOffer ? b.offerPrice : b.price) - (a.isOnOffer ? a.offerPrice : a.price));
    }

    // Renderiza los productos filtrados en el contenedor objetivo
    renderProducts(filtered, targetGridSelector);
}


/**
 * Configura los event listeners para los filtros de productos.
 * @param {Array<Object>} allProducts - Todos los productos disponibles.
 * @param {string} brandFilterId - ID del select de filtro por marca.
 * @param {string} priceFilterId - ID del select de filtro por precio.
 * @param {string} productSearchInputId - ID del input de búsqueda de productos.
 * @param {string} targetGridSelector - Selector CSS del grid donde se mostrarán los productos.
 * @param {string|null} initialCategory - La categoría que debe estar activa al inicio, o null para todos.
 */
export function setupProductFilters(allProducts, brandFilterId, priceFilterId, productSearchInputId, targetGridSelector, initialCategory = null) {
    const brandFilter = document.getElementById(brandFilterId);
    const priceFilter = document.getElementById(priceFilterId);
    const productSearchInput = document.getElementById(productSearchInputId);
    const licorSearchBtn = document.getElementById('licorSearchBtn');


    // Poblar el filtro de marcas
    if (brandFilter) {
        const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>'; // Opción por defecto
        uniqueBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Función para aplicar los filtros (se envuelve para pasar los parámetros correctos)
    const curriedApplyFilters = () => {
        applyFilters(allProducts, targetGridSelector, {
            productSearchInputId,
            brandFilterId,
            priceFilterId,
            initialCategory: document.querySelector('#categoryFilters .category-button.active')?.dataset.category || initialCategory
        });
    };

    // Añadir event listeners
    if (brandFilter) brandFilter.addEventListener('change', curriedApplyFilters);
    if (priceFilter) priceFilter.addEventListener('change', curriedApplyFilters);
    if (productSearchInput) {
        productSearchInput.addEventListener('input', curriedApplyFilters); // Filtrar en tiempo real
        // También puedes tener un botón si prefieres que la búsqueda sea explícita
        if(licorSearchBtn) licorSearchBtn.addEventListener('click', curriedApplyFilters);
    }


    // Aplicar filtros inicialmente para renderizar la primera vista
    // Se asegura de que la categoría inicial sea la activa al cargar
    // Buscar el botón de categoría activo o activar el inicial
    const categoryButtons = document.querySelectorAll('#categoryFilters .category-button');
    let categoryToActivate = initialCategory || 'all'; // 'all' si no se especifica una categoría inicial

    categoryButtons.forEach(button => {
        if (button.dataset.category === categoryToActivate) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Llamar a applyFilters una vez para la carga inicial con la categoría ya marcada como activa
    applyFilters(allProducts, targetGridSelector, {
        productSearchInputId,
        brandFilterId,
        priceFilterId,
        initialCategory: categoryToActivate
    });

    console.log('products.js: Filtros de productos configurados.');
}


// Función para renderizar marcas (como en el carrusel de marcas)
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
        brandDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
        container.appendChild(brandDiv);
    });

    // Añadir controles de carrusel simple para marcas
    const brandsCarouselContainer = container.closest('.brands-carousel-container');
    if (brandsCarouselContainer) {
        const prevBtn = brandsCarouselContainer.querySelector('.brands-carousel-button.prev');
        const nextBtn = brandsCarouselContainer.querySelector('.brands-carousel-button.next');

        if (prevBtn && nextBtn) {
            const scrollAmount = 200; // Cantidad de scroll en píxeles

            prevBtn.addEventListener('click', () => {
                container.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            nextBtn.addEventListener('click', () => {
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
    }
}
