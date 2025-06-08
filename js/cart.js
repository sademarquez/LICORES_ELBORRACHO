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
            toggleCartSidebar(true); // Abrir carrito explícitamente
        });
    }

    // Listener para el icono del carrito en la barra inferior
    const bottomNavCart = document.getElementById('bottomNavCart');
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar(true); // Abrir carrito explícitamente
        });
    }


    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false); // Cerrar carrito explícitamente
        });
    }

    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    }

    // Listener para actualizar cantidad
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const itemId = target.dataset.id;
            if (!itemId) return;

            if (target.classList.contains('cart-item-remove')) {
                removeFromCart(itemId);
            } else if (target.classList.contains('quantity-decrease')) {
                updateCartItemQuantity(itemId, -1);
            } else if (target.classList.contains('quantity-increase')) {
                updateCartItemQuantity(itemId, 1);
            }
        });
    }

    // NUEVO: Cerrar carrito al hacer clic fuera del sidebar
    window.addEventListener('click', (event) => {
        // Asegura que no se cierre si se hace clic en el icono del carrito
        // o si el click está dentro del sidebar.
        if (cartSidebar && cartSidebar.classList.contains('open') &&
            !cartSidebar.contains(event.target) &&
            event.target !== cartIcon &&
            event.target !== bottomNavCart && // También para el icono de la barra inferior
            !event.target.closest('#cartIcon') && // Para asegurar que no se cierra si el click es en un hijo del icono
            !event.target.closest('#bottomNavCart') // Para asegurar que no se cierra si el click es en un hijo del icono
        ) {
            toggleCartSidebar(false);
        }
    });

    updateCartUI();
    console.log('Módulo de carrito inicializado.');
}

export function addToCart(product) {
    const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Incrementar cantidad
        appState.cart[existingItemIndex].quantity++;
    } else {
        // Añadir nuevo producto
        appState.cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartUI();
    showToastNotification(`"${product.name}" añadido al carrito`, 'success');

    // Animación de impulso para los contadores
    animateCartCount(cartCountElement);
    animateCartCount(bottomCartCountElement);
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartUI();
    showToastNotification('Producto eliminado del carrito', 'info');
}

function updateCartItemQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
            updateCartUI();
        }
    }
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

function updateCartUI() {
    updateCartCount(); // Actualiza los contadores primero

    if (!cartItemsContainer || !cartTotalPriceElement) {
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido existente

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty-message">Tu carrito está vacío. ¡Agrega tus licores favoritos!</p>`;
        cartTotalPriceElement.textContent = '$0';
        if (checkoutWhatsappBtn) {
            checkoutWhatsappBtn.disabled = true;
            checkoutWhatsappBtn.textContent = 'Carrito Vacío';
        }
        return;
    }

    let total = 0;
    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.dataset.id = item.id; // Añadir data-id al elemento del carrito para facilitar la manipulación

        cartItemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</span>
                <div class="cart-item-quantity-controls">
                    <button class="quantity-decrease" data-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.disabled = false;
        checkoutWhatsappBtn.textContent = 'Finalizar Pedido por WhatsApp';
    }
}

// NUEVA FUNCIÓN: Animar el contador del carrito
function animateCartCount(element) {
    if (element) {
        element.classList.remove('animate-bounce'); // Reiniciar la animación si ya está activa
        void element.offsetWidth; // Truco para forzar un reflow y reiniciar la animación CSS
        element.classList.add('animate-bounce');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate-bounce');
        }, { once: true });
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

    const whatsappNumber = appState.contactInfo.contactPhone;

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`;
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${((item.isOnOffer ? item.offerPrice : item.price) * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += (item.isOnOffer ? item.offerPrice : item.price) * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Te contactaremos pronto.', 'success');
    appState.cart = [];
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartUI(); // Asegurarse de que el UI del carrito se vacíe
    toggleCartSidebar(false); // Cierra el carrito después de enviar el pedido
}
