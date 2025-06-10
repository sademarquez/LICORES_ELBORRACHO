// js/main.js

const API_PRODUCTS_URL = 'products.json'; // O la URL de tu API
let allProducts = [];
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 8; // Define cuántos productos cargar con "Ver Más"

// --- FUNCIONES DE RENDERIZADO (Crean HTML) ---

/**
 * Crea el elemento HTML para una tarjeta de producto con el nuevo diseño.
 * @param {Object} product - El objeto del producto.
 * @returns {HTMLElement} El elemento de la tarjeta.
 */
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-name-overlay">
                <h3 class="product-name">${product.name}</h3>
            </div>
        </div>
        <div class="product-details">
            <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
            <button class="add-to-cart-btn" data-id="${product.id}">Agregar</button>
        </div>
    `;
    return card;
}

/**
 * Renderiza los botones de las categorías.
 * @param {string[]} categories - Un array de nombres de categoría.
 */
function renderCategoryButtons(categories) {
    const container = document.getElementById('categoryButtonsContainer');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', () => {
            // Maneja el estado 'active' del botón
            container.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Muestra los productos de esa categoría
            renderProductsByCategory(category);
        });
        container.appendChild(button);
    });
}


// --- FUNCIONES DE LÓGICA DE UI (Muestran/Ocultan/Actualizan) ---

/**
 * Muestra los productos de una categoría específica en el carrusel lateral.
 * @param {string} category - La categoría seleccionada.
 */
function renderProductsByCategory(category) {
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;

    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = ''; // Limpia el contenedor

    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => {
            container.appendChild(renderProductCard(product));
        });
    } else {
        container.innerHTML = `<p class="w-full text-center text-text-color-secondary">No hay productos en esta categoría.</p>`;
    }
}

/**
 * Muestra la primera página de productos en la cuadrícula principal.
 */
function displayInitialProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;

    grid.innerHTML = ''; // Limpiar
    const productsToDisplay = allProducts.slice(0, PRODUCTS_PER_PAGE);
    
    productsToDisplay.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProductsCount = productsToDisplay.length;

    // Ocultar el botón si no hay más productos que mostrar
    loadMoreBtn.style.display = displayedProductsCount >= allProducts.length ? 'none' : 'block';
}

/**
 * Carga y añade más productos a la cuadrícula principal.
 */
function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;

    const nextProducts = allProducts.slice(displayedProductsCount, displayedProductsCount + PRODUCTS_PER_PAGE);
    
    nextProducts.forEach(product => {
        const card = renderProductCard(product);
        grid.appendChild(card);
    });
    
    displayedProductsCount += nextProducts.length;

    // Ocultar el botón si ya no hay más productos
    if (displayedProductsCount >= allProducts.length) {
        loadMoreBtn.style.display = 'none';
    }
}


// --- INICIALIZACIÓN DE LA APLICACIÓN ---

/**
 * La función principal que se ejecuta cuando el DOM está listo.
 */
async function main() {
    try {
        const response = await fetch(API_PRODUCTS_URL);
        if (!response.ok) throw new Error(`Error al cargar los productos: ${response.statusText}`);
        allProducts = await response.json();

        // 1. Renderizar los componentes iniciales que dependen de los datos
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        displayInitialProducts();

        // 2. Si hay categorías, mostrar los productos de la primera por defecto
        if (categories.length > 0) {
            document.querySelector('.category-btn')?.click();
        }
        
        // 3. Configurar los event listeners que no dependen de datos
        document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreProducts);

    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        // Aquí podrías mostrar un mensaje de error en la UI
    }
}

// Punto de entrada: Ejecutar la función principal
document.addEventListener('DOMContentLoaded', main);
