// products.js

// Función para cargar los productos desde products.json
export async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Función para renderizar los productos en la página principal
// (Asumiendo que tienes un contenedor para todos los productos)
export function renderAllProducts(products, containerId = 'product-list-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Product container not found:', containerId);
        return;
    }
    container.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card'); // Asegúrate de que esta clase exista en tu CSS

        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price.toLocaleString('es-CO')}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
        `;
        container.appendChild(productCard);
    });
}

// Función para obtener productos por categoría (ejemplo de uso)
export async function getProductsByCategory(category) {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.category === category);
}

// Funciones para obtener novedades y ofertas
export async function getNewProducts() {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.isNew);
}

export async function getOfferProducts() {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.isOnOffer);
}

// Asegúrate de que las funciones de añadir al carrito estén correctamente enlazadas,
// posiblemente en `main.js` o `cart.js`
// Ejemplo:
// document.addEventListener('click', (event) => {
//     if (event.target.classList.contains('add-to-cart-btn')) {
//         const productId = event.target.dataset.productId;
//         // Llamar a la función de añadir al carrito desde cart.js
//         addToCart(productId);
//     }
// });
