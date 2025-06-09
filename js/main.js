// js/main.js

import { initCarousel } from './carousel.js'; // Para el carrusel principal de banners
import { renderProducts, renderBrands } from './products.js'; // renderProducts se usará para búsqueda y categorías
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { initProductCarousel } from './product-carousel.js'; // Nuevo módulo para carruseles de productos
import { setupLiquorCategories } from './liquor-categories.js'; // Nuevo módulo para la navegación de licores por categoría

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
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };
        console.log('main.js: Configuración cargada:', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: Productos cargados:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales de la aplicación.', 'error');
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Manejo del menú hamburguesa en móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
        });
    }

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Control del modal de búsqueda (desde el header y bottom nav)
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModal');

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar desplazamiento si el href es #
            toggleSearchModal(true);
        });
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
    }

    // Control del sidebar del carrito (desde el header y bottom nav)
    const headerCartBtn = document.getElementById('headerCartBtn');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar desplazamiento si el href es #
            toggleCartSidebar();
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar desplazamiento si el href es #
            toggleCartSidebar();
        });
    }

    // Cerrar modales de soporte al hacer clic en el botón de cerrar
    document.querySelectorAll('.modal .close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera del contenido (excluyendo el de edad)
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal && modal.id !== 'ageVerificationModal') {
                modal.classList.remove('open');
                modal.style.display = 'none'; // Asegurarse de que se oculte
            }
        });
        if (event.target === mainNav && mainNav.classList.contains('active') && window.innerWidth < 1024) {
            mainNav.classList.remove('active');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    console.log('main.js: Event listeners de UI configurados.');
}

/**
 * Configura el estado activo de la barra de navegación inferior (bottom-nav)
 * basado en la sección visible en la ventana.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% de la sección visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${targetId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Observar las secciones relevantes
    document.querySelectorAll('main section').forEach(section => {
        observer.observe(section);
    });

    // Manejo para el inicio si no hay scroll
    if (window.scrollY === 0) {
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#hero-section') {
                item.classList.add('active');
            }
        });
    }

    // Esto es para los botones que abren modales/sidebars en el bottom-nav
    // No deberían activar un scroll ni un 'active' de sección
    // Ya se manejan sus clicks con toggleSearchModal y toggleCartSidebar
}


// Ejecución de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Paso 1: Cargar datos iniciales
        await loadInitialData();

        // Paso 2: Inicializar el carrusel principal de banners
        initCarousel(appState.banners);

        // Paso 3: Inicializar carrito (cargar desde localStorage y renderizar)
        initCart();

        // Paso 4: Renderizar marcas
        renderBrands(appState.brands, '#brandGrid');

        // Paso 5: Combinar y renderizar productos "Novedades" y "Ofertas" en un carrusel flotante
        const featuredProducts = appState.products.filter(p => p.isNew || p.isOnOffer);
        if (featuredProducts.length > 0) {
            initProductCarousel(featuredProducts, '#featuredProductsCarouselTrack', '#featuredProductsPrev', '#featuredProductsNext');
            console.log('main.js: Carrusel de Novedades y Ofertas inicializado.');
        } else {
            console.warn('main.js: No hay productos destacados (Novedades u Ofertas) para el carrusel.');
            document.getElementById('featuredProductsCarouselTrack').innerHTML = '<p class="no-results-message">No hay productos destacados por ahora.</p>';
        }

        // Paso 6: Configurar la navegación de licores por categoría
        const liquorCategoriesContainer = document.getElementById('liquorCategoryNav');
        const liquorProductsCarouselTrack = document.getElementById('liquorProductsCarouselTrack');
        const liquorProductsPrevBtn = document.getElementById('liquorProductsPrev');
        const liquorProductsNextBtn = document.getElementById('liquorProductsNext');

        if (liquorCategoriesContainer && liquorProductsCarouselTrack && liquorProductsPrevBtn && liquorProductsNextBtn) {
            setupLiquorCategories(
                appState.products.filter(p => p.category === 'Licor'), // Solo licores para esta sección
                appState.products, // Se necesita el array completo para obtener todas las categorías
                liquorCategoriesContainer,
                liquorProductsCarouselTrack,
                liquorProductsPrevBtn,
                liquorProductsNextBtn
            );
            console.log('main.js: Navegación de categorías de licores inicializada.');
        } else {
            console.warn('main.js: Elementos para la sección de licores por categoría no encontrados.');
        }

        // Paso 7: Configurar la funcionalidad de búsqueda (modal)
        setupSearch();

        // Paso 8: Inicializar módulo de soporte con el número de WhatsApp desde config.json
        if (appState.contactInfo.phone) {
            setupSupport(appState.contactInfo.phone);
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 9: Configurar event listeners de UI (botones de navegación, modales, etc.)
        setupUIEventListeners();

        // Paso 10: Configurar el estado activo de la barra de navegación inferior en base al scroll
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        const contactEmailElem = document.getElementById('contactEmail');
        const contactPhoneElem = document.getElementById('contactPhone');
        const contactAddressElem = document.getElementById('contactAddress');
        
        if (contactEmailElem) contactEmailElem.textContent = appState.contactInfo.email;
        if (contactPhoneElem) contactPhoneElem.textContent = appState.contactInfo.phone;
        if (contactAddressElem) contactAddressElem.textContent = appState.contactInfo.address;
        
        // Actualizar el enlace de WhatsApp en el footer si existe
        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }


    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación.', 'error');
    }
});
