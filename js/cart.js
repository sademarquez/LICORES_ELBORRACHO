// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart';
let cartSidebar, cartItemsContainer, cartTotalPriceElement, cartCountElement, bottomCartCountElement, closeCartBtn, checkoutWhatsappBtn;

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount');
    bottomCartCountElement = document.getElementById('bottomCartCount');
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    if (!cartSidebar) return; // Si no hay carrito, no hacer nada

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            appState.cart = [];
        }
    }

    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);

    cartItemsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const productId = button.dataset.id;
        if (button.classList.contains('remove-item-btn')) {
            removeFromCart(productId);
        } else if (button.classList.contains('quantity-decrease')) {
            updateCartQuantity(productId, -1);
        } else if (button.classList.contains('quantity-increase')) {
            updateCartQuantity(productId, 1);
        }
    });

    updateCartDisplay();
}

export function toggleCartSidebar(forceState) {
    if (cartSidebar) {
        const isOpen = typeof forceState === 'boolean' ? forceState : !cartSidebar.classList.contains('open');
        cartSidebar.classList.toggle('open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
    }
}

export function addToCart(productId, quantity = 1) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return showToastNotification('Producto no encontrado.', 'error');

    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
            return showToastNotification(`Stock insuficiente para ${product.name}.`, 'warning');
        }
        existingItem.quantity += quantity;
        showToastNotification(`${product.name} actualizado en el carrito.`, 'info');
    } else {
        if (quantity > product.stock) {
            return showToastNotification(`Stock insuficiente para ${product.name}.`, 'warning');
        }
        appState.cart.push({ ...product, quantity });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }

    saveCart();
    updateCartDisplay();
}

export function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    showToastNotification('Producto eliminado del carrito.', 'info');
    saveCart();
    updateCartDisplay();
}

export function updateCartQuantity(productId, change) {
    const item = appState.cart.find(i => i.id === productId);
    if (!item) return;

    if (item.quantity + change <= 0) {
        removeFromCart(productId);
    } else {
        const product = appState.products.find(p => p.id === productId);
        if (item.quantity + change > product.stock) {
            return showToastNotification(`Stock insuficiente para ${product.name}.`, 'warning');
        }
        item.quantity += change;
        saveCart();
        updateCartDisplay();
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function updateCartDisplay() {
    if (!cartItemsContainer) return;

    let totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = appState.cart.reduce((sum, item) => {
        const price = item.isOnOffer ? item.offerPrice : item.price;
        return sum + (price * item.quantity);
    }, 0);

    cartCountElement.textContent = totalItems;
    bottomCartCountElement.textContent = totalItems;
    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-text-color-light text-center">Tu carrito está vacío.</p>';
    } else {
        cartItemsContainer.innerHTML = appState.cart.map(item => {
            const price = item.isOnOffer ? item.offerPrice : item.price;
            // CORRECCIÓN: Se reemplaza el icono <i> con un SVG inline.
            return `
                <div class="cart-item">
                    <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                    <div class="flex-grow">
                        <h4 class="font-semibold text-sm">${item.name}</h4>
                        <p class="text-accent-color text-xs">$${price.toLocaleString('es-CO')}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <button class="quantity-decrease bg-secondary-color p-1 rounded-md" data-id="${item.id}">-</button>
                            <span class="font-bold">${item.quantity}</span>
                            <button class="quantity-increase bg-secondary-color p-1 rounded-md" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn text-danger-color" data-id="${item.id}">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            `;
        }).join('');
    }
}

export function sendOrderToWhatsapp() {
    if (appState.cart.length === 0) {
        return showToastNotification('Tu carrito está vacío.', 'warning');
    }
    const { phone } = appState.contactInfo;
    if (!phone) {
        return showToastNotification('Número de contacto no disponible.', 'error');
    }

    let message = "¡Hola EL BORRACHO! Mi pedido es:\n\n";
    let totalPrice = 0;

    appState.cart.forEach(item => {
        const price = item.isOnOffer ? item.offerPrice : item.price;
        totalPrice += price * item.quantity;
        message += `${item.quantity}x ${item.name} - $${(price * item.quantity).toLocaleString('es-CO')}\n`;
    });

    message += `\n*Total: $${totalPrice.toLocaleString('es-CO')}*\n\nGracias, espero confirmación.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado por WhatsApp.', 'success');
    appState.cart = [];
    saveCart();
    updateCartDisplay();
    toggleCartSidebar(false);
}
