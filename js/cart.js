// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart';
// Mueve las declaraciones de variables aquí para que estén disponibles en todo el módulo
let cartSidebar, cartItemsContainer, cartTotalPriceElement, cartCountElement, bottomCartCountElement, closeCartBtn, checkoutWhatsappBtn;

export function initCart() {
    // Asigna las variables dentro de la función de inicialización
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount');
    bottomCartCountElement = document.getElementById('bottomCartCount');
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    // CORRECCIÓN: Verificación robusta. Si faltan elementos cruciales, la función se detiene.
    if (!cartSidebar || !closeCartBtn || !checkoutWhatsappBtn) {
        console.warn('cart.js: Faltan elementos esenciales del carrito (#cartSidebar, #closeCartBtn, #checkoutWhatsappBtn). La funcionalidad del carrito estará deshabilitada.');
        return;
    }

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Error al parsear el carrito desde localStorage:", e);
            appState.cart = [];
        }
    }

    // Los event listeners solo se añaden si los botones existen
    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);

    cartItemsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const productId = button.dataset.id;
        if (button.classList.contains('remove-item-btn')) {
            removeFromCart(productId);
        } else if (button.classList.contains('quantity-decrease')) {
            updateCartQuantity(productId, -1);
        } else if (button.classList.contains('quantity-increase')) {
            updateCartQuantity(productId, 1);
        }
    });

    updateCartDisplay();
}

// El resto de las funciones (toggleCartSidebar, addToCart, etc.) permanecen igual.
// ...
