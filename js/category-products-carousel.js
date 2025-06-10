// js/category-products-carousel.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Reutilizamos renderProductCard para crear tarjetas

// Este módulo ya no necesita mantener referencias globales para cada carrusel de categoría,
// ya que la lógica de "carrusel de productos por categoría" ahora es única
// y se maneja por el cambio de botones.

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

    // Generar botones de categoría dinámicamente
    // Obtener categorías únicas de los productos
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];

    categoryButtonsContainer.innerHTML = ''; // Limpiar botones existentes

    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        if (category === 'all') {
            button.textContent = 'Todos';
            button.dataset.category = 'all';
            button.classList.add('active'); // Botón "Todos" activo por defecto
        } else {
            button.textContent = category;
            button.dataset.category = category;
        }
        categoryButtonsContainer.appendChild(button);
    });

    /**
     * Renderiza los productos para la categoría seleccionada en el track del carrusel.
     * @param {Array<Object>} productsToRender - Los productos filtrados por categoría.
     */
    const renderCategoryProducts = (productsToRender) => {
        categoryProductTrack.innerHTML = ''; // Limpiar el track
        if (productsToRender.length === 0) {
            categoryProductTrack.innerHTML = '<p class="empty-category-message">No hay productos en esta categoría.</p>';
            return;
        }
        productsToRender.forEach(product => {
            const productCard = renderProductCard(product); // Reutiliza la función de products.js
            categoryProductTrack.appendChild(productCard);
        });
    };

    // Event listeners para los botones de categoría
    const categoryBtns = categoryButtonsContainer.querySelectorAll('.category-btn');
    categoryBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Eliminar clase 'active' de todos los botones
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            // Añadir clase 'active' al botón clickeado
            button.classList.add('active');

            const selectedCategory = button.dataset.category;
            let filteredProducts = [];

            if (selectedCategory === 'all') {
                filteredProducts = allProducts;
            } else {
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

    // console.log(`category-products-carousel.js: Carrusel de categorías "${sectionSelector}" inicializado.`); // ELIMINADO para producción
}
