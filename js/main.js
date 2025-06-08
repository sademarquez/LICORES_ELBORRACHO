// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
import { setupSearch } from './search.js';
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js'; // Will be repurposed for 'Domicilios y Pedidos'

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

async function loadInitialData() {
    try {
        // Adjust paths if config.json and products.json are in a different directory
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), // Assuming it's in the root or accessible directly
            fetch('/products.json') // Assuming it's in the root or accessible directly
        ]);

        if (!configResponse.ok) {
            throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);
        }
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        }

        const configData = await configResponse.json();
        const productsData = await productsResponse.json();

        appState.contactInfo = configData.contactInfo || {}; // Ensure contactInfo is available
        appState.banners = configData.banners || [];
        appState.brands = configData.brands || [];
        appState.products = productsData || [];

        console.log('Datos iniciales cargados con éxito.');
        console.log('Productos cargados en appState:', appState.products.length, 'productos encontrados.');
        if (appState.products.length === 0) {
            console.warn('¡Advertencia! appState.products está vacío. Los productos no se mostrarán.');
        }

    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado. Inicializando la aplicación...');

    await loadInitialData();

    initCart();
    updateCartCount(); // Actualiza el contador del carrito inicial

    initCarousel(appState.banners);
    // Renderiza productos en las nuevas secciones de licores, cervezas, snacks, etc.
    renderProducts(appState.products, '#allProductsGrid', { category: 'Licor' }); // Principal de Licores
    renderProducts(appState.products, '#allProductsGridCervezas', { category: 'Cerveza' });
    renderProducts(appState.products, '#allProductsGridSnacks', { category: 'Snack' });
    renderProducts(appState.products, '#allProductsGridOtrasBebidas', { category: 'Otra Bebida' });


    setupProductFilters(appState.products); // Esto afectará solo la sección principal de licores por su ID
    setupSearch();
    renderBrands(appState.brands);
    setupBottomNavListeners(); // NUEVO: Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pass the contact phone number
    setupScrollSpy(); // NEW: Setup scroll spy for bottom navigation

    // Agrega esto para asegurar que el modal de verificación de edad se inicialice
    // aunque no se importe directamente aquí, se espera que age-verification.js se ejecute.
    // Si no se ejecuta, asegúrate de que esté correctamente enlazado en index.html
    // <script src="js/age-verification.js" type="module"></script>
});

function setupBottomNavListeners() {
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');
    const searchInput = document.getElementById('searchInput'); // Get the main search input

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to the search input in the header and focus it
            if (searchInput) {
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchInput.focus();
            }
        });
    }

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Always open the cart sidebar
        });
    }
}


function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Default to novedades

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust this value based on your header height and desired scroll offset
            if (scrollY >= sectionTop - 150 && scrollY < sectionTop + sectionHeight - 150) {
                currentActiveSection = section.getAttribute('id');
            }
        });

        // Special case for the top of the page, where 'novedades' might be the active section
        if (scrollY < document.getElementById('licores').offsetTop - 150) {
            currentActiveSection = 'novedades';
        }


        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            // Quitar el '#' para comparar con el ID de la sección
            const targetId = item.getAttribute('href') ? item.getAttribute('href').substring(1) : null;
            if (targetId && targetId === currentActiveSection) {
                item.classList.add('active');
            }
        });
    });
}


// Función setupMobileMenu() comentada/removida, ya que la barra inferior la reemplaza
// function setupMobileMenu() {
//     const menuToggle = document.getElementById('menuToggle');
//     const mainNav = document.querySelector('.main-nav');

//     if (menuToggle && mainNav) {
//         menuToggle.addEventListener('click', () => {
//             mainNav.classList.toggle('active');
//             menuToggle.querySelector('i').classList.toggle('fa-bars');
//             menuToggle.querySelector('i').classList.toggle('fa-times');
//         });

//         mainNav.addEventListener('click', (e) => {
//             if (e.target.tagName === 'A' || e.target.tagName === 'LI') {
//                 mainNav.classList.remove('active');
//                 menuToggle.querySelector('i').classList.remove('fa-times');
//                 menuToggle.querySelector('i').classList.add('fa-bars');
//             }\
//         });
//     }
// }
