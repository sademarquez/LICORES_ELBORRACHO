// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart';
let cartSidebar;
let cartItemsContainer;
let cartTotalPriceElement;
let cartCountElement; // Contador del header
let bottomCartCountElement; // Contador de la barra inferior
let closeCartBtn;
let checkoutWhatsappBtn;

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    if (!cartSidebar || !cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !bottomCartCountElement || !closeCartBtn || !checkoutWhatsappBtn) {
        console.warn('cart.js: Algunos elementos del carrito no se encontraron. Funcionalidad limitada.');
        return;
    }

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            appState.cart = []; // Resetear carrito si hay un error de parseo
            showToastNotification('Error al recuperar el carrito. Se ha vaciado.', 'error');
        }
    } else {
        appState.cart = [];
    }

    renderCartItems(); // Renderiza los items cargados
    updateCartCount(); // Actualiza los contadores

    // Event Listeners
    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderViaWhatsApp);

    // Delegación de eventos para botones de cantidad y eliminar
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.closest('.cart-item')?.dataset.productId;

        if (!productId) return;

        if (target.classList.contains('increase-quantity-btn')) {
            updateQuantity(productId, 1);
        } else if (target.classList.contains('decrease-quantity-btn')) {
            updateQuantity(productId, -1);
        } else if (target.classList.contains('remove-item-btn')) {
            removeFromCart(productId);
        }
    });

    console.log('cart.js: Módulo de carrito inicializado.');
}

/**
 * Guarda el carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Alterna la visibilidad de la barra lateral del carrito.
 * @param {boolean} open - true para abrir, false para cerrar. Si se omite, alterna.
 */
export function toggleCartSidebar(open) {
    if (!cartSidebar) return;

    if (typeof open === 'boolean') {
        cartSidebar.classList.toggle('open', open);
    } else {
        cartSidebar.classList.toggle('open');
    }
}

/**
 * Añade un producto al carrito.
 * @param {Object} product - El objeto producto a añadir.
 */
export function addToCart(product) {
    if (!product || !product.id) {
        console.error('addToCart: Producto inválido recibido.', product);
        showToastNotification('No se pudo añadir el producto. Intenta de nuevo.', 'error');
        return;
    }

    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
        showToastNotification(`"${product.name}" (x${existingItem.quantity}) actualizado en el carrito.`, 'info');
    } else {
        appState.cart.push({ ...product, quantity: 1 });
        showToastNotification(`"${product.name}" añadido al carrito.`, 'success');
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - ID del producto.
 * @param {number} change - Cantidad a añadir o restar (-1 para restar, 1 para sumar).
 */
function updateQuantity(productId, change) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        appState.cart[itemIndex].quantity += change;

        if (appState.cart[itemIndex].quantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad llega a 0 o menos
            return;
        }
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);

    if (appState.cart.length < initialLength) {
        showToastNotification('Producto eliminado del carrito.', 'success');
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

/**
 * Renderiza los items actuales del carrito en la interfaz.
 */
function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) return;

    cartItemsContainer.innerHTML = ''; // Limpiar items existentes
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const itemTotal = itemPrice * item.quantity;
        totalPrice += itemTotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.dataset.productId = item.id;

        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">$${itemPrice.toLocaleString('es-CO')} c/u</span>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="decrease-quantity-btn" aria-label="Disminuir cantidad">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity-btn" aria-label="Aumentar cantidad">+</button>
                </div>
                <button class="remove-item-btn" aria-label="Eliminar item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
}

/**
 * Actualiza el número total de items en los contadores del carrito.
 */
export function updateCartCount() {
    if (!cartCountElement || !bottomCartCountElement) return;

    const totalCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount.toString();
    bottomCartCountElement.textContent = totalCount.toString();

    // Mostrar/ocultar el contador si es 0
    if (totalCount === 0) {
        cartCountElement.style.display = 'none';
        bottomCartCountElement.style.display = 'none';
    } else {
        cartCountElement.style.display = 'block';
        bottomCartCountElement.style.display = 'block';
    }
}

/**
 * Envía el pedido actual del carrito a través de WhatsApp.
 */
function sendOrderViaWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. ¡Añade productos antes de finalizar tu pedido!', 'warning');
        return;
    }

    const whatsappNumber = appState.contactInfo.phone;
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar el pedido.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AMi pedido es el siguiente:%0A%0A`;
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;
        message += `${index + 1}. ${item.quantity} x ${item.name} - $${itemPrice.toLocaleString('es-CO')} c/u%0A`;
    });

    message += `%0ATotal del pedido: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Tu pedido ha sido enviado a WhatsApp. Te contactaremos pronto.', 'success', 5000);

    // Opcional: Limpiar el carrito después de enviar el pedido por WhatsApp
    appState.cart = [];
    saveCart();
    renderCartItems();
    updateCartCount();
}
