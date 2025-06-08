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

    // Cerrar sidebar al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (cartSidebar && event.target === cartSidebar) {
            toggleCartSidebar(false);
        }
    });

    renderCart();
    console.log('Carrito inicializado.');
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartCount();
    renderCart();
}

export function addToCart(product) {
    // Buscar si el producto ya está en el carrito
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        // Si existe, aumentar la cantidad
        existingItem.quantity++;
        showToastNotification(`${product.name} (x${existingItem.quantity}) añadido al carrito.`, 'info');
    } else {
        // Si no existe, añadirlo como nuevo ítem
        appState.cart.push({ ...product, quantity: 1 });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }
    saveCart();
    toggleCartSidebar(true); // Abre el carrito al añadir
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

function updateQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

function renderCart() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('Elementos del DOM para el carrito no encontrados. No se puede renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        checkoutWhatsappBtn.disabled = true;
    } else {
        checkoutWhatsappBtn.disabled = false;
        appState.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            totalPrice += itemPrice * item.quantity;

            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${itemPrice.toLocaleString('es-CO')} c/u</p>
                    <div class="item-quantity-controls">
                        <button class="quantity-btn decrease-qty" data-product-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Configurar listeners para botones de cantidad y remover
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            updateQuantity(productId, -1);
        });
    });

    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            updateQuantity(productId, 1);
        });
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            removeFromCart(productId);
        });
    });
}

export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems;
        bottomCartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
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

function sendOrderToWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
        return;
    }

    const whatsappNumber = appState.contactInfo.contactPhone; // Obtener número de config.json

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`; // Mensaje actualizado
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${(itemPrice * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += itemPrice * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Te contactaremos pronto.', 'success');
    appState.cart = []; // Vaciar el carrito después de enviar el pedido
    localStorage.removeItem(CART_STORAGE_KEY); // Eliminar del almacenamiento
    renderCart(); // Volver a renderizar el carrito para mostrarlo vacío
}
