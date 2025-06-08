// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount } from './cart.js';
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
    updateCartCount();

    initCarousel(appState.banners);

    // Renderizar productos por nuevas categorías
    renderProducts(appState.products, '#newProductsGrid', { limit: 8, isNew: true });
    renderProducts(appState.products, '#licoresGrid', { category: 'Licores' }); // Sección principal de licores
    renderProducts(appState.products, '#bebidasGrid', { category: 'Bebidas' }); // Otras bebidas (sin alcohol)
    renderProducts(appState.products, '#snacksGrid', { categories: ['Comida', 'Dulces', 'Cigarrillos'] }); // Snacks y más

    setupProductFilters(appState.products); // Filtros para la sección principal (Licores)
    setupSearch();
    renderBrands(appState.brands);
    setupMobileMenu();
    setupSupport(appState.contactInfo.contactPhone); // Pasa el número de WhatsApp a support.js

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

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        // Cerrar menú móvil al hacer clic en un enlace o fuera del menú
        mainNav.addEventListener('click', (e) => {
            // Cierra si se hace clic en un enlace (A) o en un elemento de lista (LI)
            if (e.target.tagName === 'A' || e.target.tagName === 'LI') {
                mainNav.classList.remove('active');
                // Restaura el ícono de hamburguesa
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });

        // Opcional: Cerrar el menú si se hace clic fuera de él en pantallas grandes
        window.addEventListener('click', (e) => {
            if (window.innerWidth > 767 && mainNav.classList.contains('active') && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                mainNav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    }
}
