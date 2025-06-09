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

    // Configurar el botón para cerrar el carrito
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }

    // Cerrar el sidebar del carrito al hacer clic fuera
    if (cartSidebar) {
        cartSidebar.addEventListener('click', (event) => {
            if (event.target === cartSidebar) {
                toggleCartSidebar(false);
            }
        });
    }

    // DELEGACIÓN DE EVENTOS PARA BOTONES DE ELIMINAR Y CANTIDAD
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;

            // Lógica para el botón de eliminar
            if (target.classList.contains('fa-trash-alt') || target.closest('.delete-btn')) {
                const deleteButton = target.closest('.delete-btn');
                if (deleteButton) {
                    const itemId = deleteButton.dataset.id;
                    if (itemId) {
                        removeFromCart(itemId);
                        showToastNotification('Producto eliminado del carrito.', 'success');
                    } else {
                        console.warn('cart.js: Botón de eliminación sin data-id.');
                    }
                }
            }
        });

        cartItemsContainer.addEventListener('input', (event) => {
            const target = event.target;
            // Lógica para cambiar la cantidad
            if (target.classList.contains('item-quantity')) {
                const itemId = target.dataset.id;
                const newQuantity = parseInt(target.value, 10);
                if (itemId && !isNaN(newQuantity) && newQuantity >= 1) {
                    updateItemQuantity(itemId, newQuantity);
                }
            }
        });
    }

    console.log('cart.js: Módulo de carrito inicializado.');
}

// Guarda el carrito en localStorage
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    console.log('cart.js: Carrito guardado en localStorage.', appState.cart);
}

// Actualiza el contador de productos en el icono del carrito
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none'; // Mostrar/ocultar si hay items
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems;
        bottomCartCountElement.style.display = totalItems > 0 ? 'flex' : 'none'; // Mostrar/ocultar si hay items
    }
    console.log('cart.js: Contador de carrito actualizado a', totalItems);
}

// Añade un producto al carrito
export function addToCart(productToAdd) {
    const existingItemIndex = appState.cart.findIndex(item => item.id === productToAdd.id);

    if (existingItemIndex > -1) {
        // Si el producto ya existe, incrementa la cantidad
        appState.cart[existingItemIndex].quantity += 1;
        showToastNotification(`Se añadió otra unidad de ${productToAdd.name} al carrito.`, 'info');
    } else {
        // Si es un producto nuevo, añádelo con cantidad 1
        appState.cart.push({ ...productToAdd, quantity: 1 });
        showToastNotification(`${productToAdd.name} añadido al carrito.`, 'success');
    }

    saveCart();
    renderCartItems();
    updateCartCount();
    console.log('cart.js: Producto añadido al carrito:', productToAdd.name);
}

// Remueve un producto del carrito
export function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);

    if (appState.cart.length < initialCartLength) {
        saveCart();
        renderCartItems();
        updateCartCount();
        console.log('cart.js: Producto removido del carrito con ID:', productId);
    } else {
        console.warn('cart.js: Intento de remover un producto no existente con ID:', productId);
    }
}

// Actualiza la cantidad de un producto en el carrito
export function updateItemQuantity(productId, newQuantity) {
    const itemToUpdate = appState.cart.find(item => item.id === productId);
    if (itemToUpdate) {
        itemToUpdate.quantity = newQuantity;
        if (newQuantity <= 0) {
            removeFromCart(productId); // Si la cantidad es 0 o menos, remover
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
            showToastNotification(`Cantidad de ${itemToUpdate.name} actualizada a ${newQuantity}.`, 'info');
            console.log('cart.js: Cantidad de producto actualizada:', itemToUpdate.name, 'a', newQuantity);
        }
    } else {
        console.warn('cart.js: Intento de actualizar cantidad de un producto no existente con ID:', productId);
    }
}

// Renderiza los productos en el sidebar del carrito
export function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('cart.js: Contenedores del carrito no encontrados para renderizar items.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido anterior
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
    } else {
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.dataset.id = item.id; // Añadir el ID al elemento del item

            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</span>
                    <div class="cart-item-quantity-controls">
                        <input type="number" class="item-quantity" data-id="${item.id}" value="${item.quantity}" min="1">
                        <button class="delete-btn" data-id="${item.id}" aria-label="Eliminar ${item.name}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);

            totalPrice += itemPrice * item.quantity;
        });
    }

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
    console.log('cart.js: Ítems del carrito renderizados. Total:', totalPrice);
}

// Muestra u oculta el sidebar del carrito
export function toggleCartSidebar(open) {
    if (cartSidebar) {
        if (typeof open === 'boolean') {
            cartSidebar.classList.toggle('open', open);
        } else {
            cartSidebar.classList.toggle('open'); // Toggle si no se especifica 'open'
        }
        document.body.classList.toggle('no-scroll', cartSidebar.classList.contains('open')); // Evitar scroll de fondo
        console.log('cart.js: Sidebar del carrito', cartSidebar.classList.contains('open') ? 'abierto' : 'cerrado');
    }
}

// Envía el pedido a WhatsApp
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
    // showToastNotification('Tu pedido ha sido enviado a WhatsApp. Espera nuestra confirmación.', 'success');
}
