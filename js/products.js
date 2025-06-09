// products.js

// Function to fetch products from products.json
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

// Function to render a single product card (reusable for lists and carousels)
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card'); // Common class for styling
    productCard.dataset.productId = product.id; // Store product ID for cart/details

    // Optional: Add a class for carousel items if needed for specific styling
    // productCard.classList.add('carousel-item-content');

    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
        ${product.isOnOffer ? '<span class="product-offer-tag">OFERTA</span>' : ''}
        ${product.isNew ? '<span class="product-new-tag">NUEVO</span>' : ''}
        <button class="add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
    `;
    return productCard;
}

// Function to render products into a given container (e.g., a list or a carousel)
export function renderProductsInContainer(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Product container not found:', containerId);
        return;
    }
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        container.appendChild(renderProductCard(product));
    });
}

// Function to get products by category
export async function getProductsByCategory(category) {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.category === category);
}

// Function to get new products
export async function getNewProducts() {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.isNew);
}

// Function to get products on offer
export async function getOfferProducts() {
    const allProducts = await fetchProducts();
    return allProducts.filter(product => product.isOnOffer);
}

// You might also want a function to handle adding to cart click events here or in main.js
// For now, assuming main.js handles it or it's handled in cart.js
