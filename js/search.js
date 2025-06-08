// js/search.js

import { appState } from './main.js';
import { renderProducts } from './products.js';
import { showToastNotification } from './toast.js';

export function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const allProductsGrid = document.getElementById('allProductsGrid');
    const brandFilter = document.getElementById('brandFilter'); // Para resetear filtros al buscar

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
            showToastNotification(`Mostrando resultados para "${searchTerm}"`, 'info');
            
            // Si hay una búsqueda, resetear el filtro de marca para mostrar todos los resultados relevantes
            if (brandFilter) {
                brandFilter.value = "";
            }
        } else {
            // Si la búsqueda está vacía, mostrar todos los productos y resetear filtro de marca
            showToastNotification('Mostrando todos los productos.', 'info');
            if (brandFilter) {
                brandFilter.value = "";
            }
        }

        renderProducts(filteredProducts, '#allProductsGrid');
        // Desplazarse a la sección de todos los productos donde se muestran los resultados de la búsqueda
        document.getElementById('todos-los-productos').scrollIntoView({ behavior: 'smooth' });
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita que se recargue la página si el input está dentro de un form
            performSearch();
        }
    });

    // Limpiar la barra de búsqueda al cambiar de sección (navegación general)
    document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (searchInput.value !== '') {
                searchInput.value = '';
                // Opcional: volver a renderizar todos los productos si se limpia la búsqueda al navegar
                // renderProducts(appState.products, '#allProductsGrid');
            }
        });
    });

    console.log('Módulo de búsqueda configurado.');
}
