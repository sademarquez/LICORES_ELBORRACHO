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

    renderCartItems(); // Renderiza los items cargados
    updateCartCount(); // Actualiza los contadores

    // Configurar el botón de WhatsApp
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderViaWhatsApp);
    }

    // Configurar el botón de cierre del sidebar
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }

    // Cerrar sidebar al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (cartSidebar && event.target === cartSidebar) {
            toggleCartSidebar(false);
        }
    });

    console.log('cart.js: Módulo del carrito inicializado.');
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Renderiza los items del carrito en el sidebar y actualiza el total.
 */
function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('Elementos del carrito no encontrados para renderizar items.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido actual

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    let total = 0;
    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.dataset.id = item.id;

        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="price">$${itemPrice.toLocaleString('es-CO')}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.name}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.name}">+</button>
                </div>
            </div>
            <button class="remove-item-btn" data-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;

    // Añadir event listeners a los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const action = event.currentTarget.classList.contains('increase') ? 'increase' : 'decrease';
            updateItemQuantity(productId, action);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            removeItemFromCart(productId);
        });
    });
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - ID del producto a actualizar.
 * @param {string} action - 'increase' para aumentar, 'decrease' para disminuir.
 */
function updateItemQuantity(productId, action) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (action === 'increase') {
            appState.cart[itemIndex].quantity++;
        } else if (action === 'decrease') {
            appState.cart[itemIndex].quantity--;
            if (appState.cart[itemIndex].quantity <= 0) {
                // Si la cantidad llega a 0 o menos, eliminar el producto del carrito
                removeItemFromCart(productId);
                return;
            }
        }
        renderCartItems();
        updateCartCount();
        saveCart();
    }
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - ID del producto a eliminar.
 */
function removeItemFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    showToastNotification('Producto eliminado del carrito.', 'info');
    renderCartItems();
    updateCartCount();
    saveCart();
}


export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        // Opcional: mostrar/ocultar si es 0
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems;
        bottomCartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';

        // Añadir/quitar clase para animar solo al añadir
        if (totalItems > 0 && !bottomCartCountElement.classList.contains('pulsing')) {
            bottomCartCountElement.classList.add('pulsing');
            setTimeout(() => {
                bottomCartCountElement.classList.remove('pulsing');
            }, 500); // Duración de la animación de pulso
        } else if (totalItems === 0) {
            bottomCartCountElement.classList.remove('pulsing');
        }
    }
    saveCart();
}

export function addToCart(product) {
    const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Si el producto ya está en el carrito, incrementa la cantidad
        appState.cart[existingItemIndex].quantity += 1;
        showToastNotification(`Se añadió una unidad más de ${product.name} al carrito.`, 'info');
    } else {
        // Si no está, añade el producto con cantidad 1
        appState.cart.push({ ...product, quantity: 1 });
        showToastNotification(`${product.name} ha sido añadido al carrito.`, 'success');
    }
    renderCartItems();
    updateCartCount(); // Esto disparará la animación si se ha añadido la clase 'pulsing'
}


/**
 * Abre o cierra el sidebar del carrito.
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
 * Prepara y envía el pedido a través de WhatsApp.
 */
function sendOrderViaWhatsApp() {
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

    // Opcional: Limpiar el carrito después de enviar el pedido por WhatsApp
    // appState.cart = [];
    // saveCart();
    // renderCartItems();
    // updateCartCount();
    // showToastNotification('Tu pedido ha sido enviado a WhatsApp...
}
