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

/**
 * Inicializa los elementos del DOM relacionados con el carrito
 * y carga el estado del carrito desde el almacenamiento local.
 */
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
    updateCartCount(); // Actualiza los contadores al cargar

    // Event listeners
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    }
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    }

    console.log('cart.js: Módulo de carrito inicializado.');
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
    updateCartCount();
    renderCartItems(); // Asegurar que el UI se actualice después de guardar
}

/**
 * Renderiza los elementos del carrito en el sidebar.
 */
export function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('cart.js: Contenedores de carrito no encontrados para renderizar.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar contenido anterior
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.dataset.productId = item.id;
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${itemPrice.toLocaleString('es-CO')}</p>
                <div class="cart-item-quantity-controls">
                    <button class="quantity-decrease-btn" aria-label="Disminuir cantidad" data-id="${item.id}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-increase-btn" aria-label="Aumentar cantidad" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-from-cart-btn" aria-label="Eliminar del carrito" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir event listeners a los nuevos botones
    cartItemsContainer.querySelectorAll('.quantity-decrease-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            updateQuantity(productId, -1);
        });
    });

    cartItemsContainer.querySelectorAll('.quantity-increase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            updateQuantity(productId, 1);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            removeFromCart(productId);
        });
    });
}

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {Object} product - El objeto producto a añadir.
 */
export function addToCart(product) {
    if (!product || !product.id) {
        console.error('addToCart: Producto inválido recibido.', product);
        showToastNotification('No se pudo añadir el producto al carrito. Producto inválido.', 'error');
        return;
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
        showToastNotification(`Se añadió una unidad más de ${product.name} al carrito.`, 'info');
    } else {
        // Clonar el producto para no modificar el original si tiene propiedades adicionales
        const newItem = { ...product, quantity: 1 };
        appState.cart.push(newItem);
        showToastNotification(`${product.name} añadido al carrito.`, 'success');
    }
    saveCart();
    toggleCartSidebar(true); // Abrir el carrito al añadir
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string} productId - El ID del producto.
 * @param {number} change - La cantidad a añadir o restar (ej: 1 o -1).
 */
function updateQuantity(productId, change) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        appState.cart[itemIndex].quantity += change;
        if (appState.cart[itemIndex].quantity <= 0) {
            // Eliminar el producto si la cantidad llega a 0 o menos
            removeFromCart(productId);
        } else {
            saveCart();
            showToastNotification(`Cantidad de ${appState.cart[itemIndex].name} actualizada.`, 'info');
        }
    }
}

/**
 * Elimina un producto del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialCartLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialCartLength) {
        saveCart();
        showToastNotification('Producto eliminado del carrito.', 'success');
    }
}

/**
 * Actualiza los contadores del carrito en el header y la barra inferior.
 */
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
    }
}

/**
 * Alterna la visibilidad del sidebar del carrito.
 * @param {boolean} open - Si es true, abre el carrito; si es false, lo cierra. Si no se especifica, lo alterna.
 */
export function toggleCartSidebar(open) {
    if (!cartSidebar) {
        console.warn('cart.js: Sidebar del carrito no encontrado.');
        return;
    }
    if (typeof open === 'boolean') {
        cartSidebar.classList.toggle('open', open);
    } else {
        cartSidebar.classList.toggle('open');
    }
    // Asegurar que el focus se maneje para accesibilidad
    if (cartSidebar.classList.contains('open')) {
        // Podrías enfocar el primer elemento controlable dentro del sidebar
        cartItemsContainer.focus();
    } else {
        // Regresar el foco a donde estaba antes de abrir el carrito, si es posible
        // O al cuerpo del documento para accesibilidad.
        document.body.focus();
    }
}

/**
 * Envía el contenido del carrito a WhatsApp.
 */
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

    showToastNotification('Tu pedido ha sido enviado a WhatsApp. Te contactaremos pronto.', 'success', 5000);

    // Opcional: Limpiar el carrito después de enviar el pedido por WhatsApp
    appState.cart = [];
    saveCart();
}
