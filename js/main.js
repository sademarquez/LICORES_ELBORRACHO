// js/main.js (solo se añade una línea de importación, el resto ya estaba)
import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js'; // Importamos toggleCartSidebar también
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js'; // Asegúrate de importar toast.js si se va a usar aquí

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    await loadInitialData();

    initCart();
    updateCartCount(); // Actualiza el contador del carrito inicial

    initCarousel(appState.banners);
    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    renderProducts(appState.products, '#novedadesGrid', { isNew: true, limit: 8 }); // Mostrar novedades
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });


    setupProductFilters(appState.products); // Esto afectará solo la sección principal de licores por su ID
    setupSearch();
    renderBrands(appState.brands);
    setupBottomNavListeners(); // NUEVO: Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pasa solo el teléfono de contacto

    // Listener para el botón de búsqueda en la barra inferior (si no está ya)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                // Desplazarse a la sección de licores y enfocar el input de búsqueda
                document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
                searchInput.focus();
            } else {
                showToastNotification('Elemento de búsqueda no encontrado.', 'warning');
            }
        });
    }

    // Inicializar la verificación de edad (ya se inicializa con el DOMContentLoaded en age-verification.js)
    // No es necesario llamar una función aquí si el script ya lo hace al cargar.
});

async function loadInitialData() {
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('config.json'),
            fetch('products.json')
        ]);

        if (!configResponse.ok) throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);
        if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);

        appState.contactInfo = await configResponse.json();
        appState.banners = appState.contactInfo.banners; // Asignar banners desde config.json
        appState.brands = appState.contactInfo.brands; // Asignar marcas desde config.json

        const productsData = await productsResponse.json();
        appState.products = productsData;

        console.log('Datos iniciales cargados:', appState);
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información. Intenta de nuevo más tarde.', 'error');
    }
}

// Funciones para la navegación inferior (ya existían)
function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    window.addEventListener('scroll', () => {
        let currentActiveSection = '';
        const scrollY = window.scrollY;

        // Determinar la sección activa basada en el scroll
        document.querySelectorAll('section').forEach(section => {
            if (section.offsetTop <= scrollY + 150) { // +150px para activar antes
                currentActiveSection = section.id;
            }
        });

        // Caso especial para la parte superior de la página si es necesario
        if (scrollY < document.getElementById('licores').offsetTop - 150) {
            currentActiveSection = 'novedades'; // O la sección más alta relevante
        }

        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
}
