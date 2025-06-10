// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousCarousel } from './continuous-carousel.js';

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales desde archivos JSON.
 */
async function loadInitialData() {
    try {
        // CORRECCIÓN: Se usa '../' para acceder a los archivos desde la carpeta /js/
        const [configResponse, productsResponse] = await Promise.all([
            fetch('../config.json'),
            fetch('../products.json')
        ]);

        if (!configResponse.ok) throw new Error(`Error HTTP ${configResponse.status} al cargar config.json`);
        if (!productsResponse.ok) throw new Error(`Error HTTP ${productsResponse.status} al cargar products.json`);

        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };

        appState.products = await productsResponse.json();

    } catch (error) {
        console.error('Error fatal al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos. Por favor, recarga la página.', 'error');
        throw error;
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    }

    // Delegación de eventos para navegación y acciones principales
    document.body.addEventListener('click', (event) => {
        const navLink = event.target.closest('a.nav-link');
        const bottomNavLink = event.target.closest('a.nav-link-bottom');

        // Navegación entre secciones
        if (navLink || bottomNavLink) {
            event.preventDefault();
            const sectionId = (navLink || bottomNavLink).dataset.section;
            showSection(sectionId);
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        }
    });

    // CORRECCIÓN: IDs correctos para los botones de abrir búsqueda y carrito
    document.getElementById('searchOpenBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('bottomSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));

    document.getElementById('cartOpenBtn')?.addEventListener('click', toggleCartSidebar);
    document.getElementById('bottomCartBtn')?.addEventListener('click', toggleCartSidebar);
}

/**
 * Muestra una sección y oculta las demás.
 */
function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.toggle('content-hidden', section.id !== sectionId);
        section.classList.toggle('active-section', section.id === sectionId);
    });
    document.querySelectorAll('.nav-link, .nav-link-bottom').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Actualiza la información de contacto en la página.
 */
function updateContactInfo() {
    const { email, phone, address } = appState.contactInfo;
    document.getElementById('contactEmail').textContent = email;
    document.getElementById('contactPhone').textContent = phone;
    document.getElementById('contactAddress').textContent = address;
    document.getElementById('footerEmail').textContent = email;
    document.getElementById('footerPhone').textContent = phone;
    document.getElementById('footerAddress').textContent = address;

    document.querySelectorAll('a[href*="whatsapp.com"]').forEach(link => {
        link.href = `https://wa.me/${phone}`;
    });
}

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initAgeVerification();
        await loadInitialData();

        // --- Renderizado de contenido dinámico ---
        initCarousel(appState.banners);

        // CORRECCIÓN: Renderizar productos en el contenedor correcto (#productGrid)
        renderProducts(appState.products, '#productGrid');
        setupProductFilters(appState.products, '#catalogo');

        // --- Inicialización de Carruseles Continuos ---
        const productsOnOffer = appState.products.filter(p => p.isOnOffer);
        const newProducts = appState.products.filter(p => p.isNew);

        // CORRECCIÓN: Usar la función unificada `initContinuousCarousel` con los IDs correctos del HTML
        initContinuousCarousel(productsOnOffer, 'continuousProductCarouselTrack', 'products', 'Promociones');
        initContinuousCarousel(appState.brands, 'brandContinuousCarouselTrack', 'brands', 'Marcas');
        initContinuousCarousel(newProducts, 'offersContinuousCarouselTrack', 'products', 'Ofertas');


        // --- Configuración de Módulos ---
        setupSearch();
        initCart();
        setupSupport();
        updateContactInfo();
        setupUIEventListeners();
        showSection('inicio'); // Mostrar la sección de inicio por defecto

    } catch (error) {
        console.error('No se pudo inicializar la aplicación:', error);
        showToastNotification('Error crítico al iniciar. Intenta recargar.', 'error');
    }
});
