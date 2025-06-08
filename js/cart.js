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
    cartSidebar = document.getElementById('cartSidebar');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalPriceElement = document.getElementById('cartTotalPrice');
    cartCountElement = document.getElementById('cartCount'); // Del header
    bottomCartCountElement = document.getElementById('bottomCartCount'); // NUEVO: Del bottom nav
    closeCartBtn = document.getElementById('closeCartBtn');
    checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

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

    // NUEVO: Cerrar el carrito al hacer clic fuera de él (en el overlay)
    // El modal de búsqueda ya maneja su propio overlay, pero el sidebar del carrito no es un "modal"
    // en el sentido de superponerse a toda la pantalla, sino un panel lateral.
    // Para cerrarlo al hacer clic fuera, podemos añadir un listener al window o a un overlay si lo tuviéramos.
    // Una forma común es que el "cart-sidebar" tenga un fondo semitransparente que ocupe toda la pantalla
    // y al hacer click en ese fondo, se cierre. Si no hay un overlay, se puede hacer click en el body,
    // pero hay que asegurarse de que no se cierre al hacer click dentro del sidebar.
    
    // Si el carrito se abre y superpone un pseudo-overlay (ej. por CSS con ::before o con un div real),
    // o simplemente el sidebar se posiciona y tiene un Z-index alto,
    // podemos escuchar clics en el 'window' y verificar si el clic no fue dentro del sidebar.
    window.addEventListener('click', (event) => {
        // Si el carrito está abierto Y el clic no fue dentro del carrito (o en el ícono para abrirlo)
        if (cartSidebar.classList.contains('open') &&
            !cartSidebar.contains(event.target) &&
            !cartIcon.contains(event.target) &&
            !bottomCartCountElement.closest('.nav-item').contains(event.target) // Evitar que cierre al clickear el icono del nav inferior
            ) {
            toggleCartSidebar(false); // Cierra el carrito
        }
    });


    renderCart();
}

export function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showToastNotification(`${product.name} añadido al carrito (+1)`, 'info');
        } else {
            showToastNotification(`No hay más stock de ${product.name}.`, 'warning');
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
    renderCart();
    updateCartCount();
}

export function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
    showToastNotification('Producto eliminado del carrito.', 'error');
}

export function updateCartItemQuantity(productId, change) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        const productInAppState = appState.products.find(p => p.id === productId);
        const maxStock = productInAppState ? productInAppState.stock : Infinity; // Obtener stock del producto original

        if (change > 0) { // Incrementar
            if (item.quantity < maxStock) {
                item.quantity += change;
            } else {
                showToastNotification(`No hay más stock de ${item.name}.`, 'warning');
            }
        } else { // Decrementar
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
                return;
            }
        }
        saveCart();
        renderCart();
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

function renderCart() {
    cartItemsContainer.innerHTML = ''; // Limpiar carrito antes de renderizar
    let totalPrice = 0;

    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        checkoutWhatsappBtn.disabled = true; // Deshabilitar botón si el carrito está vacío
    } else {
        checkoutWhatsappBtn.disabled = false; // Habilitar botón si hay ítems
        appState.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');

            const itemPrice = item.isOnOffer ? item.offerPrice : item.price;
            totalPrice += itemPrice * item.quantity;

            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">$${itemPrice.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-quantity">
                    <button data-product-id="${item.id}" data-change="-1">-</button>
                    <span>${item.quantity}</span>
                    <button data-product-id="${item.id}" data-change="1">+</button>
                </div>
                <button class="remove-from-cart-btn" data-product-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
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
    if (bottomCartCountElement) { // Actualiza también el contador de la barra inferior
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
    }
}
