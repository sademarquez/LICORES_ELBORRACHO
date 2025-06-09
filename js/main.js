// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Importar el nuevo módulo
import { initAgeVerification } from './age-verification.js'; // Importar la función de inicialización

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 */
export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {},
    categories: [] // Añadir un array para almacenar categorías únicas
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
        const productsData = await productsResponse.json();
        appState.products = productsData || [];

        // Extraer categorías únicas de los productos
        appState.categories = [...new Set(appState.products.map(p => p.category))];

        console.log('main.js: Datos iniciales cargados exitosamente:', appState);
    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos esenciales de la aplicación.', 'error');
        // Lanzar el error para que DOMContentLoaded lo capture y evite renderizado incompleto
        throw error;
    }
}

/**
 * Configura los event listeners para elementos de UI comunes.
 */
function setupUIEventListeners() {
    // Alternar la barra de búsqueda y el carrito desde la navegación inferior
    document.getElementById('bottomNavSearch').addEventListener('click', (e) => {
        e.preventDefault();
        toggleSearchModal(true); // Abrir el modal de búsqueda
    });

    document.getElementById('bottomNavCart').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartSidebar(true); // Abrir el sidebar del carrito
    });

    // Abrir/Cerrar carrito desde el header
    document.getElementById('cartIcon').addEventListener('click', () => toggleCartSidebar(true));

    // Abrir/Cerrar búsqueda desde el header
    document.getElementById('searchIcon').addEventListener('click', () => toggleSearchModal(true));


    // Cerrar modales genéricos (para aquellos con clase 'modal' y un botón '.close-btn')
    document.querySelectorAll('.modal .close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('open'); // También remover la clase 'open'
            }
        });
    });

    // Cerrar sidebar del carrito con el botón dedicado
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }


    // Manejo del menú hamburguesa (para móviles)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active') ? 'true' : 'false');
        });

        // Cerrar el menú si se hace clic en un enlace (en móvil)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
}


/**
 * Configura el estado activo de la barra de navegación inferior
 * basándose en el hash de la URL o la posición de scroll.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    const setActiveItem = (id) => {
        navItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            if (item.getAttribute('href') === `#${id}`) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            }
        });
    };

    // Activar basado en el hash inicial
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        setActiveItem(initialHash);
    } else {
        // Si no hay hash, activar 'Inicio' por defecto
        setActiveItem('novedades');
    }

    // Escuchar cambios en el hash de la URL para actualizar el estado activo
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        setActiveItem(hash);
    });

    // Opcional: Implementar Intersection Observer para actualizar la navegación
    // basada en la sección visible en el viewport (más avanzado y fuera del alcance actual).
}


// Evento principal que se dispara cuando todo el DOM ha sido cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');
    try {
        // Paso 1: Inicializar la verificación de edad ANTES de cargar cualquier otro contenido
        initAgeVerification();

        // Paso 2: Cargar datos iniciales
        await loadInitialData();

        // Paso 3: Inicializar el carrusel de banners
        initCarousel(appState.banners);

        // Paso 4: Renderizar productos en sus respectivas secciones
        renderProducts(appState.products, '#novedades .product-grid', { isNew: true, limit: 8 });
        renderProducts(appState.products, '#licores .product-grid', { category: 'Licor', limit: 8 });
        renderProducts(appState.products, '#cervezas .product-grid', { category: 'Cerveza', limit: 8 });
        renderProducts(appState.products, '#snacks .product-grid', { category: 'Snack', limit: 8 });
        renderProducts(appState.products, '#cigarrillos .product-grid', { category: 'Cigarrillos', limit: 8 });
        renderProducts(appState.products, '#bebidas-no-alcoholicas .product-grid', { category: 'Bebida no alcohólica', limit: 8 });
        renderProducts(appState.products, '#ofertas .product-grid', { isOnOffer: true, limit: 8 }); // Productos en oferta

        // Paso 5: Configurar carruseles de categorías específicos (ejemplo: 'Licores Premium')
        // Aquí puedes crear un carrusel por categoría si lo deseas, o usar uno genérico.
        // Por ejemplo, para un carrusel de "Licores Premium":
        setupCategoryProductCarousel(appState.products.filter(p => p.category === 'Licor'), '#licores-premium-carousel-section');


        // Paso 6: Inicializar y configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 7: Inicializar y renderizar el carrito
        initCart();
        updateCartCount(); // Asegurarse de que el contador se actualice al cargar la página

        // Paso 8: Renderizar marcas
        renderBrands(appState.brands, '#brandLogos');

        // Paso 9: Inicializar módulo de soporte con el número de WhatsApp desde config.json
        if (appState.contactInfo.phone) {
            setupSupport(); // setupSupport ya obtiene el número de appState
        } else {
            console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
        }

        // Paso 10: Configurar event listeners de UI (botones de navegación, modales, etc.)
        setupUIEventListeners();

        // Paso 11: Configurar el estado activo de la barra de navegación inferior en base al scroll
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

        console.log('main.js: Aplicación inicializada completamente.');

    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});
