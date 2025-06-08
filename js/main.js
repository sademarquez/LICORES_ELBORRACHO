// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    const dataLoaded = await loadInitialData();
    if (!dataLoaded) {
        showToastNotification('Error crítico: No se pudieron cargar los datos de la tienda. Por favor, intenta recargar la página.', 'error', 10000);
        console.error('La aplicación no pudo inicializarse completamente debido a errores de carga de datos.');
        return;
    }

    initCart();
    updateCartCount();

    initCarousel(appState.banners);

    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });

    setupProductFilters(appState.products);
    setupSearch(); // Ahora search.js se encarga de sus propios elementos
    renderBrands(appState.brands);
    setupBottomNavListeners();
    setupSupport(appState.contactInfo.contactPhone);

    setupScrollHighlight();

    console.log('Aplicación inicializada con éxito. Estado final:', appState);
});

async function loadInitialData() {
    try {
        console.log('Intentando cargar config.json y products.json desde la carpeta data...');
        const [configResponse, productsResponse] = await Promise.all([
            fetch('./data/config.json'),
            fetch('./data/products.json')
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
        appState.products = productsData;
        console.log('Datos iniciales cargados con éxito.');
        return true;
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification(`Error al cargar la información inicial: ${error.message}.`, 'error', 5000);
        return false;
    }
}

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

        window.addEventListener('click', (event) => {
            if (event.target === searchModal) {
                searchModal.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        });
    } else {
        // Este console.warn se mantuvo porque bottomNavSearch es un elemento del nav inferior,
        // pero searchModal y closeSearchBtn *deben* existir para que el modal funcione.
        // Si no existen, sí es un problema.
        console.warn('main.js: Algunos elementos del modal de búsqueda (searchModal, closeSearchBtn) o del botón de búsqueda inferior (bottomNavSearch) no se encontraron.');
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    } else {
        console.warn('main.js: El botón de carrito de la barra inferior no se encontró.');
    }
}

function setupScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    if (sections.length === 0 || bottomNavItems.length === 0) {
        console.warn('main.js: No se encontraron secciones o ítems de navegación inferior para el resaltado de scroll.');
        return;
    }

    window.addEventListener('scroll', () => {
        let currentActiveSectionId = 'novedades';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                currentActiveSectionId = section.id;
            }
        });

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
    }, { passive: true });
}
