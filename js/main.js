// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Posiblemente para otro carrusel de productos
import { initAgeVerification } from './age-verification.js';
import { initContinuousProductCarousel } from './continuous-carousel.js'; // Para carruseles de logos/marcas

// ... (resto del código de appState) ...

async function loadInitialData() {
    try {
        // ... (cargas de config.json y products.json existentes) ...

        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };

        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

        // console.log('main.js: Datos iniciales cargados.', appState); // ELIMINADO
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Recarga la página.', 'error');
        throw error; // Propagar el error para detener la inicialización de la app
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initAgeVerification();

    // Retrasar la inicialización del resto de la app hasta que la edad sea verificada
    // o el modal no exista. Asume que initAgeVerification() maneja el display.
    // Esto es un placeholder, la lógica real debería esperar a que el modal se oculte.
    // Para simplificar y avanzar, asumiremos que si ya pasó la verificación o no hay modal, se continúa.

    try {
        await loadInitialData();

        // Paso 1: Inicializar Carrusel Principal (Banners)
        // Asegúrate de que el ID 'carouselTrack' y 'carouselDots' existen en index.html
        initCarousel(appState.banners);

        // Paso 2: Renderizar Carruseles de Productos (Novedades y Ofertas)
        // Usamos IDs específicos para los tracks de estos carruseles
        // Nota: initContinuousProductCarousel está diseñado para logos/marcas.
        // Para productos, simplemente renderizaremos las tarjetas en los tracks respectivos.
        const newProducts = appState.products.filter(p => p.isNew);
        const offerProducts = appState.products.filter(p => p.isOnOffer);

        // En products.js, necesitas una función para renderizar productos en un contenedor dado.
        // Aquí llamaremos a renderProducts con los IDs de los tracks.
        // Asegúrate de que los IDs 'newProductsTrack' y 'offerProductsTrack' existen en index.html
        renderProducts(newProducts, 'newProductsTrack');
        renderProducts(offerProducts, 'offerProductsTrack');


        // Paso 3: Renderizar Cuadrícula de Todos los Productos
        // Asegúrate de que el ID 'allProductsGrid' existe en index.html
        renderProducts(appState.products, 'allProductsGrid');

        // Paso 4: Inicializar Carrusel Continuo de Marcas
        // Asegúrate de que el ID 'continuousCarouselTrack' existe en index.html
        initContinuousProductCarousel(appState.brands, 'continuousCarouselTrack', 'Marcas Destacadas');

        // Paso 5: Configurar filtros de productos (si tienes una sección de filtros)
        // Si la sección 'allProductsGridSection' tiene filtros asociados.
        setupProductFilters(appState.products, 'allProductsGridSection');


        // Paso 6: Inicializar el carrito
        initCart();
        updateCartCount(); // Asegurarse de que el contador del carrito se actualice al inicio


        // Paso 7: Configurar búsqueda
        setupSearch();

        // Paso 8: Configurar soporte
        setupSupport();

        // Paso 9: Configurar los oyentes de eventos de UI generales
        setupUIEventListeners();

        // Paso 10: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // ... (actualización de información de contacto en footer/contacto existente) ...

        // console.log('main.js: Aplicación inicializada completamente.'); // ELIMINADO

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});

// Nota: Las funciones setupUIEventListeners y setupBottomNavActiveState
// deberían estar definidas en main.js o importadas desde otro módulo.
// Si no existen, créalas o imporítalas.

function setupUIEventListeners() {
    // Ejemplo:
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    const cartIcon = document.getElementById('cartIcon'); // Icono del carrito en el header
    const bottomNavCart = document.getElementById('bottomNavCart'); // Icono del carrito en el bottom nav
    if (cartIcon) {
        cartIcon.addEventListener('click', () => toggleCartSidebar(true));
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => toggleCartSidebar(true));
    }

    const searchIcon = document.getElementById('searchIcon'); // Icono de búsqueda en el header
    const bottomNavSearch = document.getElementById('bottomNavSearch'); // Icono de búsqueda en el bottom nav
    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => toggleSearchModal(true));
    }

    // Cerrar sidebar del carrito al hacer clic fuera
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        document.addEventListener('click', (event) => {
            if (cartSidebar.classList.contains('open') && !cartSidebar.contains(event.target) && !event.target.closest('#cartIcon') && !event.target.closest('#bottomNavCart')) {
                toggleCartSidebar(false);
            }
        });
    }

}

function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${entry.target.id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 }); // Ajusta el threshold según sea necesario

    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejar clics directos en los elementos del bottom nav para desplazamiento suave
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Asegúrate de actualizar la clase activa también en el click
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}
