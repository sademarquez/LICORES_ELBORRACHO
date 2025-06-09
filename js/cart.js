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
            showToastNotification('Error al recuperar el carrito. Se ha vaciado.', 'error');
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

    // Configurar botón de cerrar sidebar
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }

    // Cerrar sidebar al hacer clic fuera
    if (cartSidebar) {
        cartSidebar.addEventListener('click', (event) => {
            if (event.target === cartSidebar) {
                toggleCartSidebar(false);
            }
        });
    }

    console.log('cart.js: Módulo de carrito inicializado.');
}

/**
 * Guarda el carrito actual en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Añade un producto al carrito.
 * @param {Object} product - El objeto del producto a añadir.
 */
export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
        showToastNotification(`Se añadió una unidad más de ${product.name} al carrito.`, 'info');
    } else {
        appState.cart.push({ ...product, quantity: 1 });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }
    saveCart();
    renderCartItems();
    updateCartCount();
    toggleCartSidebar(true); // Abre el carrito automáticamente al añadir
}

/**
 * Elimina un producto del carrito o reduce su cantidad.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (appState.cart[itemIndex].quantity > 1) {
            appState.cart[itemIndex].quantity--;
            showToastNotification(`Se quitó una unidad de ${appState.cart[itemIndex].name}.`, 'warning');
        } else {
            const removedProductName = appState.cart[itemIndex].name;
            appState.cart.splice(itemIndex, 1);
            showToastNotification(`${removedProductName} eliminado del carrito.`, 'error');
        }
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

/**
 * Renderiza los ítems actuales del carrito en la interfaz.
 */
function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('Elementos del carrito no encontrados para renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            const itemSubtotal = itemPrice * item.quantity;
            totalPrice += itemSubtotal;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>$${itemPrice.toLocaleString('es-CO')} x ${item.quantity}</p>
                    <p class="item-subtotal">Subtotal: $${itemSubtotal.toLocaleString('es-CO')}</p>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn decrease" data-product-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-product-id="${item.id}">+</button>
                    <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir event listeners a los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            removeFromCart(productId);
        });
    });

    cartItemsContainer.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const product = appState.products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            // Para eliminar completamente, encontramos el índice y lo eliminamos
            const itemIndex = appState.cart.findIndex(item => item.id === productId);
            if (itemIndex > -1) {
                const removedProductName = appState.cart[itemIndex].name;
                appState.cart.splice(itemIndex, 1);
                showToastNotification(`${removedProductName} eliminado completamente del carrito.`, 'error');
                saveCart();
                renderCartItems();
                updateCartCount();
            }
        });
    });
}

/**
 * Actualiza los contadores del carrito en el header y la barra inferior.
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
 * Muestra u oculta la barra lateral del carrito.
 * @param {boolean} open - true para abrir, false para cerrar. Si no se especifica, se alterna.
 */
export function toggleCartSidebar(open) {
    if (!cartSidebar) {
        console.warn('Sidebar del carrito no encontrado.');
        return;
    }
    if (typeof open === 'boolean') {
        cartSidebar.classList.toggle('open', open);
    } else {
        cartSidebar.classList.toggle('open');
    }
    // Si se abre el carrito, renderizar sus items de nuevo para asegurar que estén actualizados
    if (cartSidebar.classList.contains('open')) {
        renderCartItems();
    }
}

/**
 * Genera el mensaje de pedido y redirige a WhatsApp.
 */
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

    showToastNotification('Tu pedido ha sido enviado a WhatsApp. Te contactaremos pronto.', 'success', 5000);

    // Opcional: Limpiar el carrito después de enviar el pedido por WhatsApp
    appState.cart = [];
    saveCart();
    renderCartItems();
    updateCartCount();
    toggleCartSidebar(false); // Cierra el sidebar después de enviar el pedido
}
