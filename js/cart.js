import { OrderSystem } from './order-system.js';
import { CheckoutModal } from './checkout-modal.js';

let cart = [];
let allProducts = [];
let whatsappNumber = '';
let orderSystem = null;
let checkoutModal = null;

const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const bottomNavCartCount = document.getElementById('bottomNavCartCount');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const CART_STORAGE_KEY = 'el_borracho_cart';

export function initCart(products, phone) {
    allProducts = products;
    whatsappNumber = phone;
    
    // Inicializar sistema de pedidos
    orderSystem = new OrderSystem();
    checkoutModal = new CheckoutModal(orderSystem);
    
    // Configurar callback cuando se complete un pedido
    checkoutModal.setOrderCompleteCallback(() => {
        clearCart();
        toggleCartSidebar(false);
    });
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) { try { cart = JSON.parse(storedCart); } catch (e) { cart = []; } }
    
    document.getElementById('closeCartBtn')?.addEventListener('click', () => toggleCartSidebar(false));
    document.getElementById('checkoutWhatsappBtn')?.addEventListener('click', openCheckoutModal);
    
    cartItemsContainer?.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        const productId = button.closest('.cart-item')?.dataset.id;
        if (!productId) return;
        if (button.matches('.quantity-increase')) updateQuantity(productId, 1);
        else if (button.matches('.quantity-decrease')) updateQuantity(productId, -1);
        else if (button.matches('.remove-item-btn')) removeFromCart(productId);
    });
    updateCartUI();
}

export function toggleCartSidebar(open) {
    cartSidebar?.classList.toggle('open', open);
}

export function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity++;
    else cart.push({ id: productId, quantity: 1 });
    saveCart();
    updateCartUI();
    toggleCartSidebar(true);
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-center text-text-color-secondary p-4">Tu carrito está vacío.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = allProducts.find(p => p.id === item.id);
            if (!product) return '';
            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p class="price">$${product.price.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-increase">+</button>
                </div>
                <button class="remove-item-btn text-2xl">×</button>
            </div>`;
        }).join('');
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCount) cartCount.textContent = totalItems;
    if(bottomNavCartCount) bottomNavCartCount.textContent = totalItems;
    const totalPrice = cart.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.id);
        return sum + (product.price * item.quantity);
    }, 0);
    if(cartTotalPrice) cartTotalPrice.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
}

// Nueva función para abrir el modal de checkout profesional
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    
    checkoutModal.show(cart, allProducts);
}

// Función para limpiar el carrito
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// Función legacy para mantener compatibilidad (opcional)
function sendOrderToWhatsapp() {
    openCheckoutModal();
}
