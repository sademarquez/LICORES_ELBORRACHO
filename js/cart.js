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
        checkoutWhatsappBtn.addEventListener('click', sendCartToWhatsApp);
    }
    console.log('cart.js: Carrito inicializado.');
}

export function addToCart(product) {
    // Buscar si el producto ya existe en el carrito
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
        showToastNotification(`Cantidad de "${product.name}" actualizada en el carrito.`, 'info');
    } else {
        appState.cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCartItems();
    updateCartCount();
}

export function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

export function updateCartItemQuantity(productId, change) {
    const item = appState.cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad llega a 0 o menos
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement || !checkoutWhatsappBtn) {
        console.warn('Elementos del carrito no encontrados. No se puede renderizar el carrito.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart" style="font-size: 3em; color: var(--text-color-light);"></i>
                <p>Tu carrito está vacío. ¡Es hora de llenarlo!</p>
                <a href="#novedades" class="btn-primary" onclick="window.location.hash='#novedades'; toggleCartSidebar(false);">Explorar Productos</a>
            </div>
        `;
        cartTotalPriceElement.textContent = '$0';
        checkoutWhatsappBtn.style.display = 'none'; // Ocultar botón de checkout si no hay items
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            totalPrice += itemPrice * item.quantity;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${itemPrice.toLocaleString('es-CO')} c/u</p>
                </div>
                <div class="cart-item-quantity">
                    <button data-product-id="${item.id}" data-change="-1">-</button>
                    <span>${item.quantity}</span>
                    <button data-product-id="${item.id}" data-change="1">+</button>
                </div>
                <button class="remove-from-cart-btn" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
        checkoutWhatsappBtn.style.display = 'block'; // Mostrar botón de checkout
    }

    // Añadir event listeners para los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.cart-item-quantity button').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const change = parseInt(e.target.dataset.change);
            updateCartItemQuantity(productId, change);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            removeFromCart(productId);
        });
    });
}

export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        // Solo muestra el contador si hay items
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    if (bottomCartCountElement) { // Actualiza también el contador de la barra inferior
        bottomCartCountElement.textContent = totalItems;
        bottomCartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open');
        }
    }
}

function sendCartToWhatsApp() {
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
    // appState.cart = [];
    // saveCart();
    // renderCartItems();
    // updateCartCount();
    // showToastNotification('Tu pedido ha sido enviado a WhatsApp. ¡Pronto nos contactaremos contigo!', 'success');
    toggleCartSidebar(false); // Cerrar sidebar después de enviar
}
