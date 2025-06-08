// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
import { showToastNotification } from './toast.js';

let searchModal;
let searchInput;
let searchButton;
let searchResultsGrid;
let closeSearchModalBtn; // Añadir referencia al botón de cerrar

export function setupSearch() {
    searchModal = document.getElementById('searchModal');
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchButton');
    searchResultsGrid = document.getElementById('searchResultsGrid');
    closeSearchModalBtn = document.getElementById('closeSearchModalBtn'); // Obtener el botón de cerrar

    if (!searchModal || !searchInput || !searchButton || !searchResultsGrid || !closeSearchModalBtn) {
        console.warn('search.js: Algunos elementos del modal de búsqueda no se encontraron. La funcionalidad de búsqueda podría estar limitada.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = [];

        if (searchTerm.length > 0) {
            filteredProducts = appState.products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                (product.description ? product.description.toLowerCase().includes(searchTerm) : false)
            );
            // Renderizar los productos encontrados en la cuadrícula de resultados
            renderProducts(filteredProducts, '#searchResultsGrid');
        } else {
            // Si el término de búsqueda está vacío, limpiar resultados y mostrar mensaje inicial
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
        }

        if (searchTerm.length > 0 && filteredProducts.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">No se encontraron resultados para "${searchTerm}".</p>`;
        }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Cerrar el modal al hacer clic en el botón de cerrar
    closeSearchModalBtn.addEventListener('click', () => {
        toggleSearchModal(false);
    });

    // Limpiar resultados al abrir el modal (opcional, para una experiencia más limpia)
    searchModal.addEventListener('click', (event) => {
        if (event.target === searchModal) { // Solo si el clic fue en el fondo oscuro
            toggleSearchModal(false); // Cerrar el modal
        }
    });

    console.log('search.js: Módulo de búsqueda configurado.');
}

/**
 * Muestra u oculta el modal de búsqueda.
 * @param {boolean} open - Si es true, abre el modal; si es false, lo cierra.
 */
export function toggleSearchModal(open) {
    if (searchModal) {
        if (typeof open === 'boolean') {
            searchModal.style.display = open ? 'flex' : 'none';
        } else {
            // Alternar estado si no se especifica 'open'
            searchModal.style.display = searchModal.style.display === 'flex' ? 'none' : 'flex';
        }

        // Limpiar el input y los resultados cada vez que se abre el modal
        if (searchModal.style.display === 'flex') {
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
            searchInput.focus(); // Enfocar el input para una mejor UX
        }
    }
}
