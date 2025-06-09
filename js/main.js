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
    renderProducts(appState.products, '#allProductsGridOtros', { category: 'Otra Bebida' });
    renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 4 }); // Novedades

    // Configuración de filtros (para la cuadrícula principal de productos, si aplica)
    setupProductFilters(appState.products);

    // Renderizar marcas
    renderBrands(appState.brands);

    // Setup de búsqueda
    setupSearch();

    // Setup de soporte, pasando el número de teléfono desde config.json
    setupSupport(appState.contactInfo.contactPhone);

    // Setup de navegación inferior (bottom-nav)
    setupBottomNav();

    // Setup de la barra lateral del carrito
    const cartIcon = document.getElementById('cartIcon');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const searchModal = document.getElementById('searchModal');
    const bottomNavSearch = document.getElementById('bottomNavSearch');

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir carrito al hacer clic en el ícono del header
        });
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir carrito al hacer clic en el ícono del bottom nav
        });
    }

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchModal) {
                searchModal.style.display = 'block'; // Abre el modal de búsqueda
            }
        });
    }
});

async function loadInitialData() {
    try {
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`HTTP error! status: ${configResponse.status}`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            contactEmail: configData.contactEmail,
            contactPhone: configData.contactPhone,
            address: configData.address
        };

        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        appState.products = await productsResponse.json();

        console.log('Datos iniciales cargados:', appState);
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información del sitio. Inténtalo de nuevo más tarde.', 'error');
    }
}

function setupBottomNav() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Manejar clics en los elementos del bottom-nav para desplazamiento suave
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Si el href es una URL interna (ancla), prevenimos el comportamiento por defecto
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            // Los ítems de búsqueda y carrito tienen su propia lógica de clic en el listener principal
        });
    });

    // Resaltar la sección activa en el bottom-nav al hacer scroll
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
