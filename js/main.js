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
    setupSupport(appState.contactInfo.contactPhone);

    console.log('Aplicación inicializada con éxito.');
});

async function loadInitialData() {
    try {
        const productsResponse = await fetch('data/products.json');
        const configResponse = await fetch('data/config.json');

        if (!productsResponse.ok) throw new Error('Error al cargar productos');
        if (!configResponse.ok) throw new Error('Error al cargar configuración');

        appState.products = await productsResponse.json();
        const config = await configResponse.json();
        appState.banners = config.banners || [];
        appState.brands = config.brands || [];
        appState.contactInfo = {
            contactPhone: config.contactPhone,
            contactEmail: config.contactEmail
        };
        console.log('Banners cargados:', appState.banners.length);
        console.log('Marcas cargadas desde config.json:', appState.brands.length);
        console.log('Información de contacto cargada:', appState.contactInfo);

    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
    }
}

// NUEVA FUNCIÓN: Configura los listeners para la barra de navegación inferior
function setupBottomNavListeners() {
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const searchInput = document.getElementById('searchInput'); // La barra de búsqueda principal en el header

    // Para la búsqueda: al hacer clic en el icono de búsqueda inferior, enfocar la barra de búsqueda principal
    if (bottomNavSearch && searchInput) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            // Desplazar la página a la sección de filtros/productos y luego enfocar el input de búsqueda
            // Asumiendo que la sección #licores contiene la barra de búsqueda principal
            document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { // Pequeño retraso para asegurar el scroll antes de enfocar
                searchInput.focus();
            }, 300);
        });
    }

    // Para el carrito: al hacer clic en el icono de carrito inferior, abrir el sidebar
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abre el sidebar del carrito
        });
    }

    // Lógica para resaltar el ítem activo en la barra inferior al hacer scroll
    const sections = document.querySelectorAll('main section[id]');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    window.addEventListener('scroll', () => {
        let currentActiveSection = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            // Un offset para que la sección se considere activa un poco antes de llegar a su top
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentActiveSection = section.id;
            }
        });

        // Asegurarse de que el "Inicio" (Novedades) esté activo al principio de la página
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


// Función setupMobileMenu() comentada/removida, ya que la barra inferior la reemplaza
// function setupMobileMenu() {
//     const menuToggle = document.getElementById('menuToggle');
//     const mainNav = document.querySelector('.main-nav');

//     if (menuToggle && mainNav) {
//         menuToggle.addEventListener('click', () => {
//             mainNav.classList.toggle('active');
//             menuToggle.querySelector('i').classList.toggle('fa-bars');
//             menuToggle.querySelector('i').classList.toggle('fa-times');
//         });

//         mainNav.addEventListener('click', (e) => {
//             if (e.target.tagName === 'A' || e.target.tagName === 'LI') {
//                 mainNav.classList.remove('active');
//                 menuToggle.querySelector('i').classList.remove('fa-times');
//                 menuToggle.querySelector('i').classList.add('fa-bars');
//             }
//         });
//     }
// }
