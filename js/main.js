// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';

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
        console.log('main.js: Datos de configuración cargados.', appState.contactInfo);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();
        console.log('main.js: Datos de productos cargados.', appState.products.length);

        console.log('main.js: Carga de datos iniciales completada.');
    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar datos. La aplicación podría no funcionar correctamente.', 'error');
        throw error; // Re-lanza el error para que .then.catch en DOMContentLoaded lo maneje
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Toggle para el menú de navegación principal en móviles
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active') ? 'true' : 'false');
        });
    }

    // Cerrar menú al hacer clic en un enlace (para móviles)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Abrir/Cerrar carrito desde el botón del header
    const headerCartBtn = document.getElementById('headerCartBtn');
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            toggleCartSidebar(true);
        });
    }

    // Abrir/Cerrar carrito desde el botón del bottom nav
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que navegue a #
            toggleCartSidebar(true);
        });
    }

    // Abrir modal de búsqueda desde el header
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            toggleSearchModal(true);
        });
    }

    // Abrir modal de búsqueda desde el bottom nav
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que navegue a #
            toggleSearchModal(true);
        });
    }

    // Cerrar modal de búsqueda
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            toggleSearchModal(false);
        });
    }

    // Cerrar modales al hacer clic fuera (aplicado a modals con clase 'modal')
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Cerrar modales con el botón de cerrar
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior en base al scroll.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section[id]'); // Todas las secciones con ID

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentSectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px 0px -50% 0px', // Activar cuando la sección esté a mitad de la pantalla
        threshold: 0 // Cuando al menos 1px de la sección esté visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejo especial para el inicio/novedades si la página carga arriba del todo
    // Esto asegura que "Inicio" esté activo al cargar si no hay scroll
    window.addEventListener('load', () => {
        const firstSection = document.getElementById('novedades');
        if (firstSection && firstSection.getBoundingClientRect().top >= 0) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#novedades') {
                    item.classList.add('active');
                }
            });
        }
    });
}


// Punto de entrada principal de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Paso 1: Inicializar el carrito antes de cargar productos para que el contador sea preciso
    initCart();

    // Paso 2: Cargar datos iniciales
    try {
        await loadInitialData(); // Espera a que los datos se carguen
        console.log('Aplicación EL BORRACHO inicializada correctamente.');

        // Paso 3: Inicializar el carrusel con los banners cargados
        if (appState.banners && appState.banners.length > 0) {
            initCarousel(appState.banners);
        } else {
            console.warn('main.js: No hay datos de banners cargados para el carrusel.');
        }

        // Paso 4: Renderizar secciones de productos
        // Asegúrate de que los IDs de los contenedores coincidan con tu HTML
        renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
        renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });
        renderProducts(appState.products, '#beerProductsGrid', { category: 'Cerveza' });
        renderProducts(appState.products, '#snackProductsGrid', { category: 'Snack' });


        // Paso 5: Configurar filtros de productos (actualmente solo para la sección principal de licores)
        // Se pasa appState.products y el selector del contenedor que contiene los filtros y el grid.
        setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


        // Paso 6: Inicializar la funcionalidad de búsqueda
        setupSearch();

        // Paso 7: Renderizar marcas en el carrusel de marcas
        if (appState.brands && appState.brands.length > 0) {
            renderBrands(appState.brands, '#brandsCarouselTrack');
        } else {
            console.warn('main.js: No hay datos de marcas cargados para renderizar.');
        }

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
        document.getElementById('contactEmail').textContent = appState.contactInfo.email;
        document.getElementById('contactPhone').textContent = appState.contactInfo.phone;
        document.getElementById('contactAddress').textContent = appState.contactInfo.address;
        
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
