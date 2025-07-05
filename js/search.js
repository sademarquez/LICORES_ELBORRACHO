// js/search.js

import { appState } from './main.js';
import { renderProductCard } from './products.js'; // Importar la función para renderizar una sola tarjeta
import { showToastNotification } from './toast.js';

let searchModal;
let searchInput;
let searchButton;
let searchResultsGrid;
let closeSearchModalBtn; // Botón para cerrar el modal de búsqueda

export function setupSearch() {
    searchModal = document.getElementById('searchModal');
    searchInput = document.getElementById('searchInput'); // Este es el input dentro del modal
    searchButton = document.getElementById('searchButton'); // Este es el botón dentro del modal
    searchResultsGrid = document.getElementById('searchResultsGrid'); // Contenedor para los resultados de búsqueda
    closeSearchModalBtn = document.getElementById('closeSearchModalBtn'); // El botón de cerrar modal

    if (!searchModal || !searchInput || !searchButton || !searchResultsGrid || !closeSearchModalBtn) {
        console.warn('search.js: Algunos elementos del modal de búsqueda no se encontraron. La funcionalidad de búsqueda podría estar limitada.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = [];

        if (searchTerm.length < 2) { // Requiere al menos 2 caracteres para buscar
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa al menos 2 caracteres para buscar.</p>`;
            return;
        }

        filteredProducts = appState.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

        searchResultsGrid.innerHTML = ''; // Limpiar resultados anteriores

        if (filteredProducts.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">No se encontraron resultados para "${searchTerm}".</p>`;
        } else {
            filteredProducts.forEach(product => {
                const productCard = renderProductCard(product); // Reutiliza renderProductCard
                searchResultsGrid.appendChild(productCard);
            });
        }
    };

    // Event Listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));

    // console.log('search.js: Módulo de búsqueda configurado.'); // ELIMINADO para producción
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
            searchInput.value = ''; // Limpiar input al abrir
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        } else {
            // Limpiar al cerrar, aunque ya lo hacemos al abrir para mayor consistencia
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        }
    }
}
