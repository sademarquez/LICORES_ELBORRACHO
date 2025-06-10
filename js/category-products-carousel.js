// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Reutilizamos renderProductCard para crear tarjetas

/**
 * Configura la sección de carrusel de productos por categoría.
 * Esto incluye los botones de categoría y el track donde se renderizan los productos.
 * @param {Array<Object>} allProducts - El array completo de productos.
 * @param {string} sectionSelector - Selector CSS del contenedor principal de la sección (ej. '#categoryProductsSection').
 */
export function setupCategoryProductCarousel(allProducts, sectionSelector) {
    const sectionContainer = document.querySelector(sectionSelector);
    if (!sectionContainer) {
        console.error(`category-products-carousel.js: Sección de carrusel de categorías no encontrada: ${sectionSelector}`);
        return;
    }

    const categoryButtonsContainer = sectionContainer.querySelector('.category-buttons-container');
    const categoryProductTrack = sectionContainer.querySelector('#categoryProductTrack');

    if (!categoryButtonsContainer || !categoryProductTrack) {
        console.warn('category-products-carousel.js: Elementos clave (botones o track) no encontrados para la sección de categorías. Inicialización abortada.');
        return;
    }

    // Limpiar botones existentes si los hay (útil para recargas dinámicas)
    categoryButtonsContainer.innerHTML = '';

    // Crear un conjunto de categorías únicas de los productos
    const uniqueCategories = new Set(['all', ...allProducts.map(p => p.category)]); // 'all' siempre primero

    // Crear los botones de categoría dinámicamente
    uniqueCategories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        button.dataset.category = category;
        button.textContent = category === 'all' ? 'Todos' : category; // Mostrar 'Todos' en lugar de 'all'

        if (category === 'all') { // Establecer 'Todos' como activo por defecto
            button.classList.add('active');
        }
        categoryButtonsContainer.appendChild(button);
    });

    /**
     * Renderiza los productos para la categoría seleccionada en el track.
     * @param {Array<Object>} productsToDisplay - Los productos a renderizar.
     */
    const renderCategoryProducts = (productsToDisplay) => {
        categoryProductTrack.innerHTML = ''; // Limpiar productos previos

        if (productsToDisplay.length === 0) {
            categoryProductTrack.innerHTML = `<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay productos en esta categoría.</p>`;
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = renderProductCard(product);
            categoryProductTrack.appendChild(productCard);
        });

        console.log(`category-products-carousel.js: ${productsToDisplay.length} productos renderizados para la categoría.`);
    };

    // Añadir event listeners a los botones de categoría
    const categoryBtns = categoryButtonsContainer.querySelectorAll('.category-btn');
    categoryBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase 'active' de todos los botones
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            // Añadir clase 'active' al botón clickeado
            button.classList.add('active');

            const selectedCategory = button.dataset.category;
            let filteredProducts = [];

            if (selectedCategory === 'all') {
                filteredProducts = allProducts;
            } else {
                // Asegúrate de que la propiedad 'category' en products.json coincide con el 'data-category'
                filteredProducts = allProducts.filter(product => product.category === selectedCategory);
            }
            
            renderCategoryProducts(filteredProducts);
            // Asegúrate de que el carrusel se desplace al inicio al cambiar la categoría
            categoryProductTrack.scrollTo({ left: 0, behavior: 'smooth' });
        });
    });

    // Renderizar productos por defecto al inicio (ej. "Todos")
    const defaultCategoryBtn = categoryButtonsContainer.querySelector('.category-btn.active');
    if (defaultCategoryBtn) {
        const defaultCategory = defaultCategoryBtn.dataset.category;
        const initialProducts = defaultCategory === 'all' ? allProducts : allProducts.filter(p => p.category === defaultCategory);
        renderCategoryProducts(initialProducts);
    } else {
        // Si no hay botón 'active' por defecto, renderiza todos los productos
        renderCategoryProducts(allProducts);
    }

    console.log(`category-products-carousel.js: Carrusel de categorías \"${sectionSelector}\" inicializado.`);
}
