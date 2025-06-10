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

    // Limpiar contenido previo para evitar duplicados
    categoryButtonsContainer.innerHTML = '';
    categoryProductTrack.innerHTML = '';

    // Obtener categorías únicas
    const categories = ['all', ...new Set(allProducts.map(p => p.category))];

    // Crear botones de categoría
    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        if (category === 'all') {
            button.textContent = 'Todos';
            button.dataset.category = 'all';
            button.classList.add('active'); // Activo por defecto
        } else {
            button.textContent = category;
            button.dataset.category = category;
        }
        categoryButtonsContainer.appendChild(button);
    });

    // Función para renderizar productos en el carrusel de categorías
    const renderCategoryProducts = (productsToRender) => {
        categoryProductTrack.innerHTML = '';
        if (productsToRender.length === 0) {
            categoryProductTrack.innerHTML = '<p class="text-center text-text-color-light text-lg w-full">No hay productos en esta categoría.</p>';
            return;
        }
        productsToRender.forEach(product => {
            const productCard = renderProductCard(product);
            productCard.classList.add('continuous-carousel-product-card'); // Usa estilos de tarjeta de carrusel continuo
            categoryProductTrack.appendChild(productCard);
        });
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
}
