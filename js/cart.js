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
            appState.cart = []; // Resetear carrito si hay un error de parsing
        }
    }

    renderCart(); // Renderizar el carrito al inicializar

    // Event Listeners
    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);

    // Delegación de eventos para botones de cantidad y eliminar
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('increase-quantity-btn')) {
            const productId = target.closest('.cart-item').dataset.productId;
            changeQuantity(productId, 1);
        } else if (target.classList.contains('decrease-quantity-btn')) {
            const productId = target.closest('.cart-item').dataset.productId;
            changeQuantity(productId, -1);
        } else if (target.classList.contains('remove-item-btn')) {
            const productId = target.closest('.cart-item').dataset.productId;
            removeFromCart(productId);
        }
    });

    // console.log('cart.js: Módulo de carrito inicializado.'); // ELIMINADO
}

/**
 * Añade un producto al carrito o incrementa su cantidad.
 * @param {Object} product - El objeto producto a añadir.
 */
export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToastNotification(`"${product.name}" añadido al carrito.`, 'success');
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialCartLength) {
        saveCart();
        renderCart();
        showToastNotification('Producto eliminado del carrito.', 'info');
    }
}

/**
 * Cambia la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 * @param {number} delta - La cantidad a añadir o restar (ej. 1, -1).
 */
function changeQuantity(productId, delta) {
    const item = appState.cart.find(item => item.id === productId);

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad llega a 0 o menos
        } else {
            saveCart();
            renderCart();
        }
    }
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Renderiza los elementos del carrito en la barra lateral.
 */
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;
    let totalItems = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
            const itemTotal = itemPrice * item.quantity;
            totalPrice += itemTotal;
            totalItems += item.quantity;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.dataset.productId = item.id;
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${itemPrice.toLocaleString('es-CO')} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="decrease-quantity-btn">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="increase-quantity-btn">+</button>
                    <button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
    }
    updateCartCount(totalItems); // Actualizar los contadores del header y bottom nav
}

/**
 * Actualiza el número de productos en el icono del carrito.
 * @param {number} count - El número total de productos en el carrito.
 */
export function updateCartCount(count) {
    if (cartCountElement) {
        cartCountElement.textContent = count.toString();
        cartCountElement.style.display = count > 0 ? 'flex' : 'none'; // Mostrar/ocultar burbuja
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = count.toString();
        bottomCartCountElement.style.display = count > 0 ? 'flex' : 'none'; // Mostrar/ocultar burbuja
    }
}

/**
 * Alterna la visibilidad de la barra lateral del carrito.
 * @param {boolean} open - true para abrir, false para cerrar. Si se omite, alterna.
 */
export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open');
        }
    }
}

/**
 * Envía el pedido a través de WhatsApp.
 */
function sendOrderToWhatsApp() {
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

    // Opcional: Limpiar el carrito después de enviar el pedido
    // appState.cart = [];
    // saveCart();
    // renderCart();
}
