// ... (Previous script.js code) ...

// ==============================================
// 1. SELECTORES DE ELEMENTOS HTML
// ==============================================
const productosContainer = document.getElementById('productos-container');
const cartButton = document.getElementById('cart-button'); // Botón flotante del carrito
// Nuevos selectores para la navegación móvil
const hamburgerMenuBtn = document.getElementById('hamburger-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
const navCartButtonDesktop = document.getElementById('nav-cart-button-desktop'); // Botón de carrito en la navegación de escritorio
const navCartButtonMobile = document.getElementById('nav-cart-button-mobile');   // Botón de carrito en la navegación móvil

const cartModal = document.getElementById('cart-modal');
const closeCartModalBtn = document.getElementById('close-cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const carouselTrack = document.getElementById('carousel-track');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');

// Selector del contenedor principal del carrusel para el hover
const destacadosSection = document.getElementById('destacados');

// Selectores para los botones de filtro de categoría
const filterButtons = document.querySelectorAll('.filter-btn');


// ==============================================
// 2. ESTADO GLOBAL
// ==============================================
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let carouselInterval; // Variable para almacenar el ID del intervalo del carrusel
let carouselIndex = 0; // Índice actual del carrusel
let startX = 0; // Para el swipe del carrusel
let currentCategory = 'all'; // Default category filter


// ==============================================
// 3. FUNCIONES DE CARGA DE PRODUCTOS
// ==============================================
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        console.log("Productos cargados:", products);
        displayProducts(products); // Mostrar todos los productos inicialmente en el catálogo
        displayFeaturedProducts(products); // Mostrar productos destacados en el carrusel
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

function displayProducts(productsToDisplay) {
    if (!productosContainer) {
        console.error("El contenedor de productos no fue encontrado.");
        return;
    }
    productosContainer.innerHTML = ''; // Limpiar productos existentes

    // Filter products by currentCategory
    const filteredProducts = currentCategory === 'all'
        ? productsToDisplay
        : productsToDisplay.filter(product => product.categoria === currentCategory);


    if (filteredProducts.length === 0) {
        productosContainer.innerHTML = '<p class="text-gray-400 text-center col-span-full">No hay productos disponibles en esta categoría.</p>';
        return;
    }
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bg-slate-800/80 panel-glass rounded-lg p-4 shadow-lg flex flex-col items-center text-center';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-md mb-4">
            <h4 class="text-xl font-bold text-yellow-400 mb-2">${product.nombre}</h4>
            <p class="text-gray-300 text-sm mb-2">${product.descripcion}</p>
            <p class="text-gray-400 text-xs mb-4">${product.volumen} - ${product.categoria}</p>
            <p class="text-2xl font-bold text-white mb-4">$${product.precio.toLocaleString('es-CO')}</p>
            <button data-id="${product.id}" class="add-to-cart-btn bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-full transition duration-300">
                Agregar al Carrito
            </button>
        `;
        productosContainer.appendChild(productCard);
    });

    // Añadir event listeners a los nuevos botones de "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            addToCart(productId);
        });
    });
}

function displayFeaturedProducts(allProducts) {
    const featuredProducts = allProducts.filter(product => product.destacado);
    if (!carouselTrack) {
        console.error("El carrusel track no fue encontrado.");
        return;
    }
    carouselTrack.innerHTML = '';
    if (featuredProducts.length === 0) {
        carouselTrack.innerHTML = '<p class="text-gray-400 text-center col-span-full">No hay productos destacados.</p>';
        return;
    }

    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card-small flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 bg-slate-800/80 panel-glass rounded-lg p-4 shadow-lg flex flex-col items-center text-center';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-32 object-cover rounded-md mb-2">
            <h5 class="text-lg font-bold text-yellow-400 mb-1 truncate w-full">${product.nombre}</h5>
            <p class="text-gray-300 text-xs mb-2">${product.volumen}</p>
            <p class="product-price text-xl font-bold text-white mb-3">$${product.precio.toLocaleString('es-CO')}</p>
            <button data-id="${product.id}" class="add-to-cart-btn bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-full transition duration-300 text-sm">
                Añadir
            </button>
        `;
        carouselTrack.appendChild(productCard);
    });

    // Re-añadir event listeners a los nuevos botones de "Añadir" en el carrusel
    document.querySelectorAll('#carousel-track .add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            addToCart(productId);
        });
    });

    updateCarousel(); // Asegura el cálculo inicial del tamaño
    startAutoCarousel(); // Inicia el auto-scroll
}


// ==============================================
// 4. FUNCIONES DEL CARRITO
// ==============================================
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getProductById(productId) {
    return products.find(p => p.id === productId);
}

function addToCart(productId) {
    const product = getProductById(productId);
    if (product) {
        const existingCartItem = cart.find(item => item.id === productId);

        if (existingCartItem) {
            existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
        } else {
            cart.push({ ...product,
                quantity: 1
            });
        }
        saveCart();
        updateCart();
        console.log("Producto añadido al carrito:", product.nombre, "Carrito actual:", cart);
    } else {
        console.warn("Producto no encontrado para añadir al carrito:", productId);
    }
}


function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);

    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
        updateCart();
        console.log("Producto eliminado del carrito:", productId, "Carrito actual:", cart);
    } else {
        console.warn("Producto no encontrado en el carrito para eliminar:", productId);
    }
}

function updateCart() {
    if (!cartItemsContainer || !cartTotalElement || !cartCountElement) {
        console.error("Uno o más elementos del DOM para el carrito no fueron encontrados.");
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            const itemPrice = item.precio * (item.quantity || 1);
            total += itemPrice;
            itemCount += (item.quantity || 1);

            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'flex items-center justify-between p-3 border-b border-slate-700 last:border-b-0';
            cartItemElement.innerHTML = `
                <div class="flex items-center">
                    <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-md mr-4">
                    <div>
                        <h4 class="text-white font-semibold text-lg">${item.nombre}</h4>
                        <p class="text-gray-400 text-sm">${item.volumen} - ${item.categoria}</p>
                        <p class="text-yellow-400 font-bold">$${item.precio.toLocaleString('es-CO')} x ${item.quantity || 1}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button data-id="${item.id}" class="remove-from-cart-btn text-red-500 hover:text-red-600 text-2xl font-bold leading-none">&ndash;</button>
                    <span class="text-white text-lg">${item.quantity || 1}</span>
                    <button data-id="${item.id}" class="add-to-cart-btn-modal text-green-500 hover:text-green-600 text-2xl font-bold leading-none">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    cartCountElement.textContent = itemCount;

    // Update the desktop/mobile cart counts if they are separate
    const cartCountDesktop = document.getElementById('cart-count-desktop');
    const cartCountMobile = document.getElementById('cart-count-mobile');
    if (cartCountDesktop) cartCountDesktop.textContent = itemCount;
    if (cartCountMobile) cartCountMobile.textContent = itemCount;


    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.add-to-cart-btn-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            addToCart(productId);
        });
    });

    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.disabled = cart.length === 0;
        if (cart.length === 0) {
            finalizePurchaseBtn.classList.add('opacity-50', 'cursor-not-allowed');
            finalizePurchaseBtn.classList.remove('hover:bg-green-600');
        } else {
            finalizePurchaseBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            finalizePurchaseBtn.classList.add('hover:bg-green-600');
        }
    }
}


function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Por favor, añade algunos productos antes de finalizar la compra.");
        return;
    }

    const phoneNumber = '+573177610332';
    let message = '¡Hola! Me gustaría hacer un pedido con los siguientes productos:\n\n';
    let total = 0;

    // Group items by category for a more organized message
    const categorizedItems = {};
    cart.forEach(item => {
        if (!categorizedItems[item.categoria]) {
            categorizedItems[item.categoria] = [];
        }
        categorizedItems[item.categoria].push(item);
        total += (item.precio * (item.quantity || 1));
    });

    for (const category in categorizedItems) {
        message += `*${category}*:\n`;
        categorizedItems[category].forEach(item => {
            const itemTotal = (item.precio * (item.quantity || 1));
            message += `- ${item.nombre} (${item.volumen}) x ${(item.quantity || 1)}: $${itemTotal.toLocaleString('es-CO')}\n`;
        });
    }

    const shippingCost = calculateShippingCost();
    const totalWithShipping = total + shippingCost;

    message += `\n--- Resumen del Pedido ---\n`;
    message += `Subtotal: $${total.toLocaleString('es-CO')}`;
    if (shippingCost > 0) {
        message += `\nCosto de Envío: $${shippingCost.toLocaleString('es-CO')} (aproximado - a confirmar)`;
    } else {
        message += `\nCosto de Envío: ¡GRATIS!`;
    }
    message += `\nTotal a Pagar: $${totalWithShipping.toLocaleString('es-CO')}`;
    message += `\n\nPor favor, confírmame la disponibilidad de los productos y el costo de envío exacto.`;
    message += `\n¡Gracias!`;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    // // Opcional: Limpiar el carrito después de enviar la orden
    // cart = [];
    // saveCart();
    // updateCart();
    // cartModal.style.display = 'none';
}

function calculateShippingCost() {
    const orderTotal = cart.reduce((sum, item) => sum + (item.precio * (item.quantity || 1)), 0);
    const freeShippingThreshold = 150000;

    if (orderTotal >= freeShippingThreshold) {
        return 0;
    } else {
        return 8000; // Example flat rate
    }
}


// ==============================================
// 5. FUNCIONES DEL CARRUSEL
// ==============================================

function updateCarousel() {
    if (!carouselTrack) return;

    const firstCard = carouselTrack.querySelector('.product-card-small');
    if (!firstCard) {
        carouselTrack.style.transform = `translateX(0px)`;
        return;
    }
    const cardWidth = firstCard.offsetWidth + 16;

    const carouselContainerWidth = document.getElementById('destacados-container').offsetWidth;
    let visibleCards = Math.floor(carouselContainerWidth / cardWidth);
    if (visibleCards === 0) visibleCards = 1;

    const totalCards = carouselTrack.children.length;

    if (carouselIndex > totalCards - visibleCards) {
        carouselIndex = 0;
    }
    if (carouselIndex < 0) {
        carouselIndex = totalCards - visibleCards > 0 ? totalCards - visibleCards : 0;
    }

    const offset = -carouselIndex * cardWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;

    console.log(`Carousel updated: index=${carouselIndex}, cardWidth=${cardWidth}, visibleCards=${visibleCards}, offset=${offset}`);
}


function nextCarousel() {
    if (!carouselTrack) return;
    const firstCard = carouselTrack.querySelector('.product-card-small');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth + 16;
    const carouselContainerWidth = document.getElementById('destacados-container').offsetWidth;
    let visibleCards = Math.floor(carouselContainerWidth / cardWidth);
    if (visibleCards === 0) visibleCards = 1;

    const totalCards = carouselTrack.children.length;

    carouselIndex++;
    if (carouselIndex > totalCards - visibleCards) {
        carouselIndex = 0;
    }
    updateCarousel();
}

function prevCarousel() {
    if (!carouselTrack) return;
    const firstCard = carouselTrack.querySelector('.product-card-small');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth + 16;
    const carouselContainerWidth = document.getElementById('destacados-container').offsetWidth;
    let visibleCards = Math.floor(carouselContainerWidth / cardWidth);
    if (visibleCards === 0) visibleCards = 1;

    const totalCards = carouselTrack.children.length;

    carouselIndex--;
    if (carouselIndex < 0) {
        carouselIndex = totalCards - visibleCards;
        if (carouselIndex < 0) carouselIndex = 0;
    }
    updateCarousel();
}

function startAutoCarousel() {
    stopAutoCarousel();
    carouselInterval = setInterval(nextCarousel, 3000);
    console.log("Auto-carousel iniciado.");
}

function stopAutoCarousel() {
    clearInterval(carouselInterval);
    console.log("Auto-carousel detenido.");
}

// --- NEW: Carousel Touch Swipe Events ---
if (carouselTrack) {
    carouselTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoCarousel(); // Stop auto-scroll when user starts swiping
    });

    carouselTrack.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        if (diffX > 50) { // Swiped left (to next)
            nextCarousel();
        } else if (diffX < -50) { // Swiped right (to prev)
            prevCarousel();
        }
        startAutoCarousel(); // Restart auto-scroll after swipe
    });
}


// ==============================================
// 6. LISTENERS DE EVENTOS
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCart(); // Inicializar el carrito al cargar la página
    updateCarousel(); // Asegura el cálculo inicial del tamaño del carrusel

    startAutoCarousel();
});

if (cartButton) {
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log("Modal del carrito abierto desde botón flotante.");
    });
}

if (closeCartModalBtn) {
    closeCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.style.overflow = '';
        console.log("Modal del carrito cerrado.");
    });
}

window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = '';
        console.log("Modal del carrito cerrado por clic fuera.");
    }
});


if (hamburgerMenuBtn) {
    hamburgerMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('translate-x-0'); // Slide in
        document.body.style.overflow = 'hidden';
        console.log("Menú móvil abierto.");
    });
}

if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0'); // Slide out
        mobileMenu.classList.add('hidden'); // Hide after transition (or just rely on transform for visual hide)
        document.body.style.overflow = '';
        console.log("Menú móvil cerrado.");
    });
}

document.querySelectorAll('#mobile-menu a').forEach(item => {
    item.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0'); // Slide out
        mobileMenu.classList.add('hidden'); // Hide after transition
        document.body.style.overflow = '';
        console.log("Enlace de menú móvil clicado, cerrando menú.");
    });
});

const navCartButtons = document.querySelectorAll('#nav-cart-button-desktop, #nav-cart-button-mobile');
navCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log("Modal del carrito abierto desde nav.");
    });
});


if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', prevCarousel);
}
if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', nextCarousel);
}

if (destacadosSection) {
    destacadosSection.addEventListener('mouseenter', stopAutoCarousel);
    destacadosSection.addEventListener('mouseleave', startAutoCarousel);
}

window.addEventListener('resize', () => {
    updateCarousel();
    startAutoCarousel();
    console.log("Ventana redimensionada, carrusel ajustado.");
});

if (finalizePurchaseBtn) {
    finalizePurchaseBtn.addEventListener('click', sendOrderViaWhatsApp);
    console.log("Event listener para Finalizar Compra (WhatsApp) añadido.");
} else {
    console.error("Botón 'Finalizar Compra' no encontrado en el DOM.");
}

// --- NEW: Category Filter Event Listeners ---
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        currentCategory = category; // Update global state
        
        // Update active class for buttons
        filterButtons.forEach(btn => btn.classList.remove('active', 'bg-yellow-500', 'text-slate-900'));
        filterButtons.forEach(btn => btn.classList.add('bg-slate-700', 'text-white')); // Reset others

        e.target.classList.add('active', 'bg-yellow-500', 'text-slate-900');
        e.target.classList.remove('bg-slate-700', 'text-white'); // Remove old styles

        displayProducts(products); // Re-display products based on new filter
        console.log(`Filtering by category: ${category}`);
    });
});