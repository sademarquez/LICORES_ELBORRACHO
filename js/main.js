// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
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
        
        // Cargar config.json
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`Error HTTP! status: ${configResponse.status} al cargar config.json`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = configData.contactInfo || {};
        appState.contactInfo.email = configData.contactEmail || ''; 
        appState.contactInfo.phone = configData.contactPhone || ''; 
        appState.contactInfo.address = configData.address || ''; 


        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        
    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información inicial de la tienda.', 'error');
        // Lanzar el error para que el bloque DOMContentLoaded también lo capture
        throw error; 
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Event listener para el icono del carrito en el header
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCartSidebar);
    }

    // Event listener para el icono del carrito en el bottom nav (solo móvil)
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (event) => {
            event.preventDefault(); // Evitar que el # en el href recargue la página
            toggleCartSidebar();
        });
    }

    // Event listener para el icono de búsqueda en el header
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    }

    // Event listener para el icono de búsqueda en el bottom nav (solo móvil)
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (event) => {
            event.preventDefault(); // Evitar que el # en el href recargue la página
            toggleSearchModal(true);
        });
    }

    // Event listener para el botón de menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        // Cerrar el menú si se hace clic en un enlace (para móviles)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }
}

/**
 * Configura el estado activo para la barra de navegación inferior (bottom-nav).
 * Marca el ítem de navegación que corresponde a la sección visible.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.3 // El 30% de la sección debe estar visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos los items
                navItems.forEach(item => item.classList.remove('active'));

                // Encontrar el nav item correspondiente a la sección visible
                const targetId = entry.target.id;
                const activeNavItem = document.querySelector(`.bottom-nav .nav-item[href*="${targetId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Manejar clics en el nav inferior para scroll suave
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}


// Punto de entrada de la aplicación: se ejecuta cuando el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
    initAgeVerification(); // Siempre inicializar la verificación de edad primero

    // Escuchar el evento de transición del modal de verificación de edad
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    if (ageVerificationModal) {
        ageVerificationModal.addEventListener('transitionend', async (event) => {
            // Asegurarse de que es la transición de opacidad y que el modal está oculto
            if (event.propertyName === 'opacity' && ageVerificationModal.style.opacity === '0') {
                // Ahora que el modal está oculto, procedemos con el resto de la inicialización
                try {
                    await loadInitialData();

                    // Paso 1: Inicializar el carrusel principal
                    initCarousel(appState.banners);

                    // Paso 2: Renderizar todos los productos en el grid principal
                    renderProducts(appState.products, '#productGrid');

                    // Paso 3: Configurar filtros de productos
                    setupProductFilters(appState.products, '#allProductsGridSection');

                    // Paso 4: Renderizar marcas en el grid
                    renderBrands(appState.brands, '#brandsGrid');

                    // Paso 5: Inicializar carrusel continuo de marcas
                    initContinuousProductCarousel(appState.brands, 'brandContinuousTrack', 'Marcas Aliadas');

                    // Paso 6: Configurar el carrusel de categorías (la sección "Explora por Categoría")
                    setupCategoryProductCarousel(appState.products, '#categoryProductsSection');

                    // Paso 7: Configurar el carrusel de Productos Destacados (NUEVO)
                    setupCategoryProductCarousel(appState.products, '#featuredProductsSection');

                    // Paso 8: Inicializar la funcionalidad del carrito
                    initCart();

                    // Paso 9: Actualizar el contador del carrito al inicio (en caso de que haya elementos en localStorage)
                    updateCartCount();

                    // Paso 10: Configurar la funcionalidad de búsqueda
                    setupSearch();

                    // Paso 11: Configurar la funcionalidad de soporte (modales, WhatsApp)
                    setupSupport();

                    // Paso 12: Configurar el estado activo de la barra de navegación inferior
                    setupBottomNavActiveState();

                    // Actualizar información de contacto en el footer/contacto
                    document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
                    document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
                    document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';


                    const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
                    if (footerWhatsappLink && appState.contactInfo.phone) {
                        footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
                    }

                } catch (error) {
                    console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
                    showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
                }
            }
        });
    } else {
        // Fallback si por alguna razón el modal no se encuentra (aunque ya tenemos un warning en age-verification.js)
        console.warn('main.js: Modal de verificación de edad no encontrado. Procediendo con la carga de la aplicación.');
        // Si no hay modal de verificación de edad, inicia la aplicación directamente
        try {
            await loadInitialData();

            initCarousel(appState.banners);
            renderProducts(appState.products, '#productGrid');
            setupProductFilters(appState.products, '#allProductsGridSection');
            renderBrands(appState.brands, '#brandsGrid');
            initContinuousProductCarousel(appState.brands, 'brandContinuousTrack', 'Marcas Aliadas');
            setupCategoryProductCarousel(appState.products, '#categoryProductsSection');
            setupCategoryProductCarousel(appState.products, '#featuredProductsSection'); // NUEVO
            initCart();
            updateCartCount();
            setupSearch();
            setupSupport();
            setupUIEventListeners();
            setupBottomNavActiveState();
            
            document.getElementById('footerEmail').textContent = appState.contactInfo.email || 'N/A';
            document.getElementById('footerPhone').textContent = appState.contactInfo.phone || 'N/A';
            document.getElementById('footerAddress').textContent = appState.contactInfo.address || 'N/A';

            const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
            if (footerWhatsappLink && appState.contactInfo.phone) {
                footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
            }

        } catch (error) {
            console.error('main.js: Error crítico al iniciar la aplicación sin modal de verificación de edad.', error);
            showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
        }
    }
});
