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
        }
    } else {
        appState.cart = [];
    }

    updateCartDisplay(); // Renderizar el carrito al cargar

    // Event Listeners
    closeCartBtn.addEventListener('click', toggleCartSidebar);
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);

    // Cerrar el sidebar si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === cartSidebar && cartSidebar.classList.contains('open')) {
            toggleCartSidebar();
        }
    });
}

/**
 * Abre o cierra el sidebar del carrito.
 */
export function toggleCartSidebar() {
    cartSidebar.classList.toggle('open');
    if (cartSidebar.classList.contains('open')) {
        cartSidebar.focus(); // Enfocar el sidebar para accesibilidad
    }
}

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {string} productId - El ID del producto a añadir.
 */
export function addToCart(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        return;
    }

    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
        showToastNotification(`${product.name} actualizado en el carrito.`, 'info');
    } else {
        appState.cart.push({ ...product, quantity: 1 });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }
    saveCart();
    updateCartDisplay();
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialCartLength) {
        showToastNotification('Producto eliminado del carrito.', 'info');
        saveCart();
        updateCartDisplay();
    }
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 * @param {number} change - Cantidad a sumar o restar (ej. 1 o -1).
 */
function changeQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
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
 * Renderiza los ítems del carrito y actualiza los totales y contadores.
 */
export function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    let totalItemsInCart = 0;
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-text-color-light text-center">Tu carrito está vacío.</p>';
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
            const subtotal = itemPrice * item.quantity;
            totalPrice += subtotal;
            totalItemsInCart += item.quantity;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item', 'flex', 'items-center', 'gap-4', 'mb-4', 'pb-4', 'border-b', 'border-border-color');
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md border border-border-color">
                <div class="cart-item-details flex-grow">
                    <h4 class="text-text-color-dark font-semibold">${item.name}</h4>
                    <p class="text-sm text-text-color-light">${item.brand}</p>
                    <p class="price text-accent-color font-bold">$${itemPrice.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-controls flex items-center gap-2">
                    <button class="quantity-btn decrease-quantity-btn bg-secondary-color text-text-color-dark px-2 py-1 rounded-md hover:bg-primary-color hover:text-secondary-color-dark transition-colors" data-id="${item.id}">-</button>
                    <span class="item-quantity text-text-color-dark font-bold">${item.quantity}</span>
                    <button class="quantity-btn increase-quantity-btn bg-secondary-color text-text-color-dark px-2 py-1 rounded-md hover:bg-primary-color hover:text-secondary-color-dark transition-colors" data-id="${item.id}">+</button>
                    <button class="remove-item-btn text-danger-color text-lg hover:text-red-700 transition-colors" data-id="${item.id}">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        // Añadir event listeners a los botones de cantidad y eliminar
        cartItemsContainer.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                changeQuantity(event.target.dataset.id, 1);
            });
        });
        cartItemsContainer.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                changeQuantity(event.target.dataset.id, -1);
            });
        });
        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                removeFromCart(event.target.dataset.id);
            });
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
    cartCountElement.textContent = totalItemsInCart.toString();
    bottomCartCountElement.textContent = totalItemsInCart.toString();
}

/**
 * Genera el mensaje de pedido y lo envía a WhatsApp.
 */
function sendOrderToWhatsapp() {
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

    // Opcional: Vaciar el carrito después de enviar el pedido
    appState.cart = [];
    saveCart();
    updateCartDisplay();
    toggleCartSidebar(); // Cierra el modal después de enviar
}
