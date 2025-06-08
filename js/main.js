// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { initAgeVerification } from './age-verification.js'; // Importamos la función

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

    // *** NUEVA LÍNEA DE DEBUGGING PARA PRODUCTOS ***
    console.log('Productos cargados en appState:', appState.products.length, 'productos encontrados.');
    if (appState.products.length === 0) {
        console.error('¡Advertencia! appState.products está vacío. Los productos no se mostrarán.');
        // Puedes agregar una notificación al usuario aquí si lo deseas
    }
    // ***********************************************

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
    setupSupport(appState.contactInfo.contactPhone);
    initAgeVerification(); // Llama a la función de verificación de edad
});

async function loadInitialData() {
    try {
        const [productsResponse, configResponse] = await Promise.all([
            fetch('products.json'),
            fetch('config.json')
        ]);

        if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        if (!configResponse.ok) throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);

        appState.products = await productsResponse.json();
        const configData = await configResponse.json();
        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            contactEmail: configData.contactEmail,
            contactPhone: configData.contactPhone,
            address: configData.address
        };
        console.log('Datos iniciales cargados:', appState);
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        // Podrías mostrar un mensaje de error en la UI aquí si los datos son cruciales
    }
}

// Escucha para abrir/cerrar el menú en móviles
document.addEventListener('click', (e) => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const searchInput = document.getElementById('searchInput');

    // Manejar el toggle del menú principal
    if (menuToggle && mainNav && menuToggle.contains(e.target)) {
        mainNav.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    } else if (mainNav && !mainNav.contains(e.target) && mainNav.classList.contains('active') && !menuToggle.contains(e.target)) {
        // Cerrar menú si se hace clic fuera, pero no si se hizo clic en el toggle
        mainNav.classList.remove('active');
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');
    }

    // Manejar la apertura del input de búsqueda en el bottom nav
    if (bottomNavSearch && bottomNavSearch.contains(e.target)) {
        e.preventDefault(); // Previene el scroll si el href es #
        if (searchInput) {
            searchInput.classList.toggle('active');
            if (searchInput.classList.contains('active')) {
                searchInput.focus(); // Enfoca el input al abrirlo
            } else {
                searchInput.value = ''; // Limpia el input al cerrarlo
                // Dispara un evento de 'input' para que la búsqueda se reinicie si el input se limpia
                searchInput.dispatchEvent(new Event('input')); 
            }
        }
    } else if (searchInput && !searchInput.contains(e.target) && !e.target.closest('.search-box') && searchInput.classList.contains('active')) {
        // Cierra el input de búsqueda si se hace clic fuera de él o del botón de búsqueda
        searchInput.classList.remove('active');
        searchInput.value = ''; // Limpia el input al cerrarlo
        searchInput.dispatchEvent(new Event('input')); // Dispara el evento para actualizar la búsqueda
    }
});


function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
            toggleCartSidebar(); // Abre o cierra el sidebar del carrito
        });
    }

    // Listener para resaltar la sección activa en el nav inferior
    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Un offset para que cambie antes de que la sección esté completamente arriba
            const offset = 200; 

            if (scrollY >= sectionTop - offset && scrollY < sectionTop + sectionHeight - offset) {
                currentActiveSection = section.id;
            }
        });

        // Si estamos muy arriba, asegurar que 'novedades' sea la activa
        // Esto maneja el caso cuando el scroll está en el principio de la página
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
