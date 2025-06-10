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
let cartOverlay; // Nuevo: Referencia al overlay

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    cartOverlay = document.getElementById('cartOverlay'); // Inicializar el overlay

    if (!cartSidebar || !cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !bottomCartCountElement || !closeCartBtn || !checkoutWhatsappBtn || !cartOverlay) {
        console.warn('cart.js: Algunos elementos del carrito o del overlay no se encontraron. Funcionalidad limitada.');
        return;
    }

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            appState.cart = []; // Resetear si hay un error
        }
    }

    // Event Listeners
    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);
    cartOverlay.addEventListener('click', () => toggleCartSidebar(false)); // Cierra el carrito al hacer clic en el overlay

    // Actualizar el UI del carrito al inicio
    updateCartUI();
    updateCartCount(); // Asegura que el contador se actualice al inicio

    // Asegurarse de que el carrito está cerrado al cargar la página
    toggleCartSidebar(false); // Llamar explícitamente para asegurar que esté cerrado.

    // console.log('cart.js: Módulo de carrito configurado.'); // ELIMINADO
}

/**
 * Alterna la visibilidad del sidebar del carrito.
 * @param {boolean} open - Si es true, abre el carrito; si es false, lo cierra. Si se omite, alterna.
 */
export function toggleCartSidebar(open) {
    if (!cartSidebar || !cartOverlay) {
        console.warn('toggleCartSidebar: Elementos del carrito o overlay no encontrados.');
        return;
    }

    const isOpen = cartSidebar.classList.contains('open');

    if (typeof open === 'boolean') {
        if (open) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Evita el scroll del body
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = ''; // Restaura el scroll del body
        }
    } else {
        // Alternar el estado
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
}


/**
 * Añade un producto al carrito o actualiza su cantidad.
 * @param {Object} product - El producto a añadir.
 * @param {number} quantity - La cantidad a añadir.
 */
export function addToCart(product, quantity = 1) {
    const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        appState.cart[existingItemIndex].quantity += quantity;
        showToastNotification(`¡${product.name} (x${quantity}) añadido de nuevo al carrito!`, 'info');
    } else {
        appState.cart.push({ ...product, quantity });
        showToastNotification(`¡${product.name} añadido al carrito!`, 'success');
    }

    saveCart();
    updateCartUI();
    updateCartCount();
    toggleCartSidebar(true); // Abrir el carrito al añadir un producto
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
export function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);

    if (appState.cart.length < initialCartLength) {
        showToastNotification('Producto eliminado del carrito.', 'info');
    } else {
        showToastNotification('Error: Producto no encontrado en el carrito.', 'error');
    }

    saveCart();
    updateCartUI();
    updateCartCount();
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 * @param {number} newQuantity - La nueva cantidad.
 */
export function updateCartItemQuantity(productId, newQuantity) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad es 0 o menos
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
            updateCartCount();
        }
    }
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    // console.log('Carrito guardado:', appState.cart); // ELIMINADO
}

/**
 * Renderiza los elementos del carrito y calcula el total.
 */
function updateCartUI() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido actual

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">Tu carrito está vacío.</p>`;
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    let total = 0;
    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${itemPrice.toLocaleString('es-CO')} c/u</span>
            </div>
            <div class="cart-item-quantity-controls">
                <button class="quantity-decrease" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-increase" data-id="${item.id}">+</button>
            </div>
            <button class="remove-from-cart" data-id="${item.id}" aria-label="Eliminar ${item.name}">&times;</button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;

    // Añadir event listeners a los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const item = appState.cart.find(i => i.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity - 1);
            }
        });
    });

    cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const item = appState.cart.find(i => i.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
            }
        });
    });

    cartItemsContainer.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        });
    });
}

/**
 * Actualiza los contadores de productos en el carrito (header y bottom nav).
 */
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
        bottomCartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

/**
 * Envía el resumen del pedido al número de WhatsApp configurado.
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

    // Opcional: Limpiar el carrito después de enviar el pedido
    appState.cart = [];
    saveCart();
    updateCartUI();
    updateCartCount();
    toggleCartSidebar(false); // Cerrar el carrito después de enviar el pedido
}
