// ==============================================
// 1. SELECTORES DE ELEMENTOS HTML (Inicialmente declarados, se asignarán dentro de DOMContentLoaded)
// ==============================================
let productosContainer;
let cartButton;
let hamburgerMenuBtn;
let mobileMenu;
let closeMobileMenuBtn;
let navCartButtonDesktop;
let navCartButtonMobile;
let cartModal;
let closeCartModalBtn;
let cartItemsContainer;
let cartTotalElement;
let cartCountElement;
let carouselTrack;
let carouselPrevBtn;
let carouselNextBtn;
let finalizePurchaseBtn;
let destacadosSection;
let mobileNavLinks;

// NUEVOS SELECTORES PARA EL BUSCADOR
let productSearchInput;
let searchButtonDesktop;
let searchButtonMobile;


// ==============================================
// 2. VARIABLES GLOBALES
// ==============================================
let products = []; // Almacena todos los productos cargados desde products.json
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carga el carrito desde localStorage
let carouselIndex = 0;
let itemWidth = 0; // Ancho de cada ítem del carrusel, se calculará dinámicamente
let autoScrollInterval;
const AUTO_SCROLL_DELAY = 3000; // Retraso en milisegundos para el auto-scroll (3 segundos)

// ==============================================
// 3. FUNCIONES DE CARGA Y RENDERIZADO
// ==============================================

// Cargar productos desde products.json
async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        console.log("Productos cargados:", products);
        renderProducts(products); // Renderiza todos los productos
        renderFeaturedProducts(); // Renderiza solo los productos destacados en el carrusel
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        // Mostrar un mensaje al usuario si los productos no se pueden cargar
        if (productosContainer) {
            productosContainer.innerHTML = '<p class="text-red-500 text-center">No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }
}

// Crear una tarjeta de producto (para catálogo o carrusel)
function createProductCard(product, isFeatured = false) {
    const productCard = document.createElement('div');
    // Asegurarse de que las clases de la tarjeta sean consistentes con el CSS
    productCard.className = `product-card-small panel-glass border border-slate-700/50 relative overflow-hidden group ${isFeatured ? 'flex-none w-64 mr-4' : ''}`; // Clases Tailwind
    
    productCard.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-lg mb-4">
        <div class="product-info">
            <h3 class="product-name">${product.nombre}</h3>
            <p class="product-description">${product.descripcion}</p>
            </div>
        <div class="product-footer">
            <span class="product-price">$${product.precio.toLocaleString('es-CO')}</span>
            <button class="add-to-cart-btn">
                Añadir al Carrito
            </button>
        </div>
    `;

    // Añadir evento al botón "Añadir al Carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que el clic en el botón active el evento de la tarjeta si lo hubiera
            addToCart(product);
        });
    }

    return productCard;
}

// Renderizar todos los productos en el contenedor principal del catálogo
function renderProducts(productsToRender) {
    if (productosContainer) {
        productosContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos
        if (productsToRender.length === 0) {
            productosContainer.innerHTML = '<p class="text-gray-400 text-center col-span-full">No se encontraron productos que coincidan con tu búsqueda.</p>';
        } else {
            productsToRender.forEach(product => {
                const productCard = createProductCard(product);
                productosContainer.appendChild(productCard);
            });
        }
    } else {
        console.error("El contenedor de productos (#productos-container) no fue encontrado.");
    }
}

// Renderizar productos destacados en el carrusel
function renderFeaturedProducts() {
    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        const featuredProducts = products.filter(p => p.destacado);
        featuredProducts.forEach(product => {
            const productCard = createProductCard(product, true); // Pasar true para isFeatured
            carouselTrack.appendChild(productCard);
        });
        updateCarousel(); // Asegura que el carrusel se inicialice correctamente después de renderizar
    } else {
        console.error("El track del carrusel (#carousel-track) no fue encontrado.");
    }
}


// ==============================================
// 4. FUNCIONES DEL CARRITO DE COMPRAS (Sin cambios significativos aquí)
// ==============================================

// ... (Todas tus funciones addToCart, removeFromCart, updateQuantity, saveCart,
// updateCartCount, renderCartItems, sendOrderViaWhatsApp van aquí, sin cambios) ...
// Copia las funciones de tu script.js actual, que deberían ser las mismas que las anteriores.

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCartItems();
    updateCartCount();
    console.log("Producto añadido al carrito:", product.nombre);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    console.log("Producto eliminado del carrito:", productId);
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
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
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    if (document.getElementById('cart-count-desktop')) document.getElementById('cart-count-desktop').textContent = totalItems;
    if (document.getElementById('cart-count-mobile')) document.getElementById('cart-count-mobile').textContent = totalItems;
}

function renderCartItems() {
    if (!cartItemsContainer) {
        console.error("Contenedor de ítems del carrito (#cart-items) no encontrado.");
        return;
    }

    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
    } else {
        let total = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p>${item.descripcion.substring(0, 40)}...</p>
                </div>
                <div class="cart-item-controls">
                    <button class="decrease-quantity-btn" data-id="${item.id}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="increase-quantity-btn" data-id="${item.id}">+</button>
                </div>
                <span class="cart-item-price">$${(item.precio * item.quantity).toLocaleString('es-CO')}</span>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.precio * item.quantity;
        });

        cartItemsContainer.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                updateQuantity(e.target.dataset.id, -1);
            });
        });
        cartItemsContainer.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                updateQuantity(e.target.dataset.id, 1);
            });
        });

        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
        }
    }
}

function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
        return;
    }

    let message = "¡Hola! Me gustaría hacer un pedido con los siguientes productos:\n\n";
    let total = 0;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.nombre} (x${item.quantity}) - $${(item.precio * item.quantity).toLocaleString('es-CO')}\n`;
        total += item.precio * item.quantity;
    });

    message += `\nTotal a pagar: $${total.toLocaleString('es-CO')}\n\n`;
    message += "¡Gracias!";

    const whatsappUrl = `https://wa.me/57TU_NUMERO_DE_TELEFONO_AQUI?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}


// ==============================================
// 5. FUNCIONES DEL CARRUSEL DE DESTACADOS (Sin cambios significativos aquí)
// ==============================================

// ... (Todas tus funciones updateCarousel, prevCarousel, nextCarousel,
// startAutoCarousel, stopAutoCarousel van aquí, sin cambios) ...
// Copia las funciones de tu script.js actual, que deberían ser las mismas que las anteriores.

function updateCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) {
        console.warn("Carrusel track o elementos del carrusel no encontrados.");
        return;
    }
    const firstItem = carouselTrack.children[0];
    itemWidth = firstItem.offsetWidth + parseFloat(getComputedStyle(firstItem).marginRight);
    
    if (carouselTrack.children.length === 0) {
        carouselIndex = 0;
    } else {
        const maxIndex = carouselTrack.children.length - Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth);
        carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
    }

    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log(`Carrusel actualizado: index=${carouselIndex}, itemWidth=${itemWidth}, transform=${carouselTrack.style.transform}`);
}

function prevCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) return;

    carouselIndex = (carouselIndex - 1 + carouselTrack.children.length) % carouselTrack.children.length;
    
    if (carouselTrack.parentElement.offsetWidth / itemWidth >= carouselTrack.children.length) {
        carouselIndex = 0;
    } else if (carouselIndex * itemWidth > carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth) {
        carouselIndex = Math.max(0, carouselTrack.children.length - Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth));
    }
    
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log("Carrusel anterior:", carouselIndex);

    startAutoCarousel();
}

function nextCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) return;

    const visibleItems = Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth);
    const maxIndex = carouselTrack.children.length - visibleItems;

    if (maxIndex <= 0) {
        carouselIndex = 0;
    } else {
        carouselIndex = (carouselIndex + 1) % carouselTrack.children.length;

        if (carouselIndex * itemWidth >= (carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth) && carouselTrack.scrollWidth > carouselTrack.parentElement.offsetWidth) {
             carouselIndex = 0;
        } else if (carouselIndex > maxIndex) {
            carouselIndex = 0;
        }
    }
    
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log("Carrusel siguiente:", carouselIndex);

    startAutoCarousel();
}

function startAutoCarousel() {
    stopAutoCarousel();
    if (carouselTrack && carouselTrack.children.length > 0) {
        autoScrollInterval = setInterval(() => {
            if (carouselTrack.scrollWidth > carouselTrack.parentElement.offsetWidth) {
                nextCarousel();
            } else {
                stopAutoCarousel();
            }
        }, AUTO_SCROLL_DELAY);
    }
}

function stopAutoCarousel() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// ==============================================
// 6. FUNCIONES DEL BUSCADOR (NUEVO)
// ==============================================

function filterProducts() {
    if (!productSearchInput) return; // Asegurarse de que el input existe
    const searchTerm = productSearchInput.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion.toLowerCase().includes(searchTerm) ||
        (product.categoria && product.categoria.toLowerCase().includes(searchTerm))
    );
    renderProducts(filteredProducts); // Vuelve a renderizar los productos filtrados
}


// ==============================================
// 7. EVENT LISTENERS Y LÓGICA DE INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Asignación de selectores (ahora dentro de DOMContentLoaded)
    productosContainer = document.getElementById('productos-container');
    cartButton = document.getElementById('cart-button');
    hamburgerMenuBtn = document.getElementById('hamburger-menu-btn');
    mobileMenu = document.getElementById('mobile-menu');
    closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
    navCartButtonDesktop = document.getElementById('nav-cart-button-desktop');
    navCartButtonMobile = document.getElementById('nav-cart-button-mobile');
    cartModal = document.getElementById('cart-modal');
    closeCartModalBtn = document.getElementById('close-cart-modal');
    cartItemsContainer = document.getElementById('cart-items');
    cartTotalElement = document.getElementById('cart-total');
    cartCountElement = document.getElementById('cart-count');
    carouselTrack = document.getElementById('carousel-track');
    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');
    destacadosSection = document.getElementById('destacados');
    mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // NUEVOS SELECTORES
    productSearchInput = document.getElementById('product-search-input');
    searchButtonDesktop = document.getElementById('search-button-desktop');
    searchButtonMobile = document.getElementById('search-button-mobile');


    // Cargar productos y renderizar
    loadProducts();
    renderCartItems();
    updateCartCount();

    // --- Event listeners para el menú móvil ---
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('-translate-x-full');
                document.body.style.overflow = 'hidden';
                console.log("Menú móvil abierto.");
            }
        });
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
                console.log("Menú móvil cerrado por botón de cerrar.");
            }
        });
    }

    if (mobileNavLinks) {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu) {
                    mobileMenu.classList.add('-translate-x-full');
                    document.body.style.overflow = '';
                    console.log("Menú móvil cerrado por clic en enlace.");
                }
            });
        });
    }

    // --- Event listeners para el modal del carrito ---
    const openCartModal = () => {
        if (cartModal) {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            renderCartItems();
            console.log("Modal del carrito abierto.");
        }
    };

    const closeCartModal = () => {
        if (cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
            console.log("Modal del carrito cerrado.");
        }
    };

    if (cartButton) {
        cartButton.addEventListener('click', openCartModal);
    }
    if (navCartButtonDesktop) {
        navCartButtonDesktop.addEventListener('click', openCartModal);
    }
    if (navCartButtonMobile) {
        navCartButtonMobile.addEventListener('click', () => {
            openCartModal();
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
            console.log("Modal del carrito abierto desde nav (móvil).");
        });
    }
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', closeCartModal);
    }
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }

    // --- Event listeners para el carrusel ---
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

    setTimeout(startAutoCarousel, 100);
    
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', sendOrderViaWhatsApp);
        console.log("Event listener para Finalizar Compra (WhatsApp) añadido.");
    } else {
        console.error("Botón 'Finalizar Compra' no encontrado en el DOM.");
    }

    // --- NUEVOS EVENT LISTENERS PARA EL BUSCADOR ---
    if (productSearchInput) {
        productSearchInput.addEventListener('input', filterProducts); // Filtra en cada cambio de input
    }
    // Opcional: Si quieres que los botones de lupa hagan algo al hacer clic (ej. enfocar el input)
    if (searchButtonDesktop) {
        searchButtonDesktop.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus(); // Enfocar el input al hacer clic en la lupa
                window.location.href = '#catalogo'; // Opcional: scroll al catálogo
            }
        });
    }
    if (searchButtonMobile) {
        searchButtonMobile.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus(); // Enfocar el input al hacer clic en la lupa
                window.location.href = '#catalogo'; // Opcional: scroll al catálogo
            }
            // Si el menú móvil está abierto, ciérralo
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    }
});

// Función para el efecto de fade-in-up al hacer scroll
const animateElements = () => {
    const elements = document.querySelectorAll('.animate-fade-in-up');
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        // Cuando el elemento entra en el 80% de la ventana
        if (rect.top < window.innerHeight * 0.8) {
            element.classList.add('fade-in-up-active');
        }
    });
};

// Event listener para el scroll
window.addEventListener('scroll', animateElements);

// Ejecutar al cargar para elementos ya visibles
animateElements();