// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount } from './cart.js';
import { setupSupport, renderServices, renderFAQs, renderContactInfo, renderSocialLinks } from './support.js'; // NUEVO: Importar funciones de support.js para renderizar servicios, FAQs y contacto.
import { showToastNotification } from './toast.js'; // Importar showToastNotification para errores de carga.

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}, // Para almacenar todos los datos de contacto y redes sociales
    services: [],    // NUEVO: Para servicios técnicos
    serviceFaqs: [], // NUEVO: Para FAQ de servicio técnico
    socialLinks: []  // NUEVO: Para enlaces de redes sociales
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    try {
        await loadInitialData(); // Carga todos los datos iniciales
    } catch (error) {
        console.error('Fallo al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información de la tienda. Por favor, intenta de nuevo más tarde.', 'error');
        // Si no se cargan los datos esenciales, puedes deshabilitar algunas funcionalidades o mostrar un mensaje prominente.
        return; // Detener la inicialización si los datos esenciales fallan.
    }

    initCart();
    updateCartCount();

    initCarousel(appState.banners);
    renderProducts(appState.products, '#newProductsGrid', { limit: 8, isNew: true }); // Muestra 8 productos nuevos
    renderProducts(appState.products, '#allProductsGrid');
    renderProducts(appState.products, '#accessoriesGrid', { category: 'Accesorio' });

    setupProductFilters(appState.products);
    setupSearch();
    renderBrands(appState.brands); // Pasa las marcas cargadas desde config.json
    setupMobileMenu();

    // NUEVO: Renderizar servicios, FAQs y contacto usando los datos de appState
    renderServices(appState.services, '#service-list');
    renderFAQs(appState.serviceFaqs, '#service-faq-container');
    renderContactInfo(appState.contactInfo, '#contactInfoSection');
    renderSocialLinks(appState.socialLinks, '#socialLinksFooter');

    // Setup de soporte que ahora puede usar más datos de contacto de appState
    setupSupport(appState.contactInfo);

    // Actualizar año en el footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    console.log('Aplicación inicializada con éxito.');
});

async function loadInitialData() {
    try {
        const [productsResponse, configResponse] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/config.json')
        ]);

        if (!productsResponse.ok) throw new Error('Error al cargar productos');
        if (!configResponse.ok) throw new Error('Error al cargar configuración');

        const products = await productsResponse.json();
        const config = await configResponse.json();

        appState.products = products || [];
        appState.banners = config.banners || [];
        appState.brands = config.brands || [];
        appState.contactInfo = { // Guardar toda la información de contacto
            contactPhone: config.contactPhone,
            contactEmail: config.contactEmail,
            address: config.address,
            openingHours: config.openingHours
        };
        appState.services = config.services || []; // Cargar servicios
        appState.serviceFaqs = config.serviceFaqs || []; // Cargar FAQs de servicio técnico
        appState.socialLinks = config.socialLinks || []; // Cargar enlaces de redes sociales

        console.log('Datos iniciales cargados con éxito.');
        console.log('Productos cargados:', appState.products.length);
        console.log('Banners cargados:', appState.banners.length);
        console.log('Marcas cargadas:', appState.brands.length);
        console.log('Información de contacto:', appState.contactInfo);
        console.log('Servicios cargados:', appState.services.length);
        console.log('FAQs cargadas:', appState.serviceFaqs.length);
        console.log('Redes sociales cargadas:', appState.socialLinks.length);

    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        throw error; // Propagar el error para que DOMContentLoaded lo capture
    }
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = mainNav ? mainNav.querySelectorAll('.nav-list a') : [];

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = mainNav.classList.contains('active');
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
            // Actualizar atributos ARIA
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.setAttribute('aria-hidden', isExpanded); // Si está activo, no está oculto
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    mainNav.setAttribute('aria-hidden', 'true');
                }
            });
        });

        // Cerrar menú al hacer clic fuera del menú en pantallas pequeñas
        window.addEventListener('click', (event) => {
            if (window.innerWidth <= 767 && mainNav.classList.contains('active') &&
                !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
                mainNav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');
            }
        });
    }
}
