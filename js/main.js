// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartDisplay, toggleCartSidebar } from './cart.js'; // CAMBIO CLAVE AQUÍ: updateCartCount AHORA ES updateCartDisplay
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js';
import { initAgeVerification } from './age-verification.js';
import { initContinuousProductCarousel } from './continuous-carousel.js';

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

/**
 * Carga los datos iniciales de configuración (banners, marcas, contacto)
 * y los productos desde archivos JSON. Popula appState con los datos cargados.
 */
async function loadInitialData() {
    try {
        // console.log('main.js: Iniciando carga de datos iniciales...'); // ELIMINADO
        
        // Cargar config.json
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`Error HTTP! status: ${configResponse.status} al cargar config.json`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail || 'N/A',
            phone: configData.contactPhone || 'N/A',
            address: configData.address || 'N/A'
        };

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

        // console.log('main.js: Datos iniciales cargados con éxito.', appState); // ELIMINADO

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales. Por favor, recarga la página.', 'error');
        throw error; // Re-lanza el error para evitar que la aplicación continúe con datos incompletos
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Botón de hamburguesa para la navegación móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            // Añade o quita la clase 'active' al body para deshabilitar el scroll de fondo
            document.body.classList.toggle('no-scroll', mainNav.classList.contains('active'));
        });
    }

    // Cierre del menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.main-nav .nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Delegación de eventos para navegación entre secciones
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // Navegación principal (header y bottom nav)
        if (target.matches('.nav-list a') || target.closest('.bottom-nav-item')) {
            event.preventDefault();
            let sectionId;
            if (target.matches('.nav-list a')) {
                sectionId = target.getAttribute('href').substring(1);
            } else { // Viene del bottom-nav-item
                sectionId = target.closest('.bottom-nav-item').dataset.section;
            }
            showSection(sectionId);
            setupBottomNavActiveState(); // Actualiza el estado activo de la barra inferior
        }

        // Abrir/cerrar modal de carrito
        if (target.matches('#cartIcon') || target.matches('#bottomCartIcon')) {
            toggleCartSidebar();
        }

        // Abrir modal de búsqueda
        if (target.matches('#searchIcon')) {
            toggleSearchModal(true);
        }

    });
}

/**
 * Muestra la sección de la página correspondiente al ID.
 * Oculta todas las demás secciones.
 * @param {string} sectionId - El ID de la sección a mostrar.
 */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('content-hidden');
            section.classList.add('active-section'); // Añade clase para estilos de la sección activa
        } else {
            section.classList.add('content-hidden');
            section.classList.remove('active-section');
        }
    });

    // Desplazar al inicio de la sección, si es necesario
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        window.scrollTo({
            top: targetSection.offsetTop - (document.querySelector('header')?.offsetHeight || 0), // Ajustar por la altura del header
            behavior: 'smooth'
        });
    }

    // Actualizar URL sin recargar la página (para compartir enlaces)
    history.pushState(null, '', `#${sectionId}`);
}

/**
 * Configura el estado activo de los iconos en la barra de navegación inferior
 * basado en la sección visible actualmente.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const currentHash = window.location.hash.substring(1) || 'inicio'; // Obtener la sección actual o 'inicio' por defecto

    bottomNavItems.forEach(item => {
        if (item.dataset.section === currentHash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}


// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Paso 1: Inicializar la verificación de edad (debe ser lo primero)
        // console.log('main.js: Llamando a initAgeVerification...'); // ELIMINADO
        initAgeVerification();

        // Esperar a que la verificación de edad se complete (o se decline)
        // Esto asume que initAgeVerification es asíncrona o maneja el flujo.
        // Si no es asíncrona y solo muestra un modal, el código continuará,
        // lo cual es deseable si el modal solo bloquea la interacción pero no la carga.

        // Si la verificación de edad redirige o detiene la ejecución, el resto del código no se ejecutará.
        // Si solo oculta un modal, la ejecución continúa.

        // Paso 2: Cargar datos iniciales
        await loadInitialData();

        // Paso 3: Inicializar carrusel principal
        initCarousel(appState.banners);

        // Paso 4: Renderizar productos en la sección de catálogo
        renderProducts(appState.products);

        // Paso 5: Configurar filtros de productos
        setupProductFilters(appState.products, '#catalogo');

        // Paso 6: Configurar búsqueda
        setupSearch();

        // Paso 7: Inicializar el carrito (debe ser después de cargar los productos si el carrito depende de ellos)
        initCart();

        // Paso 8: Configurar soporte (formulario de contacto/citas)
        setupSupport();

        // Paso 9: Renderizar marcas en el carrusel continuo
        renderBrands(appState.brands, '#brandLogosContainer');
        initContinuousProductCarousel(appState.brands, 'continuousCarouselTrackBrands', 'Carrusel de Marcas');

        // Paso 10: Configurar el carrusel de productos por categoría en la sección de inicio
        // Asegúrate de que esta función se llama con todos los productos y el selector correcto
        setupCategoryProductCarousel(appState.products, '#categoryProductsSection');


        // Paso 11: Configurar todos los event listeners de la UI
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('contactAddress').textContent = appState.contactInfo.address || 'N/A';
        
        // También actualizar el footer, si tiene IDs diferentes
        document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';


        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }

        // console.log('main.js: Aplicación inicializada completamente.'); // ELIMINADO

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});
