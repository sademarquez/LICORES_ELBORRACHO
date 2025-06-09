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
        console.log('main.js: Datos de configuración cargados.', configData);

        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('main.js: Datos de productos cargados. Total:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification(`Error al cargar datos: ${error.message}. La aplicación no se renderizará completamente.`, 'error');
        // No se lanza el error para que la aplicación pueda intentar renderizar algo
        // incluso si faltan datos, aunque con funcionalidad limitada.
    }
}

/**
 * Renderiza todas las secciones de productos y marcas en la página.
 */
function renderAllSections() {
    // Renderizar banners si están disponibles
    if (appState.banners && appState.banners.length > 0) {
        initCarousel(appState.banners);
    } else {
        console.warn('main.js: No hay datos de banners cargados para el carrusel.');
    }

    // Renderizar Novedades (incluye nuevos y ofertas para simplificar)
    const newAndOfferProducts = appState.products.filter(p => p.isNew || p.isOnOffer);
    renderProducts(newAndOfferProducts, '#newProductsGrid', { limit: 12, title: 'Novedades y Ofertas' }); // Mostrar más items para un impacto 2x2 en grid

    // Renderizar productos por categoría para las secciones principales
    const categories = ['Licor', 'Cerveza', 'Vino', 'Snack', 'Bebida no alcohólica', 'Gaseosa', 'Cigarrillos', 'Bebida Energética'];
    categories.forEach(category => {
        const categoryId = category.toLowerCase().replace(/\s/g, '-');
        const selector = `#${categoryId}ProductsGrid`;
        const productsInCategory = appState.products.filter(p => p.category === category);
        // Shuffle and take a limited number for category carousels/grids
        const shuffledProducts = productsInCategory.sort(() => 0.5 - Math.random());
        renderProducts(shuffledProducts.slice(0, 8), selector, { category: category, title: category }); // Limitar a 8 para carruseles de categoría
    });

    // Configurar filtros para la sección 'Todos los productos' o 'Licores' si aplica
    // Asumimos que `#allProductsGrid` es la sección principal donde se muestran los licores por defecto o todos.
    setupProductFilters(appState.products, '#licorBrandFilter', '#licorPriceFilter', '#licorProductSearch', '#allProductsGrid', 'Licor');


    // Renderizar marcas en el carrusel de marcas
    if (appState.brands && appState.brands.length > 0) {
        renderBrands(appState.brands, '#brandsCarouselTrack');
    } else {
        console.warn('main.js: No hay datos de marcas cargados para renderizar.');
    }
}

/**
 * Configura los event listeners de la UI.
 */
function setupUIEventListeners() {
    // Configuración de botones de menú (hamburguesa)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active'); // Opcional: para animar el icono de hamburguesa
        });
    } else {
        console.warn('main.js: Elementos de menú (menuToggle o mainNav) no encontrados.');
    }

    // Configuración del modal de búsqueda
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSearchModal(true);
        });
    }
    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            toggleSearchModal(false);
        });
    }
    // Cerrar modal de búsqueda al hacer clic fuera (si está abierto)
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        window.addEventListener('click', (event) => {
            if (event.target === searchModal) {
                toggleSearchModal(false);
            }
        });
    }

    // Configuración del carrito
    const bottomNavCart = document.getElementById('bottomNavCart');
    const cartIconDesktop = document.getElementById('cartIconDesktop'); // Icono de carrito en desktop header
    const closeCartBtn = document.getElementById('closeCartBtn'); // Botón de cerrar en el sidebar
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
    if (cartIconDesktop) {
        cartIconDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }
    // Cerrar sidebar del carrito al hacer clic fuera
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        window.addEventListener('click', (event) => {
            if (event.target === cartSidebar) {
                toggleCartSidebar(false);
            }
        });
    }

    // Manejo de clicks en enlaces de navegación para scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#bottomNavSearch' || href === '#bottomNavCart') {
                return; // Ignorar estos enlaces ya que tienen funcionalidad JS
            }
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - (document.querySelector('.main-header').offsetHeight + 20), // Ajustar por el header
                    behavior: 'smooth'
                });
            }
            // Cerrar menú hamburguesa si está abierto
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        });
    });
}

/**
 * Configura el estado activo de la barra de navegación inferior en función del scroll.
 */
function setupBottomNavActiveState() {
    const sections = document.querySelectorAll('main section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.6 // Porcentaje del elemento visible para considerarlo activo
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${targetId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Ajuste inicial para la sección de Novedades si está en vista al cargar
    // Puede ser necesario un pequeño retraso para asegurar que los elementos se han renderizado
    setTimeout(() => {
        const novedadesSection = document.getElementById('novedades');
        if (novedadesSection) {
            const rect = novedadesSection.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                // Si 'novedades' está completamente visible al inicio, activarlo
                document.querySelector('.bottom-nav .nav-item[href="#novedades"]').classList.add('active');
            }
        }
    }, 500); // Pequeño retraso para que el DOM esté completamente listo
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplicación EL BORRACHO inicializada correctamente.');

    // Importante: age-verification.js ya maneja su propio DOMContentLoaded y su lógica.
    // Asegurarse de que el resto de la aplicación solo cargue después de la verificación si es necesario.
    // En este caso, la verificación de edad es un modal que se oculta, no bloquea la carga de JS.

    await loadInitialData(); // Espera a que los datos se carguen antes de renderizar

    if (appState.products.length === 0) {
        console.warn('main.js: No se pudieron cargar los productos. La aplicación no se renderizará completamente.');
        // Puedes mostrar un mensaje de error grande en la UI si no hay productos
        document.querySelector('main').innerHTML = `<p style="text-align: center; margin-top: 50px; font-size: 1.5em; color: var(--danger-color);">
            ¡Oh no! No pudimos cargar los productos en este momento. Por favor, inténtalo de nuevo más tarde.
        </p>`;
        return; // Detener la ejecución si no hay datos críticos
    }

    // Paso 1: Inicializar el carrito (debe ser lo primero para cargar el estado)
    initCart();

    // Paso 2: Renderizar todas las secciones de productos y marcas
    renderAllSections();

    // Paso 3: Inicializar la funcionalidad de búsqueda
    setupSearch();

    // Paso 4: Inicializar módulo de soporte con el número de WhatsApp desde config.json
    if (appState.contactInfo.phone) {
        setupSupport(appState.contactInfo.phone);
    } else {
        console.warn('main.js: Número de teléfono de contacto no encontrado en config.json para el módulo de soporte.');
    }

    // Paso 5: Configurar event listeners de UI (botones de navegación, modales, etc.)
    setupUIEventListeners();

    // Paso 6: Configurar el estado activo de la barra de navegación inferior en base al scroll
    setupBottomNavActiveState();
});
