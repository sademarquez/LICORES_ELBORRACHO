// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js'; // Importar toast para manejo de errores

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    // Intenta cargar datos iniciales y maneja posibles errores
    const dataLoaded = await loadInitialData();
    if (!dataLoaded) {
        // Si los datos esenciales no cargan, muestra un mensaje crítico al usuario
        showToastNotification('Error crítico: No se pudieron cargar los datos de la tienda. Por favor, intenta recargar la página.', 'error', 10000);
        console.error('La aplicación no pudo inicializarse completamente debido a errores de carga de datos.');
        return; // Detiene la inicialización de la app si los datos esenciales fallan
    }

    // Inicialización de módulos que dependen de appState o del DOM cargado
    initCart();
    updateCartCount(); // Actualiza el contador del carrito inicial

    initCarousel(appState.banners); // Requiere appState.banners
    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });


    setupProductFilters(appState.products); // Requiere appState.products
    setupSearch(); // Depende de appState.products internamente
    renderBrands(appState.brands); // Requiere appState.brands
    setupBottomNavListeners(); // Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Requiere appState.contactInfo.contactPhone

    setupScrollHighlight(); // Para resaltar la navegación inferior al hacer scroll

    console.log('Aplicación inicializada con éxito. Estado final:', appState); // Para depuración
});

/**
 * Carga los datos iniciales (configuración y productos) de forma asíncrona.
 * Retorna true si la carga es exitosa, false en caso de error.
 */
async function loadInitialData() {
    try {
        console.log('Intentando cargar config.json y products.json desde la carpeta data...');
        const [configResponse, productsResponse] = await Promise.all([
            fetch('./data/config.json'), // Ruta corregida
            fetch('./data/products.json') // Ruta corregida
        ]);

        if (!configResponse.ok) {
            console.error(`HTTP error! status: ${configResponse.status} for config.json. Response:`, await configResponse.text());
            throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);
        }
        if (!productsResponse.ok) {
            console.error(`HTTP error! status: ${productsResponse.status} for products.json. Response:`, await productsResponse.text());
            throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        }

        const configData = await configResponse.json();
        const productsData = await productsResponse.json();

        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            contactPhone: configData.contactPhone,
            contactEmail: configData.contactEmail,
            address: configData.address
        };
        appState.products = productsData; // Asigna los productos cargados al appState
        console.log('Datos iniciales cargados con éxito.');
        return true; // Éxito
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification(`Error al cargar la información inicial: ${error.message}.`, 'error', 5000);
        return false; // Fallo
    }
}

/**
 * Configura los listeners para la barra de navegación inferior (bottom-nav).
 */
function setupBottomNavListeners() {
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const searchModal = document.getElementById('searchModal');
    const closeSearchBtn = document.getElementById('closeSearchBtn');

    if (bottomNavSearch && searchModal && closeSearchBtn) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.style.display = 'block';
            document.body.classList.add('no-scroll');
        });

        closeSearchBtn.addEventListener('click', () => {
            searchModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === searchModal) {
                searchModal.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        });
    } else {
        console.warn('Algunos elementos de la barra de navegación inferior (búsqueda) no se encontraron.');
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Fuerza a abrir el carrito
        });
    } else {
        console.warn('El botón de carrito de la barra inferior no se encontró.');
    }
}

/**
 * Resalta el ítem activo en la barra de navegación inferior según la sección visible.
 */
function setupScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    if (sections.length === 0 || bottomNavItems.length === 0) {
        console.warn('No se encontraron secciones o ítems de navegación inferior para el resaltado de scroll.');
        return;
    }

    window.addEventListener('scroll', () => {
        let currentActiveSectionId = 'novedades'; // Por defecto, si estamos al principio

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Un offset para que la sección se active un poco antes de que su borde superior toque la parte superior de la ventana
            if (scrollY >= sectionTop - 200) { // Aumentado el offset para mejor UX
                currentActiveSectionId = section.id;
            }
        });

        // Caso especial para la sección de Novedades si estamos al principio de la página
        // o si ninguna otra sección ha sido desplazada lo suficiente para activarse
        if (scrollY < document.getElementById('licores').offsetTop - 200) {
             currentActiveSectionId = 'novedades';
        }


        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSectionId) {
                item.classList.add('active');
            }
        });
    }, { passive: true }); // Usar passive: true para mejorar el rendimiento del scroll
}

// ... (setupMobileMenu() permanece comentado/removido según tu decisión)
