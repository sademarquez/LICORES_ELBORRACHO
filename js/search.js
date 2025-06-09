// js/search.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Importar la función para renderizar una sola tarjeta
import { showToastNotification } from './toast.js';

let searchModal;
let searchInput;
let searchButton;
let searchResultsGrid;

export function setupSearch() {
    searchModal = document.getElementById('searchModal');
    searchInput = document.getElementById('searchInput'); // Este es el input dentro del modal
    searchButton = document.getElementById('searchButton'); // Este es el botón dentro del modal
    searchResultsGrid = document.getElementById('searchResultsGrid'); // Contenedor para los resultados de búsqueda

    if (!searchModal || !searchInput || !searchButton || !searchResultsGrid) {
        console.warn('search.js: Algunos elementos del modal de búsqueda no se encontraron. La funcionalidad de búsqueda podría estar limitada.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = [];

        if (searchTerm.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
            return;
        }
        
        filteredProducts = appState.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );

        searchResultsGrid.innerHTML = ''; // Limpiar resultados anteriores

        if (filteredProducts.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">No se encontraron productos para "${searchTerm}".</p>`;
            showToastNotification(`No se encontraron resultados para "${searchTerm}".`, 'info', 3000);
        } else {
            filteredProducts.forEach(product => {
                const productCard = renderProductCard(product); // Usar la función de products.js
                searchResultsGrid.appendChild(productCard);
            });
            showToastNotification(`Se encontraron ${filteredProducts.length} resultados para "${searchTerm}".`, 'success', 3000);
        }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    console.log('search.js: Módulo de búsqueda configurado.');
}

/**
 * Alterna la visibilidad del modal de búsqueda.
 * @param {boolean} open - true para abrir, false para cerrar. Si se omite, alterna.
 */
export function toggleSearchModal(open) {
    if (searchModal) {
        if (typeof open === 'boolean') {
            searchModal.classList.toggle('open', open);
            searchModal.style.display = open ? 'flex' : 'none'; // Controlar display con JS para asegurar el centering
        } else {
            searchModal.classList.toggle('open'); // Toggle si no se especifica 'open'
            searchModal.style.display = searchModal.classList.contains('open') ? 'flex' : 'none';
        }

        if (searchModal.classList.contains('open')) {
            searchInput.focus(); // Autofocus al abrir el modal
            // Opcional: Limpiar resultados e input al abrir si no quieres mantener la búsqueda anterior
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        } else {
            // Limpiar al cerrar, aunque ya lo hacemos al abrir para mayor consistencia
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        }
    }
}
