// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js'; // Importar showToastNotification
import { initAgeVerification } from './age-verification.js'; // Importar initAgeVerification

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    // Iniciar la verificación de edad antes de cargar cualquier otra cosa
    // initAgeVerification(); // Se llama directamente en su propio script para asegurar que se ejecute primero

    await loadInitialData(); // Cargar datos de config.json y products.json

    // Inicializar módulos que dependen de appState
    initCart();
    updateCartCount(); // Actualiza el contador del carrito inicial

    initCarousel(appState.banners);

    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    // Pasamos appState.products y un filtro de categoría para cada sección
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });

    setupProductFilters(appState.products); // Esto afectará solo la sección principal de licores por su ID
    setupSearch();
    renderBrands(appState.brands); // Renderiza las marcas
    setupBottomNavListeners(); // NUEVO: Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pasa el número de WhatsApp a support.js

    updateFooterInfo(); // Actualiza la información del footer
    setupHeaderNavListeners(); // Configura los listeners de navegación del header
    setupMenuToggle(); // Configura el botón de menú hamburguesa
});

async function loadInitialData() {
    try {
        // Cargar config.json
        const configResponse = await fetch('config.json');
        if (!configResponse.ok) {
            throw new Error(`HTTP error! status: ${configResponse.status}`);
        }
        const configData = await configResponse.json();
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.contactInfo = {
            contactEmail: configData.contactEmail,
            contactPhone: configData.contactPhone,
            address: configData.address
        };
        console.log('Configuración cargada:', appState.contactInfo);


        // Cargar products.json
        const productsResponse = await fetch('products.json');
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        appState.products = productsData || [];
        console.log('Productos cargados:', appState.products.length);

    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showToastNotification('Error al cargar la información. Intenta de nuevo más tarde.', 'error');
    }
}

function updateFooterInfo() {
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear().toString();
    }

    const footerEmail = document.getElementById('footerEmail');
    const footerPhone = document.getElementById('footerPhone');
    const footerAddress = document.getElementById('footerAddress');
    const directWhatsappBtn = document.getElementById('directWhatsappBtn'); // Botón de WhatsApp directo en soporte

    if (footerEmail && appState.contactInfo.contactEmail) {
        footerEmail.textContent = appState.contactInfo.contactEmail;
        footerEmail.href = `mailto:${appState.contactInfo.contactEmail}`;
    }
    if (footerPhone && appState.contactInfo.contactPhone) {
        footerPhone.textContent = `+${appState.contactInfo.contactPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`; // Formato visual
        footerPhone.href = `tel:+${appState.contactInfo.contactPhone}`;
    }
    if (footerAddress && appState.contactInfo.address) {
        footerAddress.textContent = appState.contactInfo.address;
    }
    if (directWhatsappBtn && appState.contactInfo.contactPhone) {
        directWhatsappBtn.href = `https://wa.me/${appState.contactInfo.contactPhone}`;
    }
}

function setupHeaderNavListeners() {
    const headerNavLinks = document.querySelectorAll('.main-nav .nav-list a');
    const sections = document.querySelectorAll('main section');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');

    headerNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // No prevenir el default para que el scroll smooth del CSS funcione
            // e.preventDefault();

            // Quitar clase 'active' de todos los enlaces del header
            headerNavLinks.forEach(l => l.classList.remove('active'));
            // Añadir clase 'active' al enlace clickeado
            this.classList.add('active');

            // Cerrar menú móvil si está abierto
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (menuToggle) {
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Activar el enlace de navegación del header al hacer scroll
    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto, si el scroll está en la parte superior

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Ajuste para el sticky header
            const offset = 150; // Un valor para asegurar que la sección esté bien visible

            if (scrollY >= sectionTop - offset && scrollY < sectionTop + sectionHeight - offset) {
                currentActiveSection = section.id;
            }
        });

        headerNavLinks.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
}


function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('main section');
    const searchIcon = document.getElementById('bottomNavSearch');
    const cartIcon = document.getElementById('bottomNavCart');

    // Listener para los enlaces de navegación de la barra inferior
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Si es el botón de búsqueda o carrito, no prevenir default para su funcionalidad JS
            if (this.id === 'bottomNavSearch' || this.id === 'bottomNavCart') {
                // No prevenir el default si se va a manejar la apertura del modal/sidebar en JS
                // La funcionalidad ya está en search.js y cart.js
            } else {
                e.preventDefault(); // Prevenir default solo para enlaces de anclaje
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // Quitar clase 'active' de todos los ítems de la barra inferior
            bottomNavItems.forEach(i => i.classList.remove('active'));
            // Añadir clase 'active' al ítem clickeado
            this.classList.add('active');
        });
    });

    // Abrir search modal al hacer clic en el icono de búsqueda de la barra inferior
    if (searchIcon) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            // Abre el modal de búsqueda (asumiendo que hay un modal de búsqueda)
            // Si no hay modal de búsqueda, se puede redirigir o activar el input de búsqueda del header
            const searchInput = document.getElementById('productSearchInput');
            if (searchInput) {
                searchInput.focus();
                // Opcional: Desplazar a la sección de licores donde está el filtro de búsqueda
                document.getElementById('licores').scrollIntoView({ behavior: 'smooth' });
            } else {
                showToastNotification('No se encontró el campo de búsqueda.', 'warning');
            }
        });
    }

    // Abrir cart sidebar al hacer clic en el icono de carrito de la barra inferior
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(); // Llama a la función de cart.js
        });
    }

    // Activar el enlace de navegación inferior al hacer scroll
    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto, si el scroll está en la parte superior

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Ajuste para el sticky header y bottom nav
            const offset = 150; // Un valor para asegurar que la sección esté bien visible
            const bottomNavHeight = document.querySelector('.bottom-nav')?.offsetHeight || 0; // Altura del bottom nav

            if (scrollY >= sectionTop - offset && scrollY < sectionTop + sectionHeight - offset - bottomNavHeight) {
                currentActiveSection = section.id;
            }
        });

        // Manejar la clase 'active' solo si el elemento no es 'bottomNavSearch' o 'bottomNavCart'
        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;

            // Evitar activar el ítem del carrito o búsqueda si el scroll está en otra sección
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            } else if (item.id === 'bottomNavSearch' || item.id === 'bottomNavCart') {
                // No hacer nada si es el icono de búsqueda o carrito, ya que no corresponden a una sección de scroll.
                // Estos se activan solo al clickearlos.
            }
        });
    });
}

function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
            menuToggle.setAttribute('aria-expanded', !isExpanded); // Actualiza aria-expanded
        });

        // Cerrar menú al hacer clic en un enlace (o en cualquier parte de la nav)
        mainNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('.nav-list li')) { // Verifica si se hizo clic en un enlace o en un li
                mainNav.classList.remove('active');
                if (menuToggle) {
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    } else {
        console.warn('Elementos del menú móvil (menuToggle o mainNav) no encontrados. El menú móvil no funcionará.');
    }
}
