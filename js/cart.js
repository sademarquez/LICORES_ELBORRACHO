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

    console.log('cart.js: Módulo de carrito inicializado.');
}

export function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    console.log('cart.js: Carrito guardado en localStorage.');
}

export function renderCartItems() {
    if (!cartItemsContainer) {
        console.warn('cart.js: Contenedor de items del carrito no encontrado.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar antes de renderizar

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    let total = 0;
    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${itemPrice.toLocaleString('es-CO')}</p>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-decrease" data-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" readonly>
                <button class="quantity-increase" data-id="${item.id}">+</button>
                <button class="remove-item-btn" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;

    // Añadir event listeners después de que los elementos estén en el DOM
    cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, -1);
        });
    });

    cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, 1);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            removeFromCart(id);
        });
    });

    console.log('cart.js: Ítems del carrito renderizados.');
}

export function updateCartCount() {
    const count = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'flex' : 'none'; // Mostrar/ocultar si es 0
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = count;
        bottomCartCountElement.style.display = count > 0 ? 'flex' : 'none'; // Mostrar/ocultar si es 0
    }
    console.log('cart.js: Contador del carrito actualizado a', count);
}

export function addToCart(productId, quantity = 1) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        console.error('cart.js: Producto no encontrado con ID:', productId);
        return;
    }

    const cartItem = appState.cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += quantity;
        showToastNotification(`Se añadió otra unidad de ${product.name} al carrito.`, 'info');
    } else {
        appState.cart.push({ ...product, quantity });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }

    saveCart();
    renderCartItems();
    updateCartCount();
    console.log('cart.js: Producto añadido al carrito:', product.name);
}

export function updateQuantity(productId, change) {
    const cartItem = appState.cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart();
        renderCartItems();
        updateCartCount();
        showToastNotification(`Cantidad de ${cartItem.name} actualizada.`, 'info');
    }
}

export function removeFromCart(productId) {
    const initialLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialLength) {
        showToastNotification('Producto eliminado del carrito.', 'error');
    }
    saveCart();
    renderCartItems();
    updateCartCount();
    console.log('cart.js: Producto eliminado del carrito con ID:', productId);
}

export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open'); // Toggle si no se especifica 'open'
        }
        console.log('cart.js: Sidebar del carrito toggleado. Abierto:', cartSidebar.classList.contains('open'));
    }
}

function sendOrderViaWhatsApp() {
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
    // showToastNotification('Tu pedido ha sido enviado a WhatsApp. En breve nos pondremos en contacto.', 'success');
}
