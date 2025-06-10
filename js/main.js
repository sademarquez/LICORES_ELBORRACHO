// js/main.js

const API_PRODUCTS_URL = 'products.json'; // Usando tu archivo local
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 8; // 2 filas de 4 en desktop

// --- RENDERIZADO DE ELEMENTOS ---
function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Nueva estructura con el nombre sobre la imagen
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

// RESTAURAMOS LA LÓGICA DEL CARRUSEL
function renderProductsByCategory(category) {
    // El contenedor ahora es `.category-products-carousel`
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;

    // Le asignamos la clase correcta para los estilos del carrusel
    container.className = 'category-products-carousel'; 
    
    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = '';
    
    // Puedes mostrar todos los productos de la categoría en el scroll
    filteredProducts.forEach(product => {
        container.appendChild(renderProductCard(product));
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = `<p class="w-full text-center text-text-color-secondary">No hay productos en esta categoría.</p>`;
    }
}

// ... (resto de funciones de renderizado)

function renderProductsByCategory(category) {
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;
    
    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = '';
    
    // CORRECCIÓN: Mostrar hasta 6 productos para llenar las 2 filas (2x3 en móvil)
    const productsToShow = filteredProducts.slice(0, 6); 
    
    productsToShow.forEach(product => {
        container.appendChild(renderProductCard(product));
    });

    if (productsToShow.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-text-color-secondary">No hay productos en esta categoría.</p>`;
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
