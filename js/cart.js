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
    console.log('Inicializando carrito...');
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // NUEVO: Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
            console.log('Carrito cargado desde localStorage:', appState.cart);
        } catch (e) {
            console.error('Error al parsear el carrito desde localStorage:', e);
            appState.cart = []; // Si hay error, inicializa el carrito vacío
            localStorage.removeItem(CART_STORAGE_KEY); // Limpia el almacenamiento para evitar futuros errores
        }
    } else {
        appState.cart = [];
    }

    // Configurar listeners para abrir/cerrar carrito
    const cartIcon = document.getElementById('cartIcon'); // Icono del header
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    } else {
        console.warn('Icono de carrito del header (cartIcon) no encontrado.');
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    } else {
        console.warn('Botón de cierre del carrito (closeCartBtn) no encontrado.');
    }

    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    } else {
        console.warn('Botón de WhatsApp del carrito (checkoutWhatsappBtn) no encontrado.');
    }

    renderCartItems(); // Renderiza los items del carrito al iniciar
    updateCartCount(); // Asegura que el contador se actualice al iniciar
}

export function addToCart(productId) {
    console.log(`Intentando añadir producto con ID: ${productId}`);
    const productToAdd = appState.products.find(p => p.id === productId);

    if (!productToAdd) {
        showToastNotification('Producto no encontrado.', 'error');
        console.error('Producto no encontrado en appState.products para ID:', productId);
        return;
    }

    const existingItem = appState.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({ ...productToAdd, quantity: 1 });
    }

    saveCart();
    renderCartItems();
    updateCartCount();
    showToastNotification(`${productToAdd.name} añadido al carrito.`, 'success');
}

export function removeFromCart(productId) {
    const initialLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);

    if (appState.cart.length < initialLength) {
        saveCart();
        renderCartItems();
        updateCartCount();
        showToastNotification('Producto eliminado del carrito.', 'info');
    }
}

export function updateCartItemQuantity(productId, newQuantity) {
    const item = appState.cart.find(i => i.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    console.log('Carrito guardado:', appState.cart);
}

export function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('Contenedores del carrito no encontrados. No se pueden renderizar items.');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const itemTotalPrice = itemPrice * item.quantity;
        totalPrice += itemTotalPrice;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${itemPrice.toLocaleString('es-CO')}</span>
            </div>
            <div class="item-actions">
                <input type="number" min="1" value="${item.quantity}" data-product-id="${item.id}">
                <button class="remove-item-btn" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir listeners para los botones de eliminar y los inputs de cantidad
    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            removeFromCart(productId);
        });
    });

    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const newQuantity = parseInt(e.currentTarget.value);
            if (!isNaN(newQuantity)) {
                updateCartItemQuantity(productId, newQuantity);
            }
        });
    });
}


export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        // Ocultar si no hay elementos
        if (totalItems === 0) {
            cartCountElement.classList.remove('has-items');
        } else {
            cartCountElement.classList.add('has-items');
        }
    } else {
        console.warn('Elemento cartCount (header) no encontrado.');
    }

    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
        // Ocultar si no hay elementos
        if (totalItems === 0) {
            bottomCartCountElement.classList.remove('has-items');
        } else {
            bottomCartCountElement.classList.add('has-items');
        }
    } else {
        console.warn('Elemento bottomCartCount (bottom nav) no encontrado.');
    }
}

export function toggleCartSidebar(forceOpen = undefined) {
    if (cartSidebar) {
        if (typeof forceOpen === 'boolean') {
            cartSidebar.classList.toggle('open', forceOpen);
        } else {
            cartSidebar.classList.toggle('open');
        }
    } else {
        console.warn('El sidebar del carrito no se encontró.');
    }
}

function sendOrderToWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
        return;
    }

    // Asegurarse de que contactInfo y contactPhone existan
    const whatsappNumber = appState.contactInfo && appState.contactInfo.contactPhone ? appState.contactInfo.contactPhone : null;

    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. Contacta al soporte.', 'error');
        console.error('Número de WhatsApp no disponible en appState.contactInfo');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`; // Mensaje actualizado
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        const priceToUse = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${(priceToUse * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += priceToUse * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Te contactaremos pronto.', 'success');
    appState.cart = []; // Vaciar el carrito después de enviar el pedido
    localStorage.removeItem(CART_STORAGE_KEY); // Eliminar del almacenamiento local
    renderCartItems(); // Actualizar la vista del carrito
    updateCartCount(); // Actualizar el contador del carrito
}
