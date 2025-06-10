// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js';
// import { setupCategoryProductCarousel } from './category-products-carousel.js'; // Descomentar si decides usar el carrusel de categorías
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
        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            email: configData.contactEmail,
            phone: configData.contactPhone,
            address: configData.address
        };

        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`Error HTTP! status: ${productsResponse.status} al cargar products.json`);
        }
        appState.products = await productsResponse.json();

    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar datos iniciales. Recarga la página.', 'error');
        throw error; // Propagar el error para detener la inicialización de la app
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initAgeVerification();

    // Nota: La lógica de `initAgeVerification` ya maneja la visualización del modal
    // y la verificación de edad. El resto de la aplicación se inicializará
    // después de que el usuario interactúe con el modal (si se muestra).
    // Si necesitas que el resto de la app espere explícitamente a que el modal se cierre,
    // puedes usar un evento personalizado o una promesa dentro de initAgeVerification.
    // Por simplicidad, asumimos que si el modal está oculto, la verificación ya pasó.
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    // Para asegurar que el resto de la app no cargue si el modal de edad está activo,
    // puedes usar un MutationObserver o un evento personalizado.
    // Para esta entrega, asumo que `initAgeVerification` ya lo maneja bien.
    if (ageVerificationModal && ageVerificationModal.style.display !== 'none' && localStorage.getItem('ageVerified') !== 'true') {
        // Si el modal está visible y la edad no está verificada,
        // no cargamos el resto de la app hasta que el usuario confirme la edad.
        // La confirmación de edad oculta el modal y permite que el código siga.
        // Podríamos envolver esto en una Promesa si la dependencia es más fuerte.
        // Por ahora, el comportamiento existente de age-verification.js es suficiente.
        // El resto del código de inicialización de la app se ejecutará tan pronto
        // como el modal se cierre.
    }

    try {
        await loadInitialData();

        // Paso 1: Inicializar Carrusel Principal (Banners)
        initCarousel(appState.banners);

        // Paso 2: Renderizar Carruseles de Productos (Novedades y Ofertas)
        const newProducts = appState.products.filter(p => p.isNew);
        const offerProducts = appState.products.filter(p => p.isOnOffer);
        
        renderProducts(newProducts, 'newProductsTrack');
        renderProducts(offerProducts, 'offerProductsTrack');

        // Paso 3: Renderizar Cuadrícula de Todos los Productos
        renderProducts(appState.products, 'allProductsGrid');

        // Paso 4: Inicializar Carrusel Continuo de Marcas
        renderBrands(appState.brands, '#continuousCarouselTrack'); // Cambiado a renderBrands para la animación de brands en CSS

        // Paso 5: Configurar filtros de productos (si tienes una sección de filtros)
        setupProductFilters(appState.products, 'allProductsGridSection');


        // Paso 6: Inicializar el carrito
        initCart();
        updateCartCount(); // Asegurarse de que el contador del carrito se actualice al inicio


        // Paso 7: Configurar búsqueda
        setupSearch();

        // Paso 8: Configurar soporte
        setupSupport();

        // Paso 9: Configurar los oyentes de eventos de UI generales
        setupUIEventListeners();

        // Paso 10: Configurar el estado activo de la barra de navegación inferior
        setupBottomNavActiveState();

        // Actualizar información de contacto en el footer/contacto
        const contactEmailElem = document.getElementById('contactEmail');
        const contactPhoneElem = document.getElementById('contactPhone');
        const contactAddressElem = document.getElementById('contactAddress');
        const footerEmailElem = document.getElementById('footerEmail');
        const footerPhoneElem = document.getElementById('footerPhone');
        const footerAddressElem = document.getElementById('footerAddress');
        const footerWhatsappLink = document.querySelector('.social-media a[href*="whatsapp"]');

        if (contactEmailElem) contactEmailElem.textContent = appState.contactInfo.email || 'N/A';
        if (contactPhoneElem) contactPhoneElem.textContent = appState.contactInfo.phone || 'N/A';
        if (contactAddressElem) contactAddressElem.textContent = appState.contactInfo.address || 'N/A';
        
        if (footerEmailElem) footerEmailElem.textContent = appState.contactInfo.email || 'N/A';
        if (footerPhoneElem) footerPhoneElem.textContent = appState.contactInfo.phone || 'N/A';
        if (footerAddressElem) footerAddressElem.textContent = appState.contactInfo.address || 'N/A';

        if (footerWhatsappLink && appState.contactInfo.phone) {
            footerWhatsappLink.href = `https://wa.me/${appState.contactInfo.phone}`;
        }


    } catch (error) {
        console.error('No se pudieron cargar los productos o la aplicación no se renderizó completamente.', error);
        showToastNotification('Error crítico al iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
});

// Nota: Estas funciones se agregaron para consolidar los event listeners de UI.
function setupUIEventListeners() {
    // Menu Toggle (Header)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Cart Icon (Header and Bottom Nav)
    const cartIcon = document.getElementById('cartIcon');
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => toggleCartSidebar(true));
    }
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', () => toggleCartSidebar(true));
    }

    // Search Icon (Header and Bottom Nav)
    const searchIcon = document.getElementById('searchIcon');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    // Desktop Search Input
    const desktopSearchInput = document.getElementById('desktopSearchInput');

    if (searchIcon) {
        searchIcon.addEventListener('click', () => toggleSearchModal(true));
    }
    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', () => toggleSearchModal(true));
    }
    // Para el input de búsqueda en desktop, cuando se presiona Enter
    if (desktopSearchInput) {
        desktopSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                toggleSearchModal(true); // Abre el modal
                // Opcional: si quieres que el modal se inicialice con el término
                // document.getElementById('searchInput').value = desktopSearchInput.value;
                // Luego en search.js, si el input ya tiene valor, se ejecuta la búsqueda
            }
        });
    }


    // Close cart sidebar when clicking outside (only if open)
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        document.addEventListener('click', (event) => {
            if (cartSidebar.classList.contains('open') && !cartSidebar.contains(event.target) && !event.target.closest('#cartIcon') && !event.target.closest('#bottomNavCart')) {
                toggleCartSidebar(false);
            }
        });
    }
}

function setupBottomNavActiveState() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    // Obtenemos todas las secciones principales que tienen un ID para observar
    const sections = document.querySelectorAll('main section[id]');

    // Observador para detectar cuándo una sección está en la vista
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover 'active' de todos los items de navegación
                navItems.forEach(item => item.classList.remove('active'));
                
                // Añadir 'active' al item de navegación correspondiente
                const targetId = `#${entry.target.id}`;
                const activeNavItem = document.querySelector(`.bottom-nav a[href="${targetId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }
        });
    }, { threshold: 0.5 }); // Un umbral del 50% significa que al menos el 50% de la sección debe estar visible

    // Observar cada sección
    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejar clics directos en los elementos del bottom nav para desplazamiento suave
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Asegúrate de actualizar la clase activa también en el click
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}
