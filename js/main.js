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
    setupSupport(appState.contactInfo.contactPhone); // Pasa el número de teléfono

    // setupMobileMenu(); // Comentado o removido, según tu comentario original
    // setupCategorySearchModal(); // Comentado o removido, según tu comentario original
    // NOTA: Si necesitas el modal de búsqueda por categoría, descomenta esta línea y asegúrate de que el HTML del modal exista.
});

async function loadInitialData() {
    try {
        // *** CAMBIO CRÍTICO AQUÍ: AJUSTAR LAS RUTAS PARA REFLEJAR LA CARPETA 'data/' ***
        const productsResponse = await fetch('data/products.json');
        const configResponse = await fetch('data/config.json');

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
        // Podrías mostrar un mensaje al usuario aquí
        // showToastNotification('No se pudieron cargar los datos principales. Por favor, inténtalo de nuevo más tarde.', 'error');
    }
}

// Función para manejar el scroll y la navegación inferior activa
function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Deshabilita la navegación inferior de forma predeterminada
    // bottomNavItems.forEach(item => item.classList.add('disabled')); // Descomenta si quieres deshabilitar por defecto

    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        // Define los IDs de tus secciones principales que quieres que se reflejen en el nav inferior
        const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'otras-bebidas', 'soporte'];

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
