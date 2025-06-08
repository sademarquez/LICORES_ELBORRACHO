// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';

export function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    // MODIFICADO: Usar el ID de la nueva sección principal de licores para mostrar resultados
    const mainProductGrid = document.getElementById('licoresGrid');

    if (!searchInput || !searchButton || !mainProductGrid) {
        console.warn('Elementos de búsqueda no encontrados. La búsqueda no funcionará.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = appState.products; // Busca en todos los productos

        if (searchTerm) {
            filteredProducts = appState.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        }

        renderProducts(filteredProducts, '#licoresGrid'); // Renderiza en la sección principal
        // MODIFICADO: Desplazarse a la sección principal de licores después de la búsqueda
        document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    console.log('Módulo de búsqueda configurado.');
}
