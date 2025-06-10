// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters } from './products.js'; // Eliminar renderBrands si no se usa directamente aquí
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
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
        console.log('main.js: Iniciando carga de datos iniciales...');

        // Cargar config.json
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`Error HTTP! status: ${configResponse.status} al cargar config.json`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = configData.contactInfo || {};
        console.log('main.js: config.json cargado. Banners:', appState.banners.length, 'Brands:', appState.brands.length, 'Contact Info:', appState.contactInfo);
        
        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: products.json cargado. Productos:', appState.products.length);

        console.log('main.js: Datos iniciales cargados completamente.');
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información principal.', 'error');
    }
}

/**
 * Configura los manejadores de eventos generales de la UI.
 */
function setupUIEventListeners() {
    // Manejar el botón de hamburguesa para el menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        // Cerrar el menú al hacer clic en un enlace (solo en móvil)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 767) { // Solo si es móvil
                    mainNav.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    } else {
        console.warn('main.js: Menú de navegación o botón de toggle no encontrados.');
    }

    // Manejar la apertura/cierre del carrito
    const headerCartBtn = document.getElementById('headerCartBtn');
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que la ancla se dispare
            toggleCartSidebar(true);
        });
    }

    // Manejar la apertura del modal de búsqueda desde el header y bottom nav
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que la ancla se dispare
            toggleSearchModal(true);
        });
    }
}

/**
 * Establece el estado activo de los ítems de la barra de navegación inferior
 * basándose en la sección visible en la ventana.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (bottomNavItems.length === 0) {
        // console.warn('main.js: Elementos de la barra de navegación inferior no encontrados.'); // ELIMINADO
        return;
    }

    const sections = [
        { id: 'hero-carousel', navItem: document.querySelector('.bottom-nav a[href="#hero-carousel"]') },
        { id: 'allProductsGridSection', navItem: document.querySelector('.bottom-nav a[href="#allProductsGridSection"]') },
        // { id: 'searchModal', navItem: document.getElementById('bottomNavSearch') }, // El modal de búsqueda no es una sección de scroll
        // { id: 'cartSidebar', navItem: document.getElementById('bottomNavCart') }, // El sidebar del carrito no es una sección de scroll
        { id: 'support-section', navItem: document.querySelector('.bottom-nav a[href="#support-section"]') }
    ];

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% de la sección debe ser visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos
                bottomNavItems.forEach(item => item.classList.remove('active'));
                // Añadir 'active' al que está intersectando
                const activeNavItem = sections.find(s => s.id === entry.target.id);
                if (activeNavItem && activeNavItem.navItem) {
                    activeNavItem.navItem.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(s => {
        const sectionElement = document.getElementById(s.id);
        if (sectionElement) {
            observer.observe(sectionElement);
        } else {
            console.warn(`main.js: Sección con ID '${s.id}' no encontrada para el IntersectionObserver.`);
        }
    });

    // Manejar clics en los nav-items para scroll suave
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') { // Solo si es un ancla interna
                e.preventDefault(); // Previene el comportamiento por defecto de la ancla
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Asegurar que el elemento de inicio esté activo al cargar si no hay otra sección visible
    const initialActive = document.querySelector('.bottom-nav a[href="#hero-carousel"]');
    if (initialActive) {
        initialActive.classList.add('active');
    }
}


/**
 * Inicializa la aplicación cuando el DOM está completamente cargado.
 * Orquesta la carga de datos y la inicialización de todos los componentes.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded disparado. Iniciando aplicación...');

    // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otra cosa.
    initAgeVerification();
    console.log('main.js: Age Verification initialized.');

    // No agregamos la lógica de `hasVerifiedAge` de localStorage, simplemente mostramos el modal
    // y el resto de la app se inicializa después de que el usuario confirme.
    // Asumimos que el modal de verificación de edad es bloqueante y se oculta con el click.

    try {
        // Paso 2: Cargar datos iniciales
        await loadInitialData(); // Ya tiene logs

        // Paso 3: Inicializar el carrito (necesita appState.cart)
        initCart();
        console.log('main.js: Cart initialized.');

        // Paso 4: Inicializar el carrusel principal (necesita appState.banners)
        initCarousel(appState.banners);
        console.log('main.js: Main Carousel initialized.');

        // Paso 5: Inicializar carruseles de productos por categoría
        // La función `setupCategoryProductCarousel` ahora recibe todos los productos.
        setupCategoryProductCarousel(appState.products, '#categoryProductsSection'); // Asegúrate que el ID es correcto en index.html
        console.log('main.js: Category Products Carousel setup.');

        // Paso 6: Renderizar todos los productos en la cuadrícula (si tienes una sección para "todos los productos")
        // Asumiendo que tienes una sección con ID 'allProductsGridSection' y un grid dentro con ID 'allProductsGrid'
        renderProducts(appState.products, '#allProductsGrid'); // Asumiendo que renderProducts sabe dónde renderizar
        setupProductFilters(appState.products, '#allProductsGridSection', '#allProductsGrid');
        console.log('main.js: All Products Grid rendered and filters setup.');

        // Paso 7: Inicializar el carrusel continuo de marcas (necesita appState.brands)
        // Asegúrate de que el trackId sea el correcto en tu HTML.
        initContinuousProductCarousel(appState.brands, 'continuousCarouselTrack', 'Carrusel de Marcas');
        console.log('main.js: Continuous Carousel initialized.');

        // Paso 8: Configurar la funcionalidad de búsqueda (necesita appState.products)
        setupSearch();
        console.log('main.js: Search functionality setup.');

        // Paso 9: Configurar la sección de soporte/contacto
        setupSupport();
        console.log('main.js: Support functionality setup.');

        // Paso 10: Añadir manejadores de eventos UI generales
        setupUIEventListeners();
        console.log('main.js: UI Event Listeners setup.');

        // Paso 11: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState(); // Asegúrate de que esta función existe o la has trasladado.
        console.log('main.js: Bottom Nav Active State setup.');

        // Paso 12: Actualizar información de contacto en el footer/contacto
        // Verifica que estos IDs existan en tu index.html
        document.getElementById('contactEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('contactAddress').textContent = appState.contactInfo.address || 'N/A';
        
        document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';

        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }
        console.log('main.js: Contact info updated.');

        console.log('main.js: Aplicación inicializada completamente.');

    } catch (error) {
        console.error('main.js: Error crítico al iniciar la aplicación. Por favor, recarga la página.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});
