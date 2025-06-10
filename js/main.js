// js/main.js

// Importaciones de módulos
import { initCarousel } from './carousel.js'; // Para el carrusel principal de banners
import { renderProducts, setupProductFilters, renderBrands } from './products.js'; // Para la grilla de productos y la sección de marcas (en desuso para marcas ahora)
import { setupSearch, toggleSearchModal } from './search.js'; // Para la funcionalidad de búsqueda
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js'; // Para el carrito de compras
import { setupSupport } from './support.js'; // Para los modales de soporte/contacto
import { showToastNotification } from './toast.js'; // Para las notificaciones emergentes
import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Para la navegación por categorías de productos
import { initAgeVerification } from './age-verification.js'; // Para el modal de verificación de edad
import { initContinuousProductCarousel } from './continuous-carousel.js'; // Para el carrusel infinito de logos de marcas

/**
 * appState: Objeto global para almacenar el estado de la aplicación.
 * Permite que los datos y el estado sean accesibles a través de diferentes módulos.
 * Es crucial que estos arrays se llenen antes de que los componentes intenten renderizarse.
 */
export const appState = {
    products: [],      // Almacenará todos los productos cargados de products.json
    cart: [],          // Almacenará los productos en el carrito del usuario
    banners: [],       // Almacenará los datos de banners cargados de config.json
    brands: [],        // Almacenará los datos de marcas cargados de config.json
    contactInfo: {}    // Almacenará la información de contacto de config.json
};

/**
 * Carga los datos iniciales de configuración (banners, marcas, contacto)
 * y los productos desde archivos JSON. Popula appState con los datos cargados.
 * Utiliza Promise.all para cargar los JSON en paralelo para mayor eficiencia.
 */
async function loadInitialData() {
    try {
        console.log('main.js: Iniciando carga de datos iniciales...');

        // Cargar config.json y products.json en paralelo
        const [configResponse, productsResponse] = await Promise.all([
            fetch('config.json'),
            fetch('products.json')
        ]);

        // Verificar si las respuestas HTTP son exitosas
        if (!configResponse.ok) {
            throw new Error(`Error HTTP! status: ${configResponse.status} al cargar config.json`);
        }
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }

        // Parsear las respuestas JSON
        const configData = await configResponse.json();
        const productsData = await productsResponse.json();

        // Asignar los datos al appState
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };
        appState.products = productsData || []; // Asigna los productos directamente

        console.log('main.js: Datos iniciales cargados exitosamente:', appState);

    } catch (error) {
        console.error('main.js: Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar la información principal del sitio. Intenta recargar.', 'error');
        // Lanzar el error para que el bloque .catch del DOMContentLoaded lo maneje
        throw error;
    }
}

/**
 * Configura los event listeners para la interfaz de usuario (UI).
 * Esto incluye la navegación superior, búsqueda, carrito, y modales.
 */
function setupUIEventListeners() {
    // Event listener para el botón de búsqueda en el header
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    } else {
        console.warn('main.js: searchIcon no encontrado.');
    }

    // Event listener para el botón del carrito en el header
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => toggleCartSidebar(true));
    } else {
        console.warn('main.js: cartIcon no encontrado.');
    }

    // Event listener para el menú hamburguesa en móvil
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    } else {
        console.warn('main.js: menuToggle o mainNav no encontrados.');
    }

    // Event listeners para la navegación inferior móvil
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el enlace salte a un ancla
            toggleSearchModal(true);
        });
    }

    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true);
        });
    }
}

/**
 * Configura el estado activo de los elementos de la barra de navegación inferior
 * basándose en la sección visible en el viewport o en el hash de la URL.
 * Esto mejora la UX en dispositivos móviles.
 */
function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Función para actualizar el estado activo
    const updateActiveNav = () => {
        let activeFound = false;
        // Prioridad: Carrusel (inicio), luego categorías, luego productos
        const sections = [
            { id: 'hero-carousel', navId: '#hero-carousel' },
            { id: 'categoryProductsSection', navId: '#allProductsGridSection' }, // Usar el mismo para ambos si el menú es general de productos
            { id: 'allProductsGridSection', navId: '#allProductsGridSection' },
            { id: 'support-section', navId: '#support-section' }
            // Agrega más secciones según sea necesario
        ];

        for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el && el.getBoundingClientRect().top < window.innerHeight / 2 && el.getBoundingClientRect().bottom > window.innerHeight / 2) {
                navItems.forEach(item => {
                    if (item.getAttribute('href') === section.navId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                activeFound = true;
                break;
            }
        }

        // Si ninguna sección visible, mantener el primer elemento activo o ninguno
        if (!activeFound && navItems.length > 0) {
            navItems.forEach((item, index) => {
                if (index === 0) { // O el que consideres 'Inicio' por defecto
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    };

    // Escuchar el evento scroll para actualizar la navegación
    window.addEventListener('scroll', updateActiveNav);
    // Ejecutar al cargar la página para establecer el estado inicial
    updateActiveNav();
}


/**
 * Función para inicializar las animaciones de revelado al scroll.
 * Utiliza Intersection Observer API.
 */
function setupScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Dejar de observar una vez que es visible
            }
        });
    }, {
        threshold: 0.1, // Elemento visible en un 10%
        rootMargin: '0px 0px -50px 0px' // Margen para que aparezcan un poco antes de llegar al centro
    });

    revealElements.forEach(el => observer.observe(el));
}


/**
 * Punto de entrada principal de la aplicación.
 * Se ejecuta una vez que el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('main.js: DOMContentLoaded - Iniciando aplicación...');

    try {
        // Paso 1: Inicializar la verificación de edad (PRIORIDAD ALTA)
        // Esto debe ejecutarse antes de cualquier otra cosa que interactúe con el DOM.
        // El modal se mostrará si la edad no está verificada y bloqueará el contenido.
        initAgeVerification();
        // Si el usuario no verifica la edad, el script se detendrá (por redirección o bloqueo).
        // Por eso, el resto de la lógica de inicialización debe ejecutarse solo si la edad ya está verificada.
        // La lógica en age-verification.js maneja la visibilidad del modal.
        // Si el modal está oculto, el flujo continúa.

        // Asegurarse de que el resto del código solo se ejecute si la edad ya está verificada
        // Esto asume que initAgeVerification() maneja la visibilidad del modal y
        // permite que el script continúe si la edad está verificada.
        // Si la verificación de edad redirige o bloquea completamente, este código no se ejecutará.
        const ageVerificationModal = document.getElementById('ageVerificationModal');
        if (ageVerificationModal && window.getComputedStyle(ageVerificationModal).display !== 'none') {
            // Si el modal está visible, significa que el usuario aún no ha verificado la edad.
            // Detener la inicialización completa de la aplicación aquí.
            console.log('main.js: Esperando verificación de edad para continuar la inicialización.');
            return;
        }

        // Paso 2: Cargar todos los datos iniciales (productos, banners, marcas, contacto)
        await loadInitialData();

        // Paso 3: Inicializar el carrito de compras (carga desde localStorage y actualiza UI)
        initCart(); // Esto también actualiza los contadores del carrito

        // Paso 4: Inicializar el carrusel principal de banners
        // Se llama solo si hay banners en appState
        if (appState.banners && appState.banners.length > 0) {
            initCarousel(appState.banners);
        } else {
            console.warn('main.js: No hay datos de banners para inicializar el carrusel principal.');
            // Opcional: Ocultar la sección del carrusel si no hay banners
            document.getElementById('hero-carousel').style.display = 'none';
        }

        // Paso 5: Inicializar el carrusel continuo de marcas
        // Se llama solo si hay marcas en appState
        if (appState.brands && appState.brands.length > 0) {
            // `renderBrands` ya no se usa para el carrusel continuo, `initContinuousProductCarousel` lo hace.
            initContinuousProductCarousel(appState.brands, 'continuousCarouselTrack', 'Marcas Principales');
        } else {
            console.warn('main.js: No hay datos de marcas para inicializar el carrusel continuo.');
            // Opcional: Ocultar la sección del carrusel de marcas
            document.getElementById('brandCarouselSection').style.display = 'none';
        }

        // Paso 6: Configurar la sección de categorías de productos y sus botones
        // Se llama solo si hay productos para categorías
        if (appState.products && appState.products.length > 0) {
            setupCategoryProductCarousel(appState.products, '#categoryProductsSection');
        } else {
            console.warn('main.js: No hay productos para configurar el carrusel de categorías.');
            document.getElementById('categoryProductsSection').style.display = 'none';
        }


        // Paso 7: Renderizar todos los productos en la grilla principal
        // Y configurar sus filtros.
        // `renderProducts` ahora se encarga de mostrar todos los productos.
        if (appState.products && appState.products.length > 0) {
             renderProducts(appState.products, '#allProductsGrid'); // Renderiza todos los productos en la grilla
             // setupProductFilters necesita todos los productos y el ID del contenedor de la grilla
             setupProductFilters(appState.products, '#allProductsGrid');
        } else {
            console.warn('main.js: No hay productos para renderizar en la grilla principal.');
            document.getElementById('allProductsGridSection').style.display = 'none';
        }


        // Paso 8: Configurar la funcionalidad de búsqueda
        setupSearch();

        // Paso 9: Configurar la funcionalidad de soporte y modales
        setupSupport();

        // Paso 10: Configurar las animaciones de revelado al scroll (opcional pero recomendado)
        setupScrollAnimations();

        // Paso 11: Configurar los event listeners generales de la UI (header, bottom nav)
        setupUIEventListeners();

        // Paso 12: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        // Asegúrate de que los IDs existan en tu HTML
        const contactEmailEl = document.getElementById('contactEmail');
        const contactPhoneEl = document.getElementById('contactPhone');
        const contactAddressEl = document.getElementById('contactAddress');
        const footerEmailEl = document.getElementById('footerEmail'); // Si tienes IDs diferentes en el footer
        const footerPhoneEl = document.getElementById('footerPhone');
        const footerAddressEl = document.getElementById('footerAddress');

        if (contactEmailEl) contactEmailEl.textContent = appState.contactInfo.email || 'N/A';
        if (contactPhoneEl) contactPhoneEl.textContent = appState.contactInfo.phone || 'N/A';
        if (contactAddressEl) contactAddressEl.textContent = appState.contactInfo.address || 'N/A';
        
        if (footerEmailEl) footerEmailEl.textContent = appState.contactInfo.email || 'N/A';
        if (footerPhoneEl) footerPhoneEl.textContent = appState.contactInfo.phone || 'N/A';
        if (footerAddressEl) footerAddressEl.textContent = appState.contactInfo.address || 'N/A';


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
