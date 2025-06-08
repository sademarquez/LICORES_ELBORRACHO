// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart'; // Cambiar clave de almacenamiento
let cartSidebar;
let cartItemsContainer;
let cartTotalPriceElement;
let cartCountElement;
let closeCartBtn;
let checkoutWhatsappBtn;

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount');
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        appState.cart = JSON.parse(storedCart);
    } else {
        appState.cart = [];
    }

    const cartIcon = document.getElementById('cartIcon');
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

    renderCart();
    console.log('Módulo de carrito inicializado.');
}

export function addProductToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToastNotification(`${product.name} añadido al carrito.`, 'success');
}

export function removeProductFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

export function updateCartItemQuantity(productId, quantity) {
    const item = appState.cart.find(i => i.id === productId);
    if (item) {
        item.quantity = parseInt(quantity, 10);
        if (item.quantity <= 0) {
            removeProductFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

function renderCart() {
    if (!cartItemsContainer || !cartTotalPriceElement || !cartCountElement) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        cartCountElement.textContent = '0';
        return;
    }

    appState.cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${(item.isOnOffer ? item.offerPrice : item.price).toLocaleString('es-CO')}</p>
            </div>
            <div class="cart-item-controls">
                <input type="number" value="${item.quantity}" min="1" data-product-id="${item.id}">
                <button class="remove-from-cart-btn" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);

        total += (item.isOnOffer ? item.offerPrice : item.price) * item.quantity;
        itemCount += item.quantity;
    });

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;
    cartCountElement.textContent = itemCount.toString();

    // Add event listeners for quantity change and remove button
    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            updateCartItemQuantity(e.target.dataset.productId, e.target.value);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            removeProductFromCart(e.target.dataset.productId || e.target.closest('button').dataset.productId);
        });
    });
}

export function updateCartCount() {
    if (!cartCountElement) return;
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems.toString();
}

export function toggleCartSidebar(forceOpen = undefined) {
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

    const whatsappNumber = appState.contactInfo.contactPhone;

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`;
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${((item.isOnOffer ? item.offerPrice : item.price) * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += (item.isOnOffer ? item.offerPrice : item.price) * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. ¡Salud!', 'success');
    // Opcional: Limpiar carrito después de enviar
    // appState.cart = [];
    // saveCart();
    // renderCart();
    // toggleCartSidebar(false);
}
