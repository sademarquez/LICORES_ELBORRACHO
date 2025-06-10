// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

// ... (código de inicialización de variables)

export function initCart() {
    // ... (código de initCart)
}

// ¡LA CLAVE ESTÁ AQUÍ! Añade 'export'
export function toggleCartSidebar(forceState) {
    // ...
}

// ¡Y AQUÍ! Añade 'export'
export function addToCart(productId, quantity = 1) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        appState.cart.push({ ...product, quantity });
    }
    showToastNotification(`${product.name} añadido al carrito.`, 'success');
    saveCart();
    updateCartDisplay();
}

// ... (resto de las funciones, no necesitan export)
