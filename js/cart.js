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

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
        showToastNotification('Error al guardar el carrito. Por favor, inténtalo de nuevo.', 'error');
    }
}

/**
 * Renderiza los items del carrito en el sidebar.
 */
export function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('cart.js: Elementos del carrito no encontrados para renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido actual del carrito
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</p>
                <div class="cart-item-quantity-controls">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.name}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.name}">+</button>
                </div>
            </div>
            <button class="remove-from-cart-btn" data-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir event listeners a los nuevos botones en el carrito
    cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            updateQuantity(id, -1);
        });
    });

    cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            updateQuantity(id, 1);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id);
        });
    });
}

/**
 * Actualiza los contadores de items en el carrito.
 */
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
        bottomCartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {string} productId - ID del producto a añadir.
 */
export function addToCart(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        return;
    }

    const existingCartItem = appState.cart.find(item => item.id === productId);

    if (existingCartItem) {
        existingCartItem.quantity++;
        showToastNotification(`Cantidad de ${product.name} actualizada en el carrito.`, 'info');
    } else {
        const itemToAdd = { ...product, quantity: 1 };
        appState.cart.push(itemToAdd);
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }

    saveCart();
    renderCartItems();
    updateCartCount();
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialLength) {
        showToastNotification('Producto eliminado del carrito.', 'info');
        saveCart();
        renderCartItems();
        updateCartCount();
    } else {
        showToastNotification('Error al eliminar el producto del carrito.', 'error');
    }
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - ID del producto.
 * @param {number} change - Cantidad a añadir o restar (ej: 1 o -1).
 */
function updateQuantity(productId, change) {
    const item = appState.cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
            showToastNotification(`Cantidad de ${item.name} actualizada a ${item.quantity}.`, 'info');
        }
    }
}

/**
 * Alterna la visibilidad del sidebar del carrito.
 * @param {boolean} [open] - Si se debe abrir (true) o cerrar (false) explícitamente. Si no se pasa, alterna.
 */
export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open');
        }
        document.body.classList.toggle('no-scroll', cartSidebar.classList.contains('open'));
    }
}

/**
 * Procesa el pedido y lo envía a WhatsApp.
 */
function checkoutViaWhatsapp() {
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
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;
        message += `${index + 1}. ${item.quantity} x ${item.name} - $${itemPrice.toLocaleString('es-CO')} c/u%0A`;
    });

    message += `%0ATotal del pedido: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Opcional: Limpiar el carrito después de enviar el pedido por WhatsApp
    appState.cart = [];
    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification('Tu pedido ha sido enviado a WhatsApp. Espera nuestra confirmación.', 'success');
    toggleCartSidebar(false); // Cerrar sidebar después de enviar
}

/**
 * Inicializa el módulo del carrito.
 */
export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            appState.cart = []; // Resetear carrito si hay un error de parseo
            showToastNotification('Error al cargar el carrito. Se ha reiniciado.', 'error');
        }
    } else {
        appState.cart = [];
    }

    // Configurar el botón de WhatsApp
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.removeEventListener('click', checkoutViaWhatsapp); // Evitar duplicados
        checkoutWhatsappBtn.addEventListener('click', checkoutViaWhatsapp);
    }

    // Renderizar y actualizar contadores al inicio
    renderCartItems();
    updateCartCount();

    console.log('cart.js: Módulo de carrito inicializado.');
}
