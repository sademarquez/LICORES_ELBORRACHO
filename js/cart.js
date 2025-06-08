// js/cart.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

const CART_STORAGE_KEY = 'elborracho_cart';
let cartSidebar;
let cartItemsContainer;
let cartTotalPriceElement;
let cartCountElement; // Contador del header
let bottomCartCountElement; // NUEVO: Contador de la barra inferior
let closeCartBtn;
let checkoutWhatsappBtn;
let clearCartBtn; // Botón para vaciar carrito

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    clearCartBtn = document.getElementById('clearCartBtn'); // Obtener el botón de vaciar carrito

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
            toggleCartSidebar(true); // Siempre abrir al hacer click en el ícono
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }

    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendWhatsAppOrder);
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            clearCart();
        });
    }

    renderCartItems();
    updateCartCount();
    console.log('cart.js: Carrito inicializado.');
}

export function addToCart(productId, quantity = 1) {
    const product = appState.products.find(p => p.id === productId);

    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        console.error(`cart.js: Producto con ID ${productId} no encontrado.`);
        return;
    }

    if (product.stock === 0) {
        showToastNotification(`¡${product.name} está agotado!`, 'error');
        return;
    }

    const cartItem = appState.cart.find(item => item.id === productId);

    if (cartItem) {
        if (cartItem.quantity + quantity > product.stock) {
            showToastNotification(`No hay suficiente stock para ${product.name}. Solo quedan ${product.stock} unidades.`, 'warning');
            return;
        }
        cartItem.quantity += quantity;
    } else {
        if (quantity > product.stock) {
            showToastNotification(`No hay suficiente stock para ${product.name}. Solo quedan ${product.stock} unidades.`, 'warning');
            return;
        }
        appState.cart.push({
            id: product.id,
            name: product.name,
            price: product.isOnOffer ? product.offerPrice : product.price,
            imageUrl: product.imageUrl,
            quantity: quantity,
            stock: product.stock // Guardar stock actual para referencia en el carrito
        });
    }

    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification(`${product.name} añadido al carrito.`, 'success');
}

export function updateCartItemQuantity(productId, change) {
    const cartItem = appState.cart.find(item => item.id === productId);
    const productInStock = appState.products.find(p => p.id === productId);

    if (cartItem && productInStock) {
        const newQuantity = cartItem.quantity + change;
        if (newQuantity > 0 && newQuantity <= productInStock.stock) {
            cartItem.quantity = newQuantity;
            saveCart();
            renderCartItems();
            updateCartCount();
        } else if (newQuantity <= 0) {
            removeFromCart(productId); // Si la cantidad llega a 0 o menos, eliminar
        } else if (newQuantity > productInStock.stock) {
            showToastNotification(`No hay suficiente stock para ${productInStock.name}. Máximo ${productInStock.stock} unidades.`, 'warning');
        }
    }
}

export function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification('Producto eliminado del carrito.', 'info');
}

export function clearCart() {
    if (appState.cart.length === 0) {
        showToastNotification('El carrito ya está vacío.', 'info');
        return;
    }
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        appState.cart = [];
        saveCart();
        renderCartItems();
        updateCartCount();
        showToastNotification('Carrito vaciado.', 'success');
    }
}


function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('cart.js: Elementos del carrito no encontrados para renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message" style="text-align: center; color: var(--text-color-light);">Tu carrito está vacío.</p>`;
    } else {
        appState.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Precio: $${item.price.toLocaleString('es-CO')}</p>
                    <div class="cart-item-quantity">
                        <button data-product-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button data-product-id="${item.id}" data-change="1">+</button>
                    </div>
                </div>
                <button class="remove-from-cart-btn" data-product-id="${item.id}" aria-label="Eliminar ${item.name} del carrito">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            totalPrice += item.price * item.quantity;
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

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
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    if (bottomCartCountElement) {
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
        if (cartSidebar.classList.contains('open')) {
            renderCartItems(); // Asegurar que el carrito se renderiza cada vez que se abre
        }
    }
}

function sendWhatsAppOrder() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de realizar un pedido.', 'warning');
        return;
    }

    const contactPhone = appState.contactInfo.phone;
    if (!contactPhone) {
        showToastNotification('Número de WhatsApp de la tienda no configurado. No se puede realizar el pedido.', 'error');
        console.error('cart.js: Número de contacto de WhatsApp no encontrado en appState.contactInfo');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AQuisiera hacer un pedido con los siguientes productos:%0A%0A`;
    let total = 0;

    appState.cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - Cantidad: ${item.quantity} - Precio Unitario: $${item.price.toLocaleString('es-CO')}%0A`;
        total += item.price * item.quantity;
    });

    message += `%0ATotal de la Orden: $${total.toLocaleString('es-CO')}%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${contactPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Espera nuestra confirmación.', 'success');
    // Considerar vaciar el carrito después de un envío exitoso, o tener un paso de confirmación.
    // clearCart(); // Descomentar si quieres vaciar el carrito automáticamente
    toggleCartSidebar(false); // Cerrar sidebar después de enviar
}
