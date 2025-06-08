// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
// import { showToastNotification } from './toast.js'; // Si quisieras toast en búsqueda, importas de toast.js

export function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    // allProductsGrid es donde se mostrarán los resultados de búsqueda
    const allProductsGrid = document.getElementById('allProductsGrid');

    if (!searchInput || !searchButton || !allProductsGrid) {
        console.warn('Elementos de búsqueda no encontrados. La búsqueda no funcionará.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = appState.products;

        if (searchTerm) {
            filteredProducts = appState.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        }

        // Renderiza los productos filtrados en la cuadrícula principal de productos (Licores)
        renderProducts(filteredProducts, '#allProductsGrid');
        // Desplaza a la sección principal de licores para ver los resultados
        document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
        // showToastNotification(`Resultados para "${searchTerm}"`, 'info'); // Ejemplo de uso
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    console.log('Módulo de búsqueda configurado.');
}
