// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js';

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
    if (options.isOnOffer) { // Añadir filtro para ofertas
        filteredProducts = filteredProducts.filter(p => p.isOnOffer);
    }
    if (options.category) {
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }


    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay productos disponibles en esta sección.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const displayPrice = product.isOnOffer ? product.offerPrice : product.price;

        // Modificación aquí: Simplificar el contenido de la tarjeta
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                ${product.isNew ? '<span class="product-badge new">Nuevo</span>' : ''}
                ${product.isOnOffer ? '<span class="product-badge offer">Oferta</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <div class="product-price">
                    ${product.isOnOffer ? `<span class="original-price">$${product.price.toLocaleString('es-CO')}</span>` : ''}
                    <span class="current-price">$${displayPrice.toLocaleString('es-CO')}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-add-to-cart" data-id="${product.id}" aria-label="Agregar ${product.name} al carrito">
                    <i class="fas fa-shopping-cart"></i> Agregar
                </button>
            </div>
        `;

        // Añadir el evento al botón de añadir al carrito
        const addToCartButton = productCard.querySelector('.btn-add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const productToAdd = appState.products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                }
            });
        }

        container.appendChild(productCard);
    });
}


// Nuevo: Función para renderizar los botones de categoría
export function renderCategoryButtons(categoriesData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de categorías no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Limpiar cualquier contenido existente

    if (categoriesData.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay categorías disponibles.</p>`;
        return;
    }

    // Añadir botón "Todas" por defecto
    const allButton = document.createElement('button');
    allButton.classList.add('category-button', 'active'); // Activa por defecto
    allButton.dataset.category = 'all';
    allButton.textContent = 'Todas';
    container.appendChild(allButton);

    categoriesData.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.classList.add('category-button');
        categoryButton.dataset.category = category;
        categoryButton.textContent = category;
        container.appendChild(categoryButton);
    });

    // Añadir event listener para la delegación de eventos en los botones de categoría
    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('category-button')) {
            const selectedCategory = event.target.dataset.category;

            // Remover la clase 'active' de todos los botones y añadirla al clicado
            container.querySelectorAll('.category-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Actualizar el filtro de categoría en appState y aplicar filtros
            const brandFilter = document.getElementById('licorBrandFilter');
            const priceFilter = document.getElementById('licorPriceFilter');
            const productSearchInput = document.getElementById('licorProductSearch');
            
            // Llama a applyFilters con la categoría seleccionada
            applyFilters(selectedCategory, brandFilter.value, priceFilter.value, productSearchInput.value);
        }
    });
}


// Modificación: setupProductFilters para aceptar una categoría inicial/activa
export function setupProductFilters(allProducts, brandFilterSelector, priceFilterSelector, productSearchInputSelector, targetGridSelector, initialCategory = 'all') {
    const brandFilter = document.querySelector(brandFilterSelector);
    const priceFilter = document.querySelector(priceFilterSelector);
    const productSearchInput = document.querySelector(productSearchInputSelector);
    const categoryFiltersContainer = document.getElementById('categoryFilters'); // Obtener el contenedor de categorías

    // Variable para mantener la categoría actualmente seleccionada
    let currentCategory = initialCategory;

    // Asegurarse de que el botón "Todas" esté activo inicialmente
    if (categoryFiltersContainer) {
        const allButton = categoryFiltersContainer.querySelector('.category-button[data-category="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }
    }


    // Listener para los botones de categoría (ya configurado en renderCategoryButtons, pero lo duplicamos aquí para claridad)
    // Se elimina el listener de click aquí y se deja solo en `renderCategoryButtons` para evitar duplicidad.
    // En su lugar, el `applyFilters` se llamará desde `renderCategoryButtons` con la categoría correcta.
    if (categoryFiltersContainer) {
        categoryFiltersContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('category-button')) {
                currentCategory = event.target.dataset.category;
                
                // Actualiza el estado activo de los botones de categoría
                categoryFiltersContainer.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');

                applyFilters(); // Aplicar filtros con la nueva categoría
            }
        });
    }

    const applyFilters = () => {
        let filtered = [...allProducts];

        // 1. Filtrar por CATEGORÍA
        if (currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === currentCategory);
        }

        // 2. Filtrar por BÚSQUEDA
        const searchTerm = productSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // 3. Filtrar por MARCA
        const selectedBrand = brandFilter.value;
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // 4. Ordenar por PRECIO
        const priceOrder = priceFilter.value;
        if (priceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (priceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        // Renderiza los productos filtrados en el contenedor objetivo
        renderProducts(filtered, targetGridSelector); // Ya no se necesita pasar la categoría a renderProducts aquí
    };

    // Populate brand filter options
    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
    brandFilter.innerHTML = '<option value="">Todas las Marcas</option>';
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });


    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);

    // Ejecutar filtros al inicio para asegurar que el grid se renderice con la categoría correcta
    applyFilters();
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
}
