// js/products.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';
import { addToCart } from './cart.js'; // Asegúrate de importar addToCart

export function renderProducts(productsToRender, containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor no encontrado para renderizar productos: ${containerSelector}`);
        return;
    }

    let filteredProducts = [...productsToRender];

    if (options.isNew) {
        filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
    }
    if (options.category) { // Filtrar por categoría si se especifica
        filteredProducts = filteredProducts.filter(p => p.category === options.category);
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
        const oldPriceHtml = product.isOnOffer ? `<span class="old-price">$${product.price.toLocaleString('es-CO')}</span>` : '';

        const tagsHtml = product.isOnOffer ? '<span class="tag">Oferta</span>' : '';
        const newTagHtml = product.isNew && !product.isOnOffer ? '<span class="tag new">Nuevo</span>' : ''; // "Nuevo" solo si no está en oferta

        productCard.innerHTML = `
            ${tagsHtml}
            ${newTagHtml}
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="product-description-collapsed">${product.description}</p>
            <button class="product-details-toggle">Ver más</button>
            <div class="price">
                $${displayPrice.toLocaleString('es-CO')}
                ${oldPriceHtml}
            </div>
            <div class="rating">
                ${'⭐'.repeat(Math.floor(product.rating))} (${product.rating})
            </div>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Añadir
            </button>
        `;

        // Event listener para el botón de añadir al carrito
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        // Lógica para el toggle de la descripción
        const descriptionElement = productCard.querySelector('.product-description-collapsed');
        const toggleButton = productCard.querySelector('.product-details-toggle');

        if (descriptionElement && toggleButton) {
            // Verificar si la descripción es más larga que la altura colapsada
            // Esto es un hack. Lo ideal sería calcular la altura real de la descripción completa vs la altura colapsada
            // Para una solución más robusta, se podría medir `scrollHeight` vs `clientHeight`
            // Sin embargo, para mantenerlo simple y funcional con el CSS, se asume que si tiene más de un número X de caracteres, es desplegable.
            // O mejor aún, verificar si el `overflow` está activo (esto requiere un reflow, que puede ser costoso)
            // Una forma simple es comparar la `scrollHeight` después de quitar la clase de colapsado.

            // Clonar para medir sin afectar el DOM visible
            const tempDescription = descriptionElement.cloneNode(true);
            tempDescription.classList.remove('product-description-collapsed'); // Quitar la clase para medir altura completa
            tempDescription.style.position = 'absolute'; // Para que no afecte el layout
            tempDescription.style.visibility = 'hidden';
            tempDescription.style.maxHeight = 'none'; // Quitar el max-height
            document.body.appendChild(tempDescription); // Añadir temporalmente al DOM

            const isOverflowing = tempDescription.scrollHeight > descriptionElement.clientHeight;
            document.body.removeChild(tempDescription); // Eliminar el clon

            if (!isOverflowing) {
                toggleButton.style.display = 'none'; // Ocultar si no hay desbordamiento
            } else {
                let isExpanded = false;
                toggleButton.addEventListener('click', () => {
                    isExpanded = !isExpanded;
                    if (isExpanded) {
                        descriptionElement.classList.remove('product-description-collapsed');
                        toggleButton.textContent = 'Ver menos';
                    } else {
                        descriptionElement.classList.add('product-description-collapsed');
                        toggleButton.textContent = 'Ver más';
                    }
                });
            }
        }


        container.appendChild(productCard);
    });
}


export function renderBrands(brandsData) {
    const brandsContainer = document.getElementById('brandsCarousel');
    if (!brandsContainer) {
        console.warn('Contenedor de marcas no encontrado. No se pueden renderizar las marcas.');
        return;
    }

    brandsContainer.innerHTML = ''; // Limpiar el contenido existente

    if (brandsData && brandsData.length > 0) {
        brandsData.forEach(brand => {
            const brandLogoDiv = document.createElement('div');
            brandLogoDiv.classList.add('brand-logo');
            brandLogoDiv.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.name} Logo">`;
            brandsContainer.appendChild(brandLogoDiv);
        });
    } else {
        brandsContainer.innerHTML = `<p style="text-align: center; color: var(--text-color-light);">No hay marcas disponibles.</p>`;
    }
}


export function setupProductFilters(productsData) {
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const productSearchInput = document.getElementById('productSearchInput');

    if (!brandFilter || !priceFilter || !productSearchInput) {
        console.warn('Elementos de filtro de producto no encontrados. Los filtros no funcionarán.');
        return;
    }
    console.log('Filtros de producto configurados.');

    // Populate brand filter
    const brands = [...new Set(productsData.filter(p => p.category === 'Licor').map(product => product.brand))];
    brands.sort().forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });

    const applyFilters = () => {
        const selectedBrand = brandFilter.value;
        const selectedPriceOrder = priceFilter.value;
        const searchTerm = productSearchInput.value.toLowerCase().trim();

        // Filtra solo los productos de la categoría "Licor" para esta cuadrícula principal
        let filtered = productsData.filter(product => product.category === 'Licor');

        filtered = filtered.filter(product => {
            const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  product.brand.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm);
            return matchesBrand && matchesSearch;
        });

        if (selectedPriceOrder === 'asc') {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        } else if (selectedPriceOrder === 'desc') {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        }

        renderProducts(filtered, '#allProductsGrid', { category: 'Licor' }); // Asegura que se filtre por categoría aquí también
    };

    brandFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    productSearchInput.addEventListener('input', applyFilters);
}
