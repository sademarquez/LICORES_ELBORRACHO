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
        console.warn('cart.js: Algunos elementos del carrito no se encontraron. La funcionalidad del carrito podría estar limitada.');
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

    // Configurar event listener para el botón de WhatsApp
    checkoutWhatsappBtn.addEventListener('click', sendOrderViaWhatsapp);

    console.log('cart.js: Carrito inicializado.');
}

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {Object} product - El objeto producto a añadir.
 */
export function addToCart(product) {
    const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        appState.cart[existingItemIndex].quantity++;
        showToastNotification(`Cantidad de ${product.name} actualizada en el carrito.`, 'info');
    } else {
        const itemToAdd = { ...product, quantity: 1 }; // Copia el producto y añade cantidad
        appState.cart.push(itemToAdd);
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }

    saveCart();
    renderCartItems();
    updateCartCount();
    toggleCartSidebar(true); // Abrir el carrito al añadir un producto
    console.log('Producto añadido al carrito:', appState.cart);
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 * @param {number} change - La cantidad a añadir o restar (ej., 1 o -1).
 */
function updateQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad llega a cero
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
}

/**
 * Renderiza los ítems actuales del carrito en el DOM.
 */
function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-color-light); padding: var(--spacing-md);">El carrito está vacío.</p>`;
    } else {
        appState.cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');

            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            const subtotal = itemPrice * item.quantity;
            totalPrice += subtotal;

            cartItemDiv.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">$${itemPrice.toLocaleString('es-CO')}</p>
                    <p>Subtotal: <span>$${subtotal.toLocaleString('es-CO')}</span></p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                    <button class="remove-from-cart-btn" data-id="${item.id}">X</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir event listeners a los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
    });
    cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
    });
    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
    });
}

/**
 * Actualiza los contadores de ítems del carrito en el header y la barra inferior.
 */
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
    }
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Muestra u oculta la barra lateral del carrito.
 * @param {boolean} open - Si es true, abre el sidebar; si es false, lo cierra.
 */
export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open'); // Toggle si no se especifica 'open'
        }
    }
}

/**
 * Envía el pedido actual del carrito a través de WhatsApp.
 */
function sendOrderViaWhatsapp() {
    if (appState.cart.length === 0) {
        showToastNotification('El carrito está vacío. ¡Añade productos antes de finalizar tu pedido!', 'warning');
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
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
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
    toggleCartSidebar(false); // Cerrar el carrito después de enviar
}
