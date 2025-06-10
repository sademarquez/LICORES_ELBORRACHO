// js/main.js

const API_PRODUCTS_URL = 'products.json'; // Usando tu archivo local
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 8; // 2 filas de 4 en desktop

// --- RENDERIZADO DE ELEMENTOS ---
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
        <button class="add-to-cart-btn" data-id="${product.id}">Agregar</button>
    `;
    return card;
}

function renderCategories(categories) {
    const container = document.getElementById('categoryButtonsContainer');
    container.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.onclick = () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProductsByCategory(category);
        };
        container.appendChild(button);
    });
}

function renderProductsByCategory(category) {
    const container = document.getElementById('categoryProductsContainer');
    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = '';
    filteredProducts.slice(0, 5).forEach(product => { // Mostrar hasta 5
        container.appendChild(renderProductCard(product));
    });
}

function displayInitialProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = ''; // Limpiar grid
    const productsToDisplay = allProducts.slice(0, productsPerPage);
    productsToDisplay.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProducts = productsToDisplay.length;

    if (displayedProducts >= allProducts.length) {
        document.getElementById('loadMoreBtn').style.display = 'none';
    }
}

function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const nextProducts = allProducts.slice(displayedProducts, displayedProducts + productsPerPage);
    
    nextProducts.forEach(product => {
        const card = renderProductCard(product);
        card.style.animation = 'fadeIn 0.5s ease-out'; // Animación de entrada
        grid.appendChild(card);
    });
    
    displayedProducts += nextProducts.length;

    if (displayedProducts >= allProducts.length) {
        document.getElementById('loadMoreBtn').style.display = 'none';
    }
}

// --- LÓGICA DE INICIALIZACIÓN ---
async function initApp() {
    try {
        const response = await fetch(API_PRODUCTS_URL);
        allProducts = await response.json();

        // 1. Renderizar categorías
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategories(categories);
        
        // 2. Renderizar productos iniciales
        displayInitialProducts();
        
        // 3. Configurar botón "Ver Más"
        document.getElementById('loadMoreBtn').addEventListener('click', loadMoreProducts);

    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
