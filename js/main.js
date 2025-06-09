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

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: Datos iniciales cargados:', appState);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales de la aplicación.', 'error');
        throw error; // Propagar el error para que DOMContentLoaded lo capture
    }
}

/**
 * Configura los event listeners para elementos de UI que son globales o compartidos.
 */
function setupUIEventListeners() {
    // Toggle para el menú de navegación móvil (hamburguesa)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace (solo en móvil)
    const navLinks = document.querySelectorAll('.main-nav .nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });

    // Abrir/Cerrar Carrito Sidebar
    const openCartBtn = document.getElementById('openCartSidebar');
    const bottomNavCartBtn = document.getElementById('bottomNavCart');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    }
    if (bottomNavCartBtn) {
        bottomNavCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    }
    // El botón de cerrar dentro del carrito ya se maneja en cart.js

    // Abrir/Cerrar Modal de Búsqueda
    const openSearchModalBtn = document.getElementById('openSearchModal');
    const closeSearchModalBtn = document.getElementById('closeSearchModal');
    const bottomNavSearchBtn = document.getElementById('bottomNavSearch');
    if (openSearchModalBtn) {
        openSearchModalBtn.addEventListener('click', () => toggleSearchModal(true));
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
    }
    if (bottomNavSearchBtn) {
        bottomNavSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    }

    // Configurar cierres de modales genéricos (para modales de soporte, etc.)
    const closeButtons = document.querySelectorAll('.modal .close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('open'); // También remover la clase 'open'
            }
        });
    });

    // Cerrar modal al hacer clic fuera (para modales genéricos, no para sidebar)
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('open');
            }
        });
    });
}

/**
 * Configura el estado activo de los ítems en la barra de navegación inferior
 * basándose en la sección visible en la pantalla.
 */
function setupBottomNavActiveState() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const updateActiveNav = () => {
        const scrollY = window.scrollY;

        // Iterar de abajo hacia arriba para preferir secciones más bajas si se superponen
        let activeFound = false;
        for (let i = bottomNavItems.length - 1; i >= 0; i--) {
            const item = bottomNavItems[i];
            const targetId = item.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId !== '#') { // Excluir # y enlaces de botón
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const sectionTop = targetSection.offsetTop - (window.innerHeight / 3); // Ajuste para que se active antes
                    const sectionBottom = targetSection.offsetTop + targetSection.offsetHeight - (window.innerHeight / 3);

                    if (scrollY >= sectionTop && scrollY < sectionBottom) {
                        bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
                        item.classList.add('active');
                        activeFound = true;
                        break;
                    }
                }
            }
        }

        // Si no se encontró una sección (ej. al inicio de la página o en una zona "muerta")
        // Y si el primer elemento no es el de inicio (para evitar activarlo siempre)
        // Puedes establecer una lógica por defecto o dejar que no haya activo.
        // Aquí, simplemente activamos el primer elemento si no hay nada más.
        if (!activeFound && bottomNavItems.length > 0) {
             // Opcional: Si quieres que el "Inicio" siempre esté activo cuando no hay otra sección activa
             // bottomNavItems[0].classList.add('active');
        }

        // Manejo de enlaces específicos del bottom nav que abren modales (buscar, carrito)
        bottomNavItems.forEach(item => {
            if (item.id === 'bottomNavSearch' || item.id === 'bottomNavCart') {
                // No activar estos enlaces basados en el scroll, su estado lo maneja el JS
                item.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Ejecutar al cargar para establecer el estado inicial

    // Asegurar que "Inicio" esté activo al cargar si no hay scroll
    const currentHash = window.location.hash;
    if (!currentHash || currentHash === '#novedades-ofertas-carousel') {
        bottomNavItems.forEach(item => item.classList.remove('active'));
        document.querySelector('.bottom-nav .nav-item[href="#novedades-ofertas-carousel"]').classList.add('active');
    }
}


// Evento principal que se dispara cuando todo el DOM ha sido cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');
    try {
        // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
        // Esto asegura que el modal se muestre inmediatamente.
        initAgeVerification();

        // Paso 2: Cargar datos iniciales (products.json, config.json)
        await loadInitialData();

        // Paso 3: Inicializar el carrusel de banners
        initCarousel(appState.banners);

        // Paso 4: Combinar Novedades y Ofertas y pasarlas al nuevo carrusel continuo
        const combinedProducts = appState.products.filter(p => p.isNew || p.isOnOffer);
        initContinuousProductCarousel(combinedProducts, 'combinedProductsCarouselTrack', 2); // 2 segundos por artículo

        // Paso 5: Renderizar productos en sus secciones y configurar filtros
        renderProducts(appState.products, '#licoresProductGrid', { category: 'Licor', limit: 8 });
        setupProductFilters('#licoresProductGrid', 'Licor');

        renderProducts(appState.products, '#cervezasProductGrid', { category: 'Cerveza', limit: 8 });
        setupProductFilters('#cervezasProductGrid', 'Cerveza');

        renderProducts(appState.products, '#snacksProductGrid', { category: 'Snack', limit: 8 });
        setupProductFilters('#snacksProductGrid', 'Snack');

        renderProducts(appState.products, '#cigarrillosProductGrid', { category: 'Cigarrillos', limit: 8 });
        setupProductFilters('#cigarrillosProductGrid', 'Cigarrillos');

        renderProducts(appState.products, '#bebidasNoAlcoholicasProductGrid', { category: 'Bebida no alcohólica', limit: 8 });
        setupProductFilters('#bebidasNoAlcoholicasProductGrid', 'Bebida no alcohólica');

        // Paso 6: Configurar carruseles de categorías específicos (ejemplo: 'Licores Premium')
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Licor' && p.rating >= 4.5), '#licores-premium-carousel-section');


        // Paso 7: Inicializar y configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 8: Inicializar y renderizar el carrito
        initCart();
        updateCartCount();

        // Paso 9: Renderizar marcas
        renderBrands(appState.brands, '#brandLogos');

        // Paso 10: Inicializar módulo de soporte
        if (appState.contactInfo.phone) {
            setupSupport(); // setupSupport ahora obtiene el número de appState
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 11: Configurar event listeners de UI
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        document.getElementById('contactEmail').textContent = appState.contactInfo.email;
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone;
        document.getElementById('contactAddress').textContent = appState.contactInfo.address;

        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }

        console.log('main.js: Aplicación inicializada completamente.');

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
        // Si hay un error crítico, podrías ocultar el cuerpo y mostrar un mensaje
        // document.body.style.display = 'none';
        // document.getElementById('error-message').style.display = 'block';
    }
});
