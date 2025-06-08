// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart'; // Clave de almacenamiento actualizada
let cartSidebar;
let cartItemsContainer;
let cartTotalPriceElement;
let cartCountElement; // Contador del header
let bottomCartCountElement; // NUEVO: Contador de la barra inferior
let closeCartBtn;
let checkoutWhatsappBtn;

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // NUEVO: Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        appState.cart = JSON.parse(storedCart);
    } else {
        appState.cart = [];
    }

    const cartIcon = document.getElementById('cartIcon'); // Icono del header
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }

    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    }

    console.log('Módulo de carrito inicializado.');
}

export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartCount();
}

export function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartCount();
}

export function updateQuantity(productId, newQuantity) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
            updateCartCount();
        }
    }
}

export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (bottomCartCountElement) { // NUEVO: Actualiza también el contador de la barra inferior
        bottomCartCountElement.textContent = totalItems.toString();
        bottomCartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    renderCartItems();
    updateCartTotalPrice();
}

function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = ''; // Limpiar el contenedor

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty-message">Tu carrito está vacío.</p>`;
        return;
    }

    appState.cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${(item.isOnOffer ? item.offerPrice : item.price).toLocaleString('es-CO')}</p>
            </div>
            <div class="cart-item-actions">
                <button class="decrease-quantity-btn" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-quantity-btn" data-id="${item.id}">+</button>
                <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Añadir event listeners a los botones de cantidad y remover
    cartItemsContainer.querySelectorAll('.decrease-quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = appState.cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });

    cartItemsContainer.querySelectorAll('.increase-quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = appState.cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id);
            showToastNotification('Producto eliminado del carrito', 'info');
        });
    });
}

function updateCartTotalPrice() {
    let total = 0;
    appState.cart.forEach(item => {
        total += (item.isOnOffer ? item.offerPrice : item.price) * item.quantity;
    });
    if (cartTotalPriceElement) {
        cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }
}

export function toggleCartSidebar(forceOpen) {
    if (cartSidebar) {
        if (forceOpen === true) {
            cartSidebar.classList.add('open');
        } else if (forceOpen === false) {
            cartSidebar.classList.remove('open');
        } else {
            cartSidebar.classList.toggle('open');
        }
    }
}

function sendOrderToWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
        return;
    }

    const whatsappNumber = appState.contactInfo.contactPhone; // Obtener número de config.json

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`; // Mensaje actualizado
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${((item.isOnOffer ? item.offerPrice : item.price) * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += (item.isOnOffer ? item.offerPrice : item.price) * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Te contactaremos pronto.', 'success');
    appState.cart = []; // Vaciar el carrito después de enviar el pedido
    localStorage.removeItem(CART_STORAGE_KEY); // Eliminar del almacenamiento local
    updateCartCount(); // Actualizar la UI del carrito
    toggleCartSidebar(false); // Cerrar el sidebar del carrito
}
