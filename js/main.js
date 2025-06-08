// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js'; // Asegurarse de que toast está importado

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    await loadInitialData(); // Asegura que los datos estén cargados antes de cualquier renderizado/setup

    initCart();
    updateCartCount(); // Actualiza el contador del carrito inicial

    // Inicializa el carrusel SOLO si appState.banners tiene datos
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('No hay datos de banners para inicializar el carrusel.');
    }


    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    // Pasa appState.products directamente a renderProducts
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });

    // Configura filtros y marcas solo si hay datos de productos y marcas cargados
    if (appState.products.length > 0) {
        setupProductFilters(appState.products);
    } else {
        console.warn('No hay productos para configurar filtros.');
    }
    if (appState.brands.length > 0) {
        renderBrands(appState.brands);
    } else {
        console.warn('No hay marcas para renderizar.');
    }

    setupSearch(); // La búsqueda depende de appState.products que ya está cargado
    setupBottomNavListeners(); // Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pasa el número de teléfono desde contactInfo

    // Si había una funcionalidad de modal de búsqueda por categoría que se eliminó, asegúrate de que no se llama.
    // main.js:144 Modal de búsqueda por categoría no encontrado. La funcionalidad no estará disponible.
    // La línea que causaba esto (setupCategorySearchModal();) debería estar comentada o eliminada.
});

async function loadInitialData() {
    try {
        const productsResponse = await fetch('data/products.json'); // Ruta corregida a la carpeta 'data/'
        const configResponse = await fetch('data/config.json');     // Ruta corregida a la carpeta 'data/'

        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status} al cargar data/products.json`);
        }
        if (!configResponse.ok) {
            throw new Error(`HTTP error! status: ${configResponse.status} al cargar data/config.json`);
        }

        appState.products = await productsResponse.json();
        const config = await configResponse.json();
        appState.banners = config.banners;
        appState.brands = config.brands;
        appState.contactInfo = {
            contactPhone: config.contactPhone,
            contactEmail: config.contactEmail,
            address: config.address
        };

        console.log('Datos iniciales cargados exitosamente.');
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification('Error crítico: No se pudieron cargar los datos principales de la tienda. Por favor, recarga la página o inténtalo más tarde.', 'error', 10000);
    }
}

// Función para manejar el scroll y la navegación inferior activa
function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const bottomNavSearch = document.getElementById('bottomNavSearch'); // Añadir listener al ícono de búsqueda
    const bottomNavCart = document.getElementById('bottomNavCart');     // Añadir listener al ícono del carrito

    // Listener para el botón de búsqueda del bottom nav
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            // Simular clic en el botón de búsqueda del header
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus(); // Enfocar el campo de búsqueda
                // Puedes también simular un clic en el botón de búsqueda del header si lo deseas
                // document.getElementById('searchButton').click();
            }
            // Desplazar a la sección de licores para ver los resultados de búsqueda
            const licoresSection = document.getElementById('licores');
            if (licoresSection) {
                licoresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Listener para el botón de carrito del bottom nav
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(); // Abre/Cierra el sidebar del carrito
        });
    }


    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        // Define los IDs de tus secciones principales que quieres que se reflejen en el nav inferior
        const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'otras-bebidas', 'marcas', 'soporte'];

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section) {
                // Ajusta el offset según el tamaño de tu header o cualquier elemento fijo
                const offset = 150; // Para que la sección se active antes de que llegue al tope exacto
                if (window.scrollY + window.innerHeight / 2 >= section.offsetTop) {
                    currentActiveSection = sections[i];
                    break;
                }
            }
        }

        // Caso especial para "novedades" si estamos al principio de la página
        if (window.scrollY < (document.getElementById('licores') ? document.getElementById('licores').offsetTop - 150 : 0)) {
            currentActiveSection = 'novedades';
        }


        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            // Quitar el '#' para comparar con el ID de la sección
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
}
