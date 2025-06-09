// js/main.js

import { initCarousel } from './carousel.js';
import { renderAllProducts, setupProductFilters, renderBrands, renderProductsCard } from './products.js'; // renderProducts -> renderAllProducts, e importamos renderProductsCard
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel, displayProductsByCategory } from './category-products-carousel.js'; // Importar el nuevo módulo

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [], // Banners del carrusel principal
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
        console.log('main.js: config.json cargado.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: products.json cargado.', appState.products.length, 'productos.');

        console.log('main.js: Datos iniciales cargados con éxito.');
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales. Por favor, recarga la página.', 'error');
        throw error; // Re-lanza el error para detener la ejecución si los datos son críticos
    }
}

/**
 * Configura los event listeners para la interacción de la UI.
 */
function setupUIEventListeners() {
    // Toggle para el menú de navegación móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    } else {
        console.warn('main.js: Elementos de menú móvil no encontrados.');
    }

    // Navegación principal y navegación inferior: cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.main-nav a, .bottom-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // Botones de abrir/cerrar carrito
    const headerCartBtn = document.getElementById('headerCartBtn');
    const bottomNavCart = document.getElementById('bottomNavCart');

    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Botón de carrito del header no encontrado.');
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Botón de carrito de la barra inferior no encontrado.');
    }


    // Botones de búsqueda (header y bottom nav)
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Botón de búsqueda del header no encontrado.');
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Botón de búsqueda de la barra inferior no encontrado.');
    }


    // Cerrar modales genéricos (búsqueda, reporte, agendar) al hacer clic en el botón de cerrar
    document.querySelectorAll('.modal .close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.closest('.modal').classList.remove('open');
            e.closest('.modal').style.display = 'none'; // Asegurar ocultado
            document.body.style.overflow = ''; // Restaurar scroll del body
        });
    });

    // Cerrar modales genéricos al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                modal.style.display = 'none';
                document.body.style.overflow = ''; // Restaurar scroll del body
            }
        });
    });

    // Listener para añadir al carrito desde cualquier botón .add-to-cart-btn (delegación de eventos)
    document.addEventListener('click', (event) => {
        const addToCartBtn = event.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            if (productId) {
                initCart(); // Asegurarse de que el carrito esté inicializado
                addToCart(productId);
            }
        }
    });

    // Manejo del formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            showToastNotification('Mensaje enviado. Te responderemos pronto.', 'success');
            contactForm.reset();
        });
    }
}

/**
 * Configura el estado activo de la barra de navegación inferior en base al scroll.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { // Cuando al menos el 50% de la sección está visible
                const currentId = entry.target.id;
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    }
                });
                // También activar el enlace en el main-nav
                document.querySelectorAll('.main-nav .nav-list a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 }); // Un umbral del 50%

    sections.forEach(section => {
        observer.observe(section);
    });

    // Activar el item "Inicio" por defecto al cargar la página si no hay scroll
    const firstSection = document.getElementById('hero-section');
    if (firstSection) {
        const firstNavItem = document.querySelector('.bottom-nav .nav-item[href="#hero-section"]');
        const firstMainNavItem = document.querySelector('.main-nav .nav-list a[href="#hero-section"]');
        if (firstNavItem) firstNavItem.classList.add('active');
        if (firstMainNavItem) firstMainNavItem.classList.add('active');
    }
}


// Ejecución principal al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Paso 1: Cargar datos iniciales (products, config)
        await loadInitialData();

        // Paso 2: Inicializar el módulo de verificación de edad (ya se inicializa solo)
        // age-verification.js se ejecuta automáticamente en DOMContentLoaded

        // Paso 3: Inicializar el carrito (carga desde localStorage y renderiza)
        initCart();

        // Paso 4: Inicializar el carrusel principal (Ofertas y Novedades unificadas)
        // Filtramos productos que sean ofertas o novedades para el carrusel principal
        const heroProducts = appState.products.filter(p => p.isOnOffer || p.isNew);
        if (heroProducts.length > 0) {
            initCarousel(heroProducts, 'heroCarouselTrack', 'heroCarouselPrev', 'heroCarouselNext', 'heroCarouselDots', true); // True para carrusel de productos
        } else if (appState.banners.length > 0) {
            // Si no hay productos en oferta/novedad, usar los banners configurados
            initCarousel(appState.banners, 'heroCarouselTrack', 'heroCarouselPrev', 'heroCarouselNext', 'heroCarouselDots', false);
        } else {
            console.warn('main.js: No hay productos en oferta/novedad ni banners para el carrusel principal.');
        }


        // Paso 5: Renderizar todos los productos en la sección principal de productos
        renderAllProducts(appState.products, '#allProductsGrid'); // Usar la nueva función renombrada

        // Paso 6: Configurar filtros de productos
        setupProductFilters(appState.products, '#allProductsGrid');

        // Paso 7: Renderizar y configurar el carrusel de marcas
        renderBrands(appState.brands, '#brandsLogosContainer');

        // Paso 8: Configurar el módulo de búsqueda
        setupSearch();

        // Paso 9: Configurar el carrusel de productos por categoría
        setupCategoryProductCarousel();
        // Por defecto, mostrar la categoría 'Todos' al inicio
        displayProductsByCategory('Todos');


        // Paso 10: Inicializar módulo de soporte con el número de WhatsApp desde config.json
        if (appState.contactInfo.phone) {
            setupSupport(); // setupSupport ya obtiene el número de appState
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 11: Configurar event listeners de UI (botones de navegación, modales, etc.)
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior en base al scroll
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email;
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone;
        document.getElementById('contactAddress').textContent = appState.contactInfo.address;
        
        // Actualizar el enlace de WhatsApp en el footer si existe
        const whatsappFloatLink = document.querySelector('.whatsapp-float');
        if (whatsappFloatLink && appState.contactInfo.phone) {
            whatsappFloatLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }


    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Contacta a soporte.', 'error');
    }
});
