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
let clearCartBtn; // Botón para vaciar el carrito

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    clearCartBtn = document.getElementById('clearCartBtn'); // Nuevo botón para vaciar carrito

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
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    } else {
        console.warn('cart.js: Botón de checkout por WhatsApp no encontrado.');
    }

    // Configurar el botón de cerrar sidebar
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }

    // Configurar el botón de vaciar carrito
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    console.log('cart.js: Módulo de carrito inicializado.');
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.quantity < product.stock) { // Verificar stock
            existingItem.quantity++;
            showToastNotification(`${product.name} añadido al carrito (x${existingItem.quantity})`, 'success');
        } else {
            showToastNotification(`No hay más stock disponible de ${product.name}.`, 'warning');
            return;
        }
    } else {
        if (product.stock > 0) { // Solo añadir si hay stock
            appState.cart.push({ ...product, quantity: 1 });
            showToastNotification(`${product.name} añadido al carrito`, 'success');
        } else {
            showToastNotification(`${product.name} está agotado.`, 'error');
            return;
        }
    }

    saveCart();
    renderCartItems();
    updateCartCount();
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

function updateQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        const productData = appState.products.find(p => p.id === productId); // Obtener datos del producto original para stock
        if (!productData) {
            console.error('Producto original no encontrado para verificar stock.');
            return;
        }

        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else if (item.quantity > productData.stock) { // Verificar contra el stock original
            item.quantity = productData.stock; // No permitir más allá del stock
            showToastNotification(`Máximo stock alcanzado para ${item.name}.`, 'warning');
        }
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

function clearCart() {
    if (appState.cart.length === 0) {
        showToastNotification('El carrito ya está vacío.', 'info');
        return;
    }
    const confirmClear = confirm('¿Estás seguro de que quieres vaciar el carrito?');
    if (confirmClear) {
        appState.cart = [];
        saveCart();
        renderCartItems();
        updateCartCount();
        showToastNotification('El carrito ha sido vaciado.', 'info');
        toggleCartSidebar(false); // Opcional: cerrar sidebar al vaciar
    }
}

function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = '$0';
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
                <p class="cart-item-name">${item.name}</p>
                <p class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    if (cartTotalPriceElement) {
        cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
    }

    // Añadir event listeners a los botones de cantidad y remover
    cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => updateQuantity(e.currentTarget.dataset.id, -1));
    });

    cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => updateQuantity(e.currentTarget.dataset.id, 1));
    });

    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => removeFromCart(e.currentTarget.dataset.id));
    });
}

export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        // Añadir/quitar clase para animación de pulso si el contador cambia
        if (totalItems > 0 && !cartCountElement.classList.contains('pulsing')) {
            cartCountElement.classList.add('pulsing');
            // Quitar la clase después de un corto tiempo para que la animación pueda repetirse
            setTimeout(() => {
                cartCountElement.classList.remove('pulsing');
            }, 500); // Duración de la animación
        } else if (totalItems === 0 && cartCountElement.classList.contains('pulsing')) {
            cartCountElement.classList.remove('pulsing');
        }
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
        // Igual animación para el contador del bottom nav
        if (totalItems > 0 && !bottomCartCountElement.classList.contains('pulsing')) {
            bottomCartCountElement.classList.add('pulsing');
            setTimeout(() => {
                bottomCartCountElement.classList.remove('pulsing');
            }, 500);
        } else if (totalItems === 0 && bottomCartCountElement.classList.contains('pulsing')) {
            bottomCartCountElement.classList.remove('pulsing');
        }
    }
}

export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open'); // Toggle si no se especifica 'open'
        }

        // Asegurarse de que el scroll del body se bloquee/desbloquee
        if (cartSidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}


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
    // showToastNotification('Tu pedido ha sido enviado a WhatsApp. Espera nuestra confirmación.', 'success');
    // toggleCartSidebar(false);
}
