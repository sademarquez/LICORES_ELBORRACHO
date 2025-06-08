// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';

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
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });


    setupProductFilters(appState.products); // Esto afectará solo la sección principal de licores por su ID
    setupSearch();
    renderBrands(appState.brands);
    setupBottomNavListeners(); // NUEVO: Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pasa el número de teléfono desde contactInfo

    setupScrollHighlight(); // Para resaltar la navegación inferior al hacer scroll

    // console.log('Estado inicial de la aplicación:', appState); // Para depuración

});

async function loadInitialData() {
    try {
        // --- CORRECCIÓN AQUÍ: CAMBIO DE RUTA PARA config.json y products.json ---
        const [configResponse, productsResponse] = await Promise.all([
            fetch('./data/config.json'), // Ruta correcta: están en la carpeta 'data'
            fetch('./data/products.json') // Ruta correcta: están en la carpeta 'data'
        ]);

        if (!configResponse.ok) throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);
        if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);

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

    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        // showToastNotification('Error al cargar la información inicial. Por favor, recarga la página.', 'error');
        // Considera mostrar un mensaje al usuario si los datos esenciales no cargan
    }
}

// ... (el resto de tu código main.js, incluyendo setupBottomNavListeners y setupScrollHighlight)

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
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Fuerza a abrir el carrito
        });
    }
}


function setupScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Un offset para que la sección se active un poco antes de que su borde superior toque la parte superior de la ventana
            if (scrollY >= sectionTop - 150) {
                currentActiveSection = section.id;
            }
        });

        // Caso especial para la sección de Novedades si estamos al principio de la página
        if (scrollY < document.getElementById('licores').offsetTop - 150) {
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
