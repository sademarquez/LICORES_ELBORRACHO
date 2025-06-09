// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Importar el nuevo módulo

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
    activeCategory: null // Para rastrear la categoría activa para "Ver todos"
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
        appState.products = await productsResponse.json();
        console.log('main.js: products.json cargado. Total de productos:', appState.products.length);

    } catch (error) {
        console.error('main.js: Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos. Algunas funciones podrían no estar disponibles.', 'error');
    }
}

/**
 * Configura los event listeners para la interfaz de usuario.
 */
function setupUIEventListeners() {
    // Manejar toggle del menú de navegación móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    } else {
        console.warn('main.js: Elementos de toggle de menú no encontrados.');
    }

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (menuToggle) {
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            }
        });
    });

    // Abrir/Cerrar modales genéricos (ej. Fault Report, Appointment)
    document.querySelectorAll('.modal .close-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = 'none'; // Asegurarse de que se oculta completamente
            }
        });
    });

    // Cerrar modales al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('open');
                modal.style.display = 'none';
            }
        });
    });

    // Abrir/Cerrar carrito
    const openCartBtn = document.getElementById('openCartBtn');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const closeCartBtn = document.getElementById('closeCartBtn'); // Este ya está en cart.js, pero lo referenciamos aquí para el evento de click principal
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: Botón para abrir carrito (header) no encontrado.');
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar scroll a #
            toggleCartSidebar(true);
        });
    } else {
        console.warn('main.js: Botón para abrir carrito (bottom nav) no encontrado.');
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    } else {
        console.warn('main.js: Botón para cerrar carrito (sidebar) no encontrado.');
    }

    // Abrir/Cerrar modal de búsqueda
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: Botón para abrir búsqueda (header) no encontrado.');
    }

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar scroll a #
            toggleSearchModal(true);
        });
    } else {
        console.warn('main.js: Botón para abrir búsqueda (bottom nav) no encontrado.');
    }

    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
    } else {
        console.warn('main.js: Botón para cerrar búsqueda (modal) no encontrado.');
    }

    // Navegación a "Todos los Productos" con filtro de categoría
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            appState.activeCategory = category; // Guarda la categoría activa
            const allProductsSection = document.getElementById('productos-todos');
            const categoryFilter = document.getElementById('categoryFilter');
            const allProductsSearchInput = document.getElementById('allProductsSearchInput');
            const priceFilter = document.getElementById('priceFilter');

            if (allProductsSection) {
                // Ocultar todas las secciones excepto "Todos los Productos"
                document.querySelectorAll('main section').forEach(section => {
                    if (section.id !== 'productos-todos') {
                        section.classList.add('hidden');
                    } else {
                        section.classList.remove('hidden'); // Mostrar sección de todos los productos
                    }
                });
                
                // Aplicar el filtro de categoría y restablecer otros filtros
                if (categoryFilter) {
                    categoryFilter.value = category;
                    // Disparar evento change para que setupProductFilters reaccione
                    const event = new Event('change');
                    categoryFilter.dispatchEvent(event);
                }
                if (allProductsSearchInput) allProductsSearchInput.value = '';
                if (priceFilter) priceFilter.value = ''; // Resetear orden de precio
                
                // Scroll a la sección
                allProductsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn('main.js: Sección "Todos los Productos" no encontrada.');
            }
        });
    });

    // Manejar clic en "Ver todos" o "Ver más novedades"
    document.querySelectorAll('a[href="#productos-todos"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            appState.activeCategory = null; // Resetear categoría activa al ver todos
            const allProductsSection = document.getElementById('productos-todos');
            const categoryFilter = document.getElementById('categoryFilter');
            const allProductsSearchInput = document.getElementById('allProductsSearchInput');
            const priceFilter = document.getElementById('priceFilter');

            if (allProductsSection) {
                document.querySelectorAll('main section').forEach(section => {
                    if (section.id !== 'productos-todos') {
                        section.classList.add('hidden');
                    } else {
                        section.classList.remove('hidden');
                    }
                });

                if (categoryFilter) categoryFilter.value = ''; // Limpiar filtro de categoría
                if (allProductsSearchInput) allProductsSearchInput.value = '';
                if (priceFilter) priceFilter.value = '';

                // Volver a configurar filtros para que renderice todo sin filtros específicos
                setupProductFilters(appState.products, '#allProductsGrid', { targetCategoryFilterId: 'categoryFilter' });

                allProductsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

}

/**
 * Configura el estado activo de la barra de navegación inferior.
 */
function setupBottomNavActiveState() {
    const bottomNavLinks = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section[id]'); // Todas las secciones con ID

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                bottomNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                    // Manejo especial para "Inicio" que apunta a #novedades pero el link es #novedades
                    if (currentSectionId === 'novedades' && link.getAttribute('aria-label') === 'Inicio') {
                         link.classList.add('active');
                    }
                });
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px 0px -50% 0px', // un poco por debajo del centro de la pantalla
        threshold: 0.3 // cuando el 30% de la sección es visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Si la página carga sin scroll (arriba), asegurar que "Inicio" esté activo
    // Después de un pequeño delay para que el observador tenga tiempo de actuar
    setTimeout(() => {
        const anyActive = Array.from(bottomNavLinks).some(link => link.classList.contains('active'));
        if (!anyActive) {
            const homeLink = document.querySelector('.bottom-nav .nav-item[aria-label="Inicio"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }, 500);

    // Event listeners para los enlaces del bottom-nav que NO son modales
    bottomNavLinks.forEach(link => {
        if (!['bottomNavSearch', 'bottomNavCart'].includes(link.id)) { // Excluir los que abren modales/sidebars
            link.addEventListener('click', (e) => {
                // Eliminar 'active' de todos los enlaces del bottom-nav
                bottomNavLinks.forEach(navLink => navLink.classList.remove('active'));
                // Añadir 'active' solo al enlace clickeado
                e.currentTarget.classList.add('active');
            });
        }
    });
}


/**
 * Inicializa la aplicación después de que el DOM esté completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOM cargado. Inicializando la aplicación...');

    // Paso 1: Cargar datos iniciales (productos, banners, configuración)
    await loadInitialData();

    try {
        // Paso 2: Inicializar carrusel de banners si hay datos
        if (appState.banners.length > 0) {
            initCarousel(appState.banners);
            console.log('main.js: Carrusel de banners inicializado.');
        } else {
            console.warn('main.js: No se encontraron datos de banners para inicializar el carrusel.');
        }

        // Paso 3: Renderizar productos en la sección "Novedades" (isNew)
        renderProducts(appState.products, '#newProductsGrid', { isNew: true, limit: 8 });
        console.log('main.js: Productos de novedades renderizados.');

        // Paso 4: Renderizar productos en la sección "Ofertas Destacadas" (isOnOffer)
        renderProducts(appState.products, '#offerProductsGrid', { isOnOffer: true, limit: 8 });
        console.log('main.js: Productos de ofertas renderizados.');

        // Paso 5: Renderizar marcas
        renderBrands(appState.brands, '#brandsGrid');
        console.log('main.js: Marcas renderizadas.');

        // Paso 6: Configurar carruseles de productos por categoría
        // Asegúrate de tener los contenedores en tu HTML para cada categoría
        setupCategoryProductCarousel(appState.products, '#licoresCarousel', 'Licor');
        setupCategoryProductCarousel(appState.products, '#cervezasCarousel', 'Cerveza');
        // Agrega más categorías según sea necesario

        console.log('main.js: Carruseles de categorías configurados.');


        // Paso 7: Inicializar filtros para la sección "Todos los Productos"
        setupProductFilters(appState.products, '#allProductsGrid', {
            targetCategoryFilterId: 'categoryFilter',
            targetSearchInputId: 'allProductsSearchInput',
            targetPriceFilterId: 'priceFilter'
        });
        console.log('main.js: Filtros de productos configurados.');

        // Paso 8: Inicializar módulo de búsqueda
        setupSearch();
        console.log('main.js: Módulo de búsqueda inicializado.');

        // Paso 9: Inicializar carrito de compras
        initCart();
        console.log('main.js: Carrito inicializado.');

        // Paso 10: Inicializar módulo de soporte con el número de WhatsApp desde config.json
        if (appState.contactInfo.phone) {
            setupSupport(appState.contactInfo.phone);
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
        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');
        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }


    } catch (error) {
        console.error('main.js: No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación.', 'error');
    }
});
