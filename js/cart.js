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
let clearCartBtn; // Botón de vaciar carrito

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    clearCartBtn = document.getElementById('clearCartBtn'); // Obtener referencia al botón

    if (!cartSidebar || !cartItemsContainer || !cartTotalPriceElement || !cartCountElement || !bottomCartCountElement || !closeCartBtn || !checkoutWhatsappBtn || !clearCartBtn) {
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
            appState.cart = []; // Resetear carrito si hay un error de parseo
        }
    }

    // Event Listeners
    closeCartBtn.addEventListener('click', () => toggleCartSidebar(false));
    checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsapp);
    clearCartBtn.addEventListener('click', clearCart); // Añadir listener para vaciar carrito

    // Renderizar y actualizar el contador al inicio
    updateCartDisplay();
    updateCartCount();
    // console.log('cart.js: Módulo de carrito inicializado.'); // ELIMINADO
}

/**
 * Añade un producto al carrito.
 * @param {Object} product - El objeto producto a añadir.
 * @param {number} quantity - La cantidad a añadir.
 */
export function addToCart(product, quantity = 1) {
    if (!product || typeof quantity !== 'number' || quantity <= 0) {
        showToastNotification('Cantidad inválida para añadir al carrito.', 'error');
        return;
    }

    const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Actualizar cantidad si ya existe
        appState.cart[existingItemIndex].quantity += quantity;
    } else {
        // Añadir nuevo producto
        appState.cart.push({ ...product, quantity });
    }

    // Guardar en localStorage
    saveCart();
    // Actualizar la vista del carrito
    updateCartDisplay();
    updateCartCount();

    // Mejorar la notificación toast
    showToastNotification(`${quantity} ${product.name} añadido al carrito.`, 'success');

    // Añadir una animación al icono del carrito en la barra de navegación inferior
    const cartIcon = document.querySelector('#bottomNavCart .fas.fa-shopping-cart');
    if (cartIcon) {
        cartIcon.classList.add('bouncing-cart');
        setTimeout(() => {
            cartIcon.classList.remove('bouncing-cart');
        }, 800); // Duración de la animación
    }
}

/**
 * Elimina un producto completamente del carrito o reduce su cantidad.
 * @param {string} productId - El ID del producto a modificar.
 * @param {number} [quantityToRemove=null] - La cantidad a eliminar. Si es null, elimina todo el producto.
 */
export function removeFromCart(productId, quantityToRemove = null) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (quantityToRemove === null || appState.cart[itemIndex].quantity <= quantityToRemove) {
            // Eliminar el producto completamente
            const removedItemName = appState.cart[itemIndex].name;
            appState.cart.splice(itemIndex, 1);
            showToastNotification(`${removedItemName} eliminado del carrito.`, 'info');
        } else {
            // Reducir la cantidad
            appState.cart[itemIndex].quantity -= quantityToRemove;
            showToastNotification(`Cantidad de ${appState.cart[itemIndex].name} actualizada.`, 'info');
        }
        saveCart();
        updateCartDisplay();
        updateCartCount();
    } else {
        showToastNotification('Producto no encontrado en el carrito.', 'warning');
    }
}

/**
 * Vacía completamente el carrito.
 */
function clearCart() {
    if (appState.cart.length === 0) {
        showToastNotification('El carrito ya está vacío.', 'info');
        return;
    }
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        appState.cart = [];
        saveCart();
        updateCartDisplay();
        updateCartCount();
        showToastNotification('Carrito vaciado exitosamente.', 'info');
        toggleCartSidebar(false); // Cerrar sidebar después de vaciar
    }
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

/**
 * Actualiza la visualización del carrito en el sidebar.
 */
function updateCartDisplay() {
    if (!cartItemsContainer || !cartTotalPriceElement) {
        console.warn('cart.js: Contenedores de display del carrito no encontrados.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar lista
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        cartTotalPriceElement.textContent = '$0';
        return;
    }

    appState.cart.forEach(item => {
        const itemPrice = item.isOnOffer && item.offerPrice !== null ? item.offerPrice : item.price;
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.dataset.id = item.id; // Para fácil referencia

        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${itemPrice.toLocaleString('es-CO')} c/u</p>
            </div>
            <div class="cart-item-actions">
                <button class="decrease-qty-btn" aria-label="Disminuir cantidad" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-qty-btn" aria-label="Aumentar cantidad" data-id="${item.id}">+</button>
                <button class="remove-item-btn" aria-label="Eliminar producto" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotalPriceElement.textContent = `$${totalPrice.toLocaleString('es-CO')}`;

    // Añadir event listeners para los botones de cantidad y eliminar
    cartItemsContainer.querySelectorAll('.decrease-qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id, 1); // Disminuir en 1
        });
    });

    cartItemsContainer.querySelectorAll('.increase-qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const productToIncrease = appState.products.find(p => p.id === id);
            if (productToIncrease) {
                addToCart(productToIncrease, 1); // Aumentar en 1
            }
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeFromCart(id); // Eliminar completamente
        });
    });
}

/**
 * Actualiza el contador de ítems del carrito en el header y bottom nav.
 */
export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'block' : 'none'; // Mostrar/ocultar
    }
    if (bottomCartCountElement) {
        bottomCartCountElement.textContent = totalItems.toString();
        bottomCartCountElement.style.display = totalItems > 0 ? 'block' : 'none'; // Mostrar/ocultar
    }
}

/**
 * Alterna la visibilidad del sidebar del carrito.
 * @param {boolean} open - true para abrir, false para cerrar.
 */
export function toggleCartSidebar(open) {
    if (cartSidebar) {
        cartSidebar.classList.toggle('open', open);
        // Cuando se abre, renderizar el carrito para que esté actualizado
        if (open) {
            updateCartDisplay();
        }
    }
}

/**
 * Envía el resumen del pedido al número de WhatsApp configurado.
 */
function sendOrderToWhatsapp() {
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

    // Opcional: limpiar carrito después de enviar pedido
    // clearCart(); 
}
