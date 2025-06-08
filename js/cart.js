// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'comunicacionesluna_cart';
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

    // Cerrar el sidebar del carrito al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (cartSidebar && cartSidebar.classList.contains('open') &&
            !cartSidebar.contains(event.target) && !cartIcon.contains(event.target)) {
            toggleCartSidebar(false);
        }
    });

    renderCart(); // Renderiza el carrito al iniciar
}

export function addToCart(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        return;
    }

    // Asegurar que el producto tenga un stock definido
    if (typeof product.stock === 'undefined' || product.stock === null) {
        showToastNotification('Información de stock no disponible para este producto.', 'warning');
        console.warn(`Producto ${productId} no tiene un campo 'stock' definido.`);
        return;
    }

    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        // Verificar si hay suficiente stock para añadir otra unidad
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showToastNotification(`Se añadió otra unidad de ${product.name} al carrito.`, 'info');
        } else {
            showToastNotification(`No hay más stock disponible de ${product.name}.`, 'warning');
            return; // No añadir si no hay stock
        }
    } else {
        // Verificar si hay stock para añadir la primera unidad
        if (product.stock > 0) {
            appState.cart.push({
                id: product.id,
                name: product.name,
                price: product.isOnOffer ? product.offerPrice : product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
                maxStock: product.stock // Guardar el stock máximo del producto
            });
            showToastNotification(`"${product.name}" ha sido añadido al carrito.`, 'success');
        } else {
            showToastNotification(`"${product.name}" está agotado.`, 'error');
            return; // No añadir si el stock es 0
        }
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

function updateItemQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        const productInAppState = appState.products.find(p => p.id === productId);
        if (!productInAppState) {
            showToastNotification('Error: No se pudo verificar el stock del producto.', 'error');
            return;
        }

        const newQuantity = item.quantity + change;

        if (newQuantity > 0 && newQuantity <= productInAppState.stock) {
            item.quantity = newQuantity;
            saveCart();
            renderCart();
        } else if (newQuantity <= 0) {
            // Eliminar el artículo si la cantidad llega a 0
            removeFromCart(productId);
        } else if (newQuantity > productInAppState.stock) {
            showToastNotification(`No hay más stock disponible de "${item.name}".`, 'warning');
        }
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

function renderCart() {
    if (!cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !checkoutWhatsappBtn) {
        console.error('Elementos del carrito no encontrados para renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        checkoutWhatsappBtn.disabled = true; // Deshabilita el botón si el carrito está vacío
    } else {
        checkoutWhatsappBtn.disabled = false; // Habilita el botón si hay items
        appState.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString('es-CO')}</p>
                    <div class="cart-item-quantity-controls">
                        <button class="decrease-quantity" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.name}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.name}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
            itemCount += item.quantity;
        });

        // Añadir event listeners después de que los elementos se han agregado al DOM
        cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => updateItemQuantity(e.target.dataset.id, 1));
        });
        cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => updateItemQuantity(e.target.dataset.id, -1));
        });
        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => removeFromCart(e.target.closest('button').dataset.id));
        });
    }

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;
    updateCartCount(itemCount); // Actualiza el contador del ícono del carrito
}

export function updateCartCount() {
    if (cartCountElement) {
        const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        // Ocultar si es 0
        if (totalItems === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'block';
        }
    }
}

function toggleCartSidebar(forceOpen) {
    if (cartSidebar) {
        if (forceOpen === true) {
            cartSidebar.classList.add('open');
            cartSidebar.setAttribute('aria-hidden', 'false');
        } else if (forceOpen === false) {
            cartSidebar.classList.remove('open');
            cartSidebar.setAttribute('aria-hidden', 'true');
        } else {
            cartSidebar.classList.toggle('open');
            const isOpen = cartSidebar.classList.contains('open');
            cartSidebar.setAttribute('aria-hidden', !isOpen);
        }
    }
}

function sendOrderToWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
        return;
    }

    const whatsappNumber = appState.contactInfo.contactPhone;

    let message = `¡Hola COMuNICACIONES LUNA!%0AQuisiera realizar el siguiente pedido:%0A%0A`;
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += item.price * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. ¡Te contactaremos pronto!', 'success');

    // Opcional: Limpiar carrito después de enviar
    // appState.cart = [];
    // saveCart();
    // renderCart();
    // updateCartCount();
}
