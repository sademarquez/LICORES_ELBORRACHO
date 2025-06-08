// js/main.js

import { initCarousel } from './carousel.js';
import { renderProducts, setupProductFilters, renderBrands } from './products.js';
// import { setupSearch } from './search.js'; // Eliminamos esta importación
import { initCart, updateCartCount, toggleCartSidebar } from './cart.js';
import { setupSupport } from './support.js';
import { showToastNotification } from './toast.js'; // Asegurarse de que esté importado

export const appState = {
    products: [],
    cart: [],
    banners: [],
    brands: [],
    contactInfo: {}
};

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
    // setupSearch(); // Eliminamos la llamada a setupSearch
    renderBrands(appState.brands);
    setupBottomNavListeners(); // NUEVO: Configura los listeners de la barra inferior
    setupSupport(appState.contactInfo.contactPhone); // Pasa solo el número de teléfono
    setupCategorySearchModal(); // NUEVO: Configura el modal de búsqueda por categoría
});

async function loadInitialData() {
    try {
        const [productsResponse, configResponse] = await Promise.all([
            fetch('products.json'),
            fetch('config.json')
        ]);

        appState.products = await productsResponse.json();
        const configData = await configResponse.json();
        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            contactEmail: configData.contactEmail,
            contactPhone: configData.contactPhone,
            address: configData.address
        };
        console.log('Datos iniciales cargados:', appState);
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        showToastNotification('Error al cargar los datos. Intenta de nuevo más tarde.', 'error');
    }
}

function setupBottomNavListeners() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const bottomNavSearch = document.getElementById('bottomNavSearch');
    const bottomNavCart = document.getElementById('bottomNavCart');
    // const cartSidebar = document.getElementById('cartSidebar'); // Asegúrate de que este elemento existe, ya se importa en cart.js

    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Si es el botón de carrito o de búsqueda, no prevenir el default para que el JS maneje el click
            if (e.currentTarget === bottomNavCart || e.currentTarget === bottomNavSearch) {
                // No prevenir el default aquí, se maneja más abajo
            } else {
                e.preventDefault(); // Prevenir el comportamiento por defecto de ancla para el resto
                const targetId = e.currentTarget.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // Desactivar todos y activar el actual, excepto para los botones de acción
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(); // Abre/cierra el sidebar del carrito
        });
    }

    if (bottomNavSearch) {
        bottomNavSearch.addEventListener('click', (e) => {
            e.preventDefault();
            const categorySearchModal = document.getElementById('categorySearchModal');
            if (categorySearchModal) {
                categorySearchModal.style.display = 'flex'; // Mostrar el modal
            }
        });
    }


    // Lógica para resaltar el ítem de navegación inferior según la sección visible
    window.addEventListener('scroll', () => {
        let currentActiveSection = 'novedades'; // Por defecto

        const sections = ['novedades', 'licores', 'cervezas', 'snacks', 'otras-bebidas', 'domicilios'];
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && window.scrollY >= section.offsetTop - 200) { // Offset ajustado
                currentActiveSection = sections[i];
                break;
            }
        }
        // Caso especial para cuando se está al principio de la página
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

function setupCategorySearchModal() {
    const categorySearchModal = document.getElementById('categorySearchModal');
    const closeBtn = categorySearchModal ? categorySearchModal.querySelector('.close-btn') : null;
    const categoryButtons = categorySearchModal ? categorySearchModal.querySelectorAll('.category-btn') : [];

    if (!categorySearchModal) {
        console.warn('Modal de búsqueda por categoría no encontrado. La funcionalidad no estará disponible.');
        return;
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            categorySearchModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === categorySearchModal) {
            categorySearchModal.style.display = 'none';
        }
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            let targetSectionId = '';
            if (category === 'Licor') {
                targetSectionId = 'licores';
            } else if (category === 'Cerveza') {
                targetSectionId = 'cervezas';
            } else if (category === 'Snack') {
                targetSectionId = 'snacks';
            } else if (category === 'Otra Bebida') {
                targetSectionId = 'otras-bebidas';
            }

            if (targetSectionId) {
                document.getElementById(targetSectionId).scrollIntoView({ behavior: 'smooth' });
                showToastNotification(`Mostrando productos de la categoría: ${category}`, 'info');
            } else {
                showToastNotification('Categoría no reconocida.', 'warning');
            }
            categorySearchModal.style.display = 'none'; // Cerrar el modal después de la selección
        });
    });
}
