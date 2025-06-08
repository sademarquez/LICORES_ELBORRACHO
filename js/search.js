// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
import { showToastNotification } from './toast.js'; // Asegúrate de importar toast

export function setupSearch() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput'); // Este es el input dentro del modal
    const searchButton = document.getElementById('searchButton'); // Este es el botón dentro del modal
    const searchResultsGrid = document.getElementById('searchResultsGrid'); // NUEVO: Contenedor para los resultados de búsqueda

    if (!searchModal || !searchInput || !searchButton || !searchResultsGrid) {
        console.warn('search.js: Algunos elementos del modal de búsqueda no se encontraron. La funcionalidad de búsqueda podría estar limitada.');
        return;
    }

    // Opcional: Si quieres que el campo de búsqueda principal (header) también abra el modal,
    // asegúrate de que el ID `mainSearchInput` o `mainSearchButton` redirija a `bottomNavSearch` o active el modal directamente.
    // Pero para mantener la consistencia con el flujo del `bottom-nav`, nos enfocaremos en el modal.

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = [];

        if (searchTerm.length > 0) { // Solo busca si hay un término
            filteredProducts = appState.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        } else {
            // Si el campo de búsqueda está vacío, no se muestran productos.
            // showToastNotification('Ingresa un término de búsqueda.', 'info');
        }

        // Renderiza los productos filtrados en el *nuevo* contenedor de resultados dentro del modal
        renderProducts(filteredProducts, '#searchResultsGrid'); // Usamos el nuevo contenedor para resultados

        // Mostrar un mensaje si no hay resultados
        if (searchTerm.length > 0 && filteredProducts.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">No se encontraron resultados para "${searchTerm}".</p>`;
        } else if (searchTerm.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        }

        // Si se encontraron resultados y el modal está abierto, puedes opcionalmente
        // desplazar al inicio de los resultados si el modal es muy largo.
        // searchResultsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Limpiar resultados al abrir el modal (opcional, para una experiencia más limpia)
    searchModal.addEventListener('click', (event) => {
        // Si el modal se abre, y no es un clic en el input o botón de búsqueda, limpiar
        if (event.target === searchModal && searchInput.value !== '') {
            searchInput.value = ''; // Limpiar el input
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`; // Limpiar resultados visuales
        }
    });

    // NOTA: La lógica para abrir/cerrar el modal de búsqueda ya está en main.js (bottomNavSearch)
    // No la duplicamos aquí.

    console.log('search.js: Módulo de búsqueda configurado.');
}
