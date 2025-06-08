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
let cartEmptyMessage; // Mensaje de carrito vacío

export function initCart() {
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // NUEVO: Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    cartEmptyMessage = document.querySelector('.cart-empty-message'); // Obtener el mensaje de carrito vacío

    // Cargar carrito desde localStorage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            appState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error al parsear el carrito de localStorage:', e);
            appState.cart = []; // Si hay un error, inicializar el carrito vacío
            localStorage.removeItem(CART_STORAGE_KEY); // Limpiar datos corruptos
        }
    } else {
        appState.cart = [];
    }

    // Event listeners para abrir/cerrar el carrito
    const cartIcon = document.getElementById('cartIcon'); // Icono del header
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    }

    const bottomNavCart = document.getElementById('bottomNavCart'); // Icono del bottom nav
    if (bottomNavCart) {
        bottomNavCart.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            toggleCartSidebar(false);
        });
    }

    // Cerrar el carrito al hacer clic fuera
    if (cartSidebar) {
        window.addEventListener('click', (event) => {
            // Asegura que no se cierre si se hizo clic en el icono del carrito o dentro del sidebar
            if (event.target === cartSidebar && event.target !== cartIcon && event.target !== bottomNavCart && !cartSidebar.contains(event.target)) {
                toggleCartSidebar(false);
            }
        });
    }

    // Event listener para el botón de WhatsApp
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', sendOrderToWhatsApp);
    }

    renderCartItems(); // Renderiza los ítems del carrito al inicio
    updateCartCount(); // Actualiza los contadores al inicio
    console.log('Módulo de carrito inicializado.');
}

export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showToastNotification(`${product.name} añadido al carrito. Cantidad: ${existingItem.quantity}`, 'info');
        } else {
            showToastNotification(`No hay más stock de ${product.name} disponible.`, 'error');
            return; // No añadir si no hay stock
        }
    } else {
        if (product.stock > 0) {
            appState.cart.push({ ...product, quantity: 1 });
            showToastNotification(`${product.name} añadido al carrito.`, 'success');
        } else {
            showToastNotification(`${product.name} está agotado.`, 'error');
            return; // No añadir si no hay stock
        }
    }

    saveCart();
    renderCartItems();
    updateCartCount();
}

function removeFromCart(productId) {
    const initialLength = appState.cart.length;
    appState.cart = appState.cart.filter(item => item.id !== productId);
    if (appState.cart.length < initialLength) {
        showToastNotification('Producto eliminado del carrito.', 'info');
    } else {
        showToastNotification('Error al eliminar el producto del carrito.', 'error');
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

function updateItemQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        if (item.quantity + change > 0 && item.quantity + change <= item.stock) {
            item.quantity += change;
            showToastNotification(`Cantidad de ${item.name} actualizada a ${item.quantity}.`, 'info');
        } else if (item.quantity + change <= 0) {
            removeFromCart(productId); // Si la cantidad es 0 o menos, eliminar
            return;
        } else {
            showToastNotification(`No hay más stock de ${item.name} disponible.`, 'error');
            return;
        }
    }
    saveCart();
    renderCartItems();
    updateCartCount();
}

function renderCartItems() {
    cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
    let total = 0;

    if (appState.cart.length === 0) {
        if (cartEmptyMessage) {
            cartEmptyMessage.style.display = 'block'; // Mostrar el mensaje si el carrito está vacío
        }
        checkoutWhatsappBtn.disabled = true; // Deshabilitar botón de checkout
    } else {
        if (cartEmptyMessage) {
            cartEmptyMessage.style.display = 'none'; // Ocultar el mensaje si hay ítems
        }
        checkoutWhatsappBtn.disabled = false; // Habilitar botón de checkout
        appState.cart.forEach(item => {
            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.brand} - $${itemPrice.toLocaleString('es-CO')}</p>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="decrease-quantity-btn" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.name}">-</button>
                    <button class="increase-quantity-btn" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.name}">+</button>
                    <button class="remove-item-btn" data-id="${item.id}" aria-label="Eliminar ${item.name} del carrito"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    cartTotalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;

    // Añadir event listeners después de que los elementos estén en el DOM
    cartItemsContainer.querySelectorAll('.decrease-quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            updateItemQuantity(productId, -1);
        });
    });

    cartItemsContainer.querySelectorAll('.increase-quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            updateItemQuantity(productId, 1);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            removeFromCart(productId);
        });
    });
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function updateCartCount() {
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'block' : 'none'; // Mostrar/Ocultar contador
    }
    if (bottomCartCountElement) { // Actualizar el contador de la barra inferior
        bottomCartCountElement.textContent = totalItems.toString();
        bottomCartCountElement.style.display = totalItems > 0 ? 'block' : 'none'; // Mostrar/Ocultar contador
    }
}

export function toggleCartSidebar(forceOpen = undefined) {
    if (!cartSidebar) {
        console.error('El sidebar del carrito no se encontró.');
        return;
    }

    if (forceOpen === true) {
        cartSidebar.classList.add('open');
        document.body.classList.add('no-scroll');
    } else if (forceOpen === false) {
        cartSidebar.classList.remove('open');
        document.body.classList.remove('no-scroll');
    } else {
        // Toggle behavior
        const isOpen = cartSidebar.classList.toggle('open');
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
    renderCartItems(); // Asegurarse de que el carrito esté actualizado al abrir/cerrar
}


function sendOrderToWhatsApp() {
    if (appState.cart.length === 0) {
        showToastNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
        return;
    }

    const whatsappNumber = appState.contactInfo.contactPhone; // Obtener número de config.json
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. Contacta al administrador.', 'error');
        console.error('Número de WhatsApp no disponible en appState.contactInfo.contactPhone.');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AQuisiera realizar el siguiente pedido:%0A%0A`; // Mensaje actualizado
    let totalPrice = 0;

    appState.cart.forEach((item, index) => {
        const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
        message += `${index + 1}. ${item.name} (x${item.quantity}) - $${(itemPrice * item.quantity).toLocaleString('es-CO')}%0A`;
        totalPrice += itemPrice * item.quantity;
    });

    message += `%0ATotal a pagar: *$${totalPrice.toLocaleString('es-CO')}*%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de pago. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`; // encodeURIComponent para URL
    window.open(whatsappUrl, '_blank');

    showToastNotification('Pedido enviado a WhatsApp. Te contactaremos pronto.', 'success');
    appState.cart = []; // Vaciar el carrito después de enviar el pedido
    saveCart(); // Guardar el carrito vacío
    renderCartItems(); // Volver a renderizar para mostrar carrito vacío
    updateCartCount(); // Actualizar contadores
}
