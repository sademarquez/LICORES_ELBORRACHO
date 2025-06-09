// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Importar aquí

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
        console.log('main.js: config.json cargado exitosamente.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: products.json cargado exitosamente. Total productos:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales de la aplicación.', 'error');
    }
}

/**
 * Configura los event listeners para los elementos de la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Manejo del menú hamburguesa para móviles
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            console.log('main.js: Menú hamburguesa toggled.');
        });
    }

    // Manejo de la apertura/cierre del carrito
    const cartButton = document.getElementById('cartButton');
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            toggleCartSidebar(true); // Abrir carrito
            console.log('main.js: Botón de carrito del header clicado.');
        });
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (event) => {
            event.preventDefault(); // Evita el comportamiento predeterminado del ancla
            toggleCartSidebar(true); // Abrir carrito
            console.log('main.js: Botón de carrito del bottom nav clicado.');
        });
    }

    // Manejo de la apertura del modal de búsqueda
    const desktopNavSearch = document.getElementById('desktopNavSearch');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (desktopNavSearch) {
        desktopNavSearch.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSearchModal(true);
            console.log('main.js: Botón de búsqueda del header clicado.');
        });
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSearchModal(true);
            console.log('main.js: Botón de búsqueda del bottom nav clicado.');
        });
    }

    // Cerrar modales genéricos (para soporte y búsqueda)
    document.querySelectorAll('.modal .close-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = 'none'; // Asegura que se oculte correctamente
                console.log('main.js: Modal cerrado.');
            }
        });
    });

    // Cerrar sidebar del carrito al hacer clic fuera
    document.addEventListener('click', (event) => {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartButtonElements = [document.getElementById('cartButton'), document.getElementById('bottomNavCart')]; // Elementos que abren el carrito

        // Verificar si el clic fue fuera del sidebar y no en los botones que lo abren
        if (cartSidebar && cartSidebar.classList.contains('open') &&
            !cartSidebar.contains(event.target) &&
            !cartButtonElements.some(btn => btn && btn.contains(event.target))) {
            toggleCartSidebar(false);
            console.log('main.js: Clic fuera del carrito, cerrando sidebar.');
        }
    });

    // Desplazamiento suave para enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Evitar scroll a la parte superior si el href es '#'

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Si es un enlace del menú móvil, ciérralo después de hacer clic
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior basado en el scroll.
 * Se desactiva en desktop por CSS, pero su lógica se mantiene para móvil/tablet.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section[id]');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // Cuando al menos el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos los items
                navItems.forEach(item => item.classList.remove('active'));

                // Añadir 'active' al item correspondiente
                const targetId = `#${entry.target.id}`;
                const activeItem = document.querySelector(`.bottom-nav .nav-item[href="${targetId}"]`);
                if (activeItem) {
                    activeItem.classList.add('active');
                } else if (entry.target.id === 'home' && !document.querySelector('.bottom-nav .nav-item.active')) {
                    // Si no hay ninguno activo, pero estamos en home, activa el de inicio
                    document.querySelector('.bottom-nav .nav-item[href="#novedades"]')?.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Caso especial para el inicio si la página carga directamente en el top
    if (window.scrollY === 0) {
        navItems.forEach(item => item.classList.remove('active'));
        document.querySelector('.bottom-nav .nav-item[href="#novedades"]')?.classList.add('active');
    }
}


// Inicialización de la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('main.js: DOM completamente cargado. Iniciando aplicación...');

        // Paso 1: Cargar datos iniciales (productos, banners, marcas, contacto)
        await loadInitialData();

        // Paso 2: Inicializar el carrusel principal (Hero Section)
        initCarousel(appState.banners);

        // Paso 3: Renderizar productos en la sección "Novedades" (primer carrusel dinámico)
        // Usar setupCategoryProductCarousel para manejar el desplazamiento.
        renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 10 }); // Renderizar inicial
        setupCategoryProductCarousel(appState.products.filter(p => p.isNew), '#newProductsCarousel');


        // Paso 4: Renderizar productos en la sección "Ofertas Especiales" (segundo carrusel dinámico)
        renderProducts(appState.products, '#onOfferProductsGrid', { isOnOffer: true, limit: 10 }); // Renderizar inicial
        setupCategoryProductCarousel(appState.products.filter(p => p.isOnOffer), '#offerProductsCarousel');

        // Paso 5: Renderizar marcas
        renderBrands(appState.brands, '#brandsGrid');

        // Paso 6: Configurar la sección de licores con botones de categoría y carrusel 2x2
        setupProductFilters(); // Esta función ahora maneja los botones de categoría y el carrusel asociado.

        // Paso 7: Inicializar módulo de búsqueda (solo modal)
        setupSearch();

        // Paso 8: Inicializar módulo de carrito
        initCart();
        updateCartCount(); // Asegurarse de que el contador del carrito se actualice al inicio

        // Paso 9: Inicializar módulo de soporte con el número de WhatsApp desde config.json
        if (appState.contactInfo.phone) {
            setupSupport(); // No necesitas pasar el número aquí, support.js lo obtiene de appState.
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 10: Configurar event listeners de UI (botones de navegación, modales, etc.)
        setupUIEventListeners();

        // Paso 11: Configurar el estado activo de la barra de navegación inferior en base al scroll
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto (si existe)
        document.getElementById('contactEmail').textContent = appState.contactInfo.email || 'N/A';
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone || 'N/A';
        document.getElementById('contactAddress').textContent = appState.contactInfo.address || 'N/A';
        
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
