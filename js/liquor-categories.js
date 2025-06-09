// js/liquor-categories.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
import { initProductCarousel } from './product-carousel.js'; // Reutilizamos el carrusel genérico

let categoriesContainer;
let productsCarouselTrack;
let productsCarouselPrevBtn;
let productsCarouselNextBtn;

/**
 * Configura la navegación de categorías para la sección de licores y el carrusel de productos asociado.
 * @param {Array<Object>} allProducts - Todos los productos disponibles en la appState.
 * @param {HTMLElement} categoriesNavContainer - El contenedor para los botones/tarjetas de categoría.
 * @param {HTMLElement} carouselTrackElement - El track del carrusel donde se mostrarán los productos de la categoría seleccionada.
 * @param {HTMLElement} prevBtnElement - Botón para el carrusel anterior.
 * @param {HTMLElement} nextBtnElement - Botón para el carrusel siguiente.
 */
export function setupLiquorCategories(productsData, fullProductsList, categoriesNavContainer, carouselTrackElement, prevBtnElement, nextBtnElement) {
    categoriesContainer = categoriesNavContainer;
    productsCarouselTrack = carouselTrackElement;
    productsCarouselPrevBtn = prevBtnElement;
    productsCarouselNextBtn = nextBtnElement;

    if (!categoriesContainer || !productsCarouselTrack || !productsCarouselPrevBtn || !productsCarouselNextBtn) {
        console.warn('liquor-categories.js: Elementos necesarios para la sección de licores no encontrados. Inicialización abortada.');
        return;
    }

    // Obtener todas las categorías únicas de licores (asumiendo que 'Licor' es la categoría principal)
    // También se podrían obtener todas las categorías de `appState.products` y luego filtrar por las que son licores si es un subconjunto
    const liquorCategories = [
        ...new Set(fullProductsList
            .filter(p => p.category === 'Licor') // Filtrar solo licores
            .map(p => p.brand || p.category) // Usar marca como subcategoría o la categoría principal
        )
    ].sort(); // Ordenar alfabéticamente

    // Añadir una categoría "Todos los Licores"
    liquorCategories.unshift('Todos los Licores');

    renderCategoryButtons(liquorCategories);

    // Inicializar la vista con "Todos los Licores"
    filterAndRenderProductsByCategory('Todos los Licores');

    console.log('liquor-categories.js: Módulo de categorías de licores configurado.');
}

/**
 * Renderiza los botones de categoría en el contenedor de navegación.
 * @param {Array<string>} categories - Array de nombres de categorías.
 */
function renderCategoryButtons(categories) {
    categoriesContainer.innerHTML = ''; // Limpiar botones existentes

    const categoryIcons = {
        'Todos los Licores': 'fas fa-wine-bottle',
        'Licor': 'fas fa-glass-whiskey', // Genérico para licor
        'Aguardiente caucano': 'fas fa-fire',
        'Ron Viejo de Caldas': 'fas fa-wine-glass-alt',
        'Buchanan\'s': 'fas fa-glass-martini-alt',
        'Cerveza': 'fas fa-beer',
        'Club Colombia': 'fas fa-beer-mug-empty',
        'Corona': 'fas fa-lemon', // O un icono de botella de cerveza más genérico
        'Poker': 'fas fa-dice', // O un icono de botella de cerveza más genérico
        'Snack': 'fas fa-cookie-bite',
        'Cigarrillos': 'fas fa-smoking',
        'Bebida no alcohólica': 'fas fa-cocktail'
        // Puedes añadir más iconos para marcas específicas si lo deseas
    };


    categories.forEach((categoryName, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('category-card');
        categoryCard.dataset.category = categoryName;

        const iconClass = categoryIcons[categoryName] || 'fas fa-glass-whiskey'; // Icono predeterminado
        
        categoryCard.innerHTML = `
            <i class="${iconClass}"></i>
            <h4>${categoryName}</h4>
        `;
        categoriesContainer.appendChild(categoryCard);

        categoryCard.addEventListener('click', () => {
            // Eliminar clase 'active' de todas las tarjetas y añadirla a la seleccionada
            document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
            categoryCard.classList.add('active');
            filterAndRenderProductsByCategory(categoryName);
        });

        // Activar la primera categoría por defecto
        if (index === 0) {
            categoryCard.classList.add('active');
        }
    });
}

/**
 * Filtra los productos por la categoría seleccionada y los renderiza en el carrusel 2x2.
 * @param {string} selectedCategory - El nombre de la categoría seleccionada.
 */
function filterAndRenderProductsByCategory(selectedCategory) {
    let productsToShow = appState.products.filter(p => p.category === 'Licor'); // Siempre filtramos por licores

    if (selectedCategory !== 'Todos los Licores') {
        productsToShow = productsToShow.filter(p => p.brand === selectedCategory || p.category === selectedCategory);
    }
    
    // Inicializar el carrusel de productos 2x2
    // Pasamos 4 productos por página para simular el 2x2 (2 columnas x 2 filas)
    // El CSS del carrusel ya define el layout 2x2 para sus elementos
    initProductCarousel(productsToShow, '#liquorProductsCarouselTrack', '#liquorProductsPrev', '#liquorProductsNext', 4, '200px', '20px'); // 200px es el ancho de la tarjeta, 20px el gap
}
