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

    if (!cartSidebar || !cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !bottomCartCountElement || !closeCartBtn || !checkoutWhatsappBtn) {
        console.warn('cart.js: Algunos elementos del carrito no se encontraron. Funcionalidad limitada.');
        return;
    }

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            appState.cart = []; // Si hay un error, inicializar como array vacío
        }
    }

    // Event Listeners
    closeCartBtn.addEventListener('click', toggleCartSidebar);
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);

    // Delegación de eventos para los botones de cantidad y eliminar en el contenedor del carrito
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('remove-item-btn')) {
            const productId = target.dataset.id;
            removeFromCart(productId);
        } else if (target.classList.contains('quantity-decrease')) {
            const productId = target.dataset.id;
            updateCartQuantity(productId, -1);
        } else if (target.classList.contains('quantity-increase')) {
            const productId = target.dataset.id;
            updateCartQuantity(productId, 1);
        }
    });

    updateCartDisplay(); // Mostrar el estado inicial del carrito
    // console.log('cart.js: Carrito inicializado.'); // ELIMINADO para producción
}

export function toggleCartSidebar() {
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
        document.body.classList.toggle('no-scroll', cartSidebar.classList.contains('open'));
        // console.log(`cart.js: Sidebar del carrito ${cartSidebar.classList.contains('open') ? 'abierto' : 'cerrado'}.`); // ELIMINADO para producción
    }
}

export function addToCart(productId, quantity = 1) {
    const product = appState.products.find(p => p.id === productId);

    if (!product) {
        showToastNotification('Producto no encontrado.', 'error');
        // console.error(`cart.js: Producto con ID ${productId} no encontrado.`); // ELIMINADO para producción
        return;
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        // Verificar stock antes de añadir
        if (existingItem.quantity + quantity > product.stock) {
            showToastNotification(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}`, 'warning');
            return;
        }
        existingItem.quantity += quantity;
        showToastNotification(`Se añadió ${quantity} unidad(es) más de ${product.name} al carrito.`, 'info');
    } else {
        // Verificar stock para el nuevo producto
        if (quantity > product.stock) {
            showToastNotification(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}`, 'warning');
            return;
        }
        appState.cart.push({ ...product, quantity: quantity });
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }

    saveCart();
    updateCartDisplay();
    // console.log('cart.js: Producto añadido/actualizado en el carrito.', appState.cart); // ELIMINADO para producción
}

export function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    
    if (appState.cart.length < initialCartLength) {
        showToastNotification('Producto eliminado del carrito.', 'info');
    } else {
        showToastNotification('El producto no se encontró en el carrito.', 'warning');
    }
    
    saveCart();
    updateCartDisplay();
    // console.log('cart.js: Producto eliminado del carrito.', appState.cart); // ELIMINADO para producción
}

export function updateCartQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (!item) {
        showToastNotification('Producto no encontrado en el carrito.', 'error');
        return;
    }

    const productInStock = appState.products.find(p => p.id === productId);

    if (item.quantity + change <= 0) {
        removeFromCart(productId); // Si la cantidad es 0 o menos, eliminar
        return;
    }

    if (productInStock && (item.quantity + change) > productInStock.stock) {
        showToastNotification(`No hay suficiente stock para ${item.name}. Stock disponible: ${productInStock.stock}`, 'warning');
        return;
    }

    item.quantity += change;
    showToastNotification(`Cantidad de ${item.name} actualizada a ${item.quantity}.`, 'info');
    saveCart();
    updateCartDisplay();
    // console.log('cart.js: Cantidad de producto actualizada.', appState.cart); // ELIMINADO para producción
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function updateCartDisplay() {
    if (!cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !bottomCartCountElement) {
        // console.warn('cart.js: Elementos del display del carrito no encontrados para actualizar.'); // ELIMINADO para producción
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar lista
    let totalItems = 0;
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        // console.log('cart.js: Carrito vacío, mensaje mostrado.'); // ELIMINADO para producción
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</p>
                    <div class="cart-item-quantity-control">
                        <button class="quantity-decrease btn-icon" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-increase btn-icon" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
                <button class="remove-item-btn btn-icon" data-id="${item.id}" aria-label="Eliminar producto">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);

            totalItems += item.quantity;
            totalPrice += itemPrice * item.quantity;
        });
    }

    cartCountElement.textContent = totalItems;
    bottomCartCountElement.textContent = totalItems;
    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
    // console.log(`cart.js: Display del carrito actualizado. Total items: ${totalItems}, Total price: $${totalPrice.toLocaleString('es-CO')}.`); // ELIMINADO para producción
}

export function sendOrderToWhatsapp() {
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
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;
        message += `${index + 1}. ${item.quantity} x ${item.name} - $${itemPrice.toLocaleString('es-CO')} c/u%0A`;
    });

    message += `%0ATotal del pedido: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Tu pedido ha sido enviado a WhatsApp. Te contactaremos pronto.', 'success', 5000);

    // Opcional: Vaciar el carrito después de enviar el pedido
    appState.cart = [];
    saveCart();
    updateCartDisplay();
    toggleCartSidebar(); // Cierra el modal después de enviar
    // console.log('cart.js: Pedido enviado por WhatsApp y carrito vaciado.'); // ELIMINADO para producción
}
