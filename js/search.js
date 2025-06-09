// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
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
            (product.description && product.description.toLowerCase().includes(searchTerm)) // Asegura que la descripción exista
        );

        if (filteredProducts.length === 0) {
            searchResultsGrid.innerHTML = `<p class="no-results-message">No se encontraron productos para "${searchTerm}".</p>`;
        } else {
            // Reutiliza renderProducts para mostrar los resultados de búsqueda
            // Pasa un objeto vacío para las opciones para que renderProducts no los filtre adicionalmente
            renderProducts(filteredProducts, '#searchResultsGrid', {});
        }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Cerrar modal al hacer clic en el botón de cerrar
    const closeBtn = searchModal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleSearchModal(false));
    }

    // Cerrar modal al hacer clic fuera del contenido
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            toggleSearchModal(false);
        }
    });

    console.log('search.js: Módulo de búsqueda configurado.');
}

export function toggleSearchModal(open) {
    if (searchModal) {
        if (typeof open === 'boolean') {
            searchModal.classList.toggle('open', open);
        } else {
            searchModal.classList.toggle('open'); // Toggle si no se especifica 'open'
        }

        if (searchModal.classList.contains('open')) {
            searchInput.focus(); // Autofocus al abrir el modal
            // Limpiar resultados e input al abrir para una nueva búsqueda
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="no-results-message">Ingresa un término para buscar productos.</p>`;
            document.body.style.overflow = 'hidden'; // Evitar scroll del body
        } else {
            // Restablecer scroll del body al cerrar
            document.body.style.overflow = '';
        }
    }
}
