// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
import { showToastNotification } from './toast.js'; // Importar showToastNotification

export function setupSearch() {
    const searchInput = document.getElementById('productSearchInput'); // Reutiliza el input de filtro de productos
    const searchButton = document.getElementById('searchIcon'); // Icono de búsqueda del header
    const allProductsGrid = document.getElementById('allProductsGrid'); // Cuadrícula principal de productos (Licores)

    // Verificación de existencia de elementos. bottomNavSearch es manejado en main.js
    if (!searchInput || !searchButton || !allProductsGrid) {
        console.warn('Elementos de búsqueda no encontrados. La búsqueda principal podría no funcionar completamente.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = [];

        if (searchTerm) {
            filteredProducts = appState.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
            showToastNotification(`Resultados de búsqueda para "${searchTerm}"`, 'info');
        } else {
            // Si la búsqueda está vacía, muestra todos los licores por defecto en la sección de Licores
            filteredProducts = appState.products.filter(product => product.category === 'Licor');
            showToastNotification('Mostrando todos los licores.', 'info');
        }

        // Renderiza los productos filtrados en la cuadrícula principal de productos (Licores)
        renderProducts(filteredProducts, '#allProductsGrid', { category: 'Licor' }); // Asegura que se filtre por categoría aquí
        // Desplaza a la sección principal de licores para ver los resultados
        document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
    };

    searchButton.addEventListener('click', () => {
        // Al hacer clic en el icono de búsqueda del header, desplaza a la sección de Licores
        // y opcionalmente puede enfocar el input de búsqueda
        document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
        searchInput.focus();
        // No ejecutar performSearch aquí, ya que el input tiene un listener 'input' para eso
    });

    searchInput.addEventListener('input', performSearch); // Se usa 'input' para búsqueda en tiempo real
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(); // Ejecutar búsqueda también con Enter
            searchInput.blur(); // Quitar el foco del input después de Enter
        }
    });

    console.log('Módulo de búsqueda configurado.');
}
