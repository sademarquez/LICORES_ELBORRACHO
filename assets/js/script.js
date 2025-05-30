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
let destacadosSection; // El contenedor de la sección destacados, no solo el carrusel
let mobileNavLinks; // Colección de enlaces del menú móvil

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
    productCard.className = `product-card-small panel-glass border border-slate-700/50 relative overflow-hidden group ${isFeatured ? 'flex-none w-64 mr-4' : ''}`; // Clases Tailwind
    
    productCard.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-lg mb-4">
        <h3 class="text-xl font-bold text-yellow-400 mb-2">${product.nombre}</h3>
        <p class="text-gray-300 text-sm mb-4">${product.descripcion}</p>
        <span class="block text-2xl font-bold text-white mb-4">$${product.precio.toLocaleString('es-CO')}</span>
        <button class="add-to-cart-btn bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-full transition duration-300 w-full">
            Añadir al Carrito
        </button>
    `;

    // Añadir evento al botón "Añadir al Carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
        });
    }

    return productCard;
}

// Renderizar todos los productos en el contenedor principal del catálogo
function renderProducts(productsToRender) {
    if (productosContainer) {
        productosContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos
        productsToRender.forEach(product => {
            const productCard = createProductCard(product);
            productosContainer.appendChild(productCard);
        });
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
// 4. FUNCIONES DEL CARRITO DE COMPRAS
// ==============================================

// Añadir producto al carrito
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

// Eliminar producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    console.log("Producto eliminado del carrito:", productId);
}

// Actualizar cantidad de un producto en el carrito
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId); // Eliminar si la cantidad llega a 0 o menos
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
}

// Guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Actualizar el número de productos en el icono del carrito
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    if (document.getElementById('cart-count-desktop')) document.getElementById('cart-count-desktop').textContent = totalItems;
    if (document.getElementById('cart-count-mobile')) document.getElementById('cart-count-mobile').textContent = totalItems;
}

// Renderizar los ítems en el modal del carrito
function renderCartItems() {
    if (!cartItemsContainer) {
        console.error("Contenedor de ítems del carrito (#cart-items) no encontrado.");
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
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

        // Añadir event listeners a los botones de cantidad después de renderizar
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

// Generar el mensaje de WhatsApp
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

    // Codificar el mensaje para la URL de WhatsApp
    const whatsappUrl = `https://wa.me/57TU_NUMERO_DE_TELEFONO_AQUI?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Opcional: limpiar el carrito después de enviar el pedido
    // cart = [];
    // saveCart();
    // renderCartItems();
    // updateCartCount();
    // closeCartModal(); // Cerrar el modal del carrito
}

// ==============================================
// 5. FUNCIONES DEL CARRUSEL DE DESTACADOS
// ==============================================

// Actualiza el carrusel (calcula ancho, ajusta posición)
function updateCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) {
        console.warn("Carrusel track o elementos del carrusel no encontrados.");
        return;
    }
    // Aseguramos que el ancho de un ítem se calcule desde el primer hijo
    const firstItem = carouselTrack.children[0];
    // console.log("First item offsetWidth:", firstItem.offsetWidth);
    // console.log("First item computed style marginRight:", parseFloat(getComputedStyle(firstItem).marginRight));

    // Incluir el margen derecho en el ancho total del ítem
    itemWidth = firstItem.offsetWidth + parseFloat(getComputedStyle(firstItem).marginRight);
    
    // Si no hay productos, asegúrate de que el índice se mantenga en 0
    if (carouselTrack.children.length === 0) {
        carouselIndex = 0;
    } else {
        // Asegura que carouselIndex no exceda los límites después de redimensionar
        const maxIndex = carouselTrack.children.length - Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth);
        carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
    }

    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log(`Carrusel actualizado: index=${carouselIndex}, itemWidth=${itemWidth}, transform=${carouselTrack.style.transform}`);
}

// Mover carrusel a la izquierda
function prevCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) return;

    carouselIndex = (carouselIndex - 1 + carouselTrack.children.length) % carouselTrack.children.length; // Mantiene el índice dentro de los límites
    
    // Asegura que no se mueva más allá del inicio real del carrusel si hay menos ítems que el ancho visible
    if (carouselTrack.parentElement.offsetWidth / itemWidth >= carouselTrack.children.length) {
        carouselIndex = 0; // Si todos los items caben, no hay scroll
    } else if (carouselIndex * itemWidth > carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth) {
        // Si el índice calculado va más allá del final visible, ajusta al final
        carouselIndex = Math.max(0, carouselTrack.children.length - Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth));
    }
    
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log("Carrusel anterior:", carouselIndex);

    // Reiniciar auto-scroll después de una interacción manual
    startAutoCarousel();
}

// Mover carrusel a la derecha
function nextCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) return;

    const visibleItems = Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth);
    const maxIndex = carouselTrack.children.length - visibleItems;

    if (maxIndex <= 0) { // Si todos los items caben en la vista, no hay necesidad de mover
        carouselIndex = 0;
    } else {
        carouselIndex = (carouselIndex + 1) % carouselTrack.children.length; // Mueve al siguiente

        // Si hemos llegado al final, vuelve al principio para un loop continuo
        if (carouselIndex * itemWidth >= (carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth) && carouselTrack.scrollWidth > carouselTrack.parentElement.offsetWidth) {
             carouselIndex = 0; // Vuelve al inicio para un loop infinito
        } else if (carouselIndex > maxIndex) {
            carouselIndex = 0; // Reinicia si se pasa del final posible
        }
    }
    
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    console.log("Carrusel siguiente:", carouselIndex);

    // Reiniciar auto-scroll después de una interacción manual
    startAutoCarousel();
}


// Iniciar el movimiento automático del carrusel
function startAutoCarousel() {
    stopAutoCarousel(); // Detener cualquier intervalo existente
    if (carouselTrack && carouselTrack.children.length > 0) {
        autoScrollInterval = setInterval(() => {
            // Verifica si el carrusel tiene más ítems de los que caben en la vista
            if (carouselTrack.scrollWidth > carouselTrack.parentElement.offsetWidth) {
                nextCarousel();
            } else {
                // Si todos los ítems caben, no hay necesidad de auto-scroll, detener el intervalo
                stopAutoCarousel();
            }
        }, AUTO_SCROLL_DELAY);
        // console.log("Auto-carrusel iniciado.");
    }
}

// Detener el movimiento automático del carrusel
function stopAutoCarousel() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        // console.log("Auto-carrusel detenido.");
    }
}

// ==============================================
// 6. EVENT LISTENERS Y LÓGICA DE INICIALIZACIÓN
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
    cartCountElement = document.getElementById('cart-count'); // Flotante
    carouselTrack = document.getElementById('carousel-track');
    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');
    destacadosSection = document.getElementById('destacados');
    mobileNavLinks = document.querySelectorAll('.mobile-nav-link'); // Selecciona todos los enlaces del menú móvil

    // Cargar productos y renderizar
    loadProducts();
    renderCartItems(); // Renderiza el carrito al cargar la página
    updateCartCount(); // Actualiza el contador del carrito

    // --- Event listeners para el menú móvil ---
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('-translate-x-full');
                document.body.style.overflow = 'hidden'; // Evita el scroll en el body
                console.log("Menú móvil abierto.");
            }
        });
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = ''; // Permite el scroll de nuevo
                console.log("Menú móvil cerrado por botón de cerrar.");
            }
        });
    }

    // Cierra el menú móvil al hacer clic en un enlace de navegación
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
            cartModal.classList.add('active'); // Añadir clase 'active' para la animación
            document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
            renderCartItems(); // Asegurar que el carrito esté actualizado al abrir
            console.log("Modal del carrito abierto.");
        }
    };

    const closeCartModal = () => {
        if (cartModal) {
            cartModal.classList.remove('active'); // Remover clase 'active'
            document.body.style.overflow = ''; // Habilitar scroll de fondo
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
            // Cierra el menú móvil si el carrito se abre desde el botón de carrito del menú móvil
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
    // Cerrar modal haciendo clic fuera de su contenido
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

    // Pausar/Reanudar auto-scroll en hover del contenedor principal de destacados
    if (destacadosSection) {
        destacadosSection.addEventListener('mouseenter', stopAutoCarousel);
        destacadosSection.addEventListener('mouseleave', startAutoCarousel);
    }

    // Ajustar carrusel al redimensionar la ventana para asegurar el cálculo correcto del ancho
    window.addEventListener('resize', () => {
        updateCarousel();
        // Reiniciar el auto-scroll al redimensionar para asegurar que el intervalo es válido
        startAutoCarousel(); 
        console.log("Ventana redimensionada, carrusel ajustado.");
    });

    // Iniciar el auto-scroll del carrusel cuando se carga la página y se renderizan los destacados
    // Se llama después de loadProducts() para asegurar que los items ya existen
    setTimeout(startAutoCarousel, 100); // Pequeño retraso para asegurar que todo esté renderizado
    

    // --- Event listener para el botón de Finalizar Compra (WhatsApp) ---\
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', sendOrderViaWhatsApp);
        console.log("Event listener para Finalizar Compra (WhatsApp) añadido.");
    } else {
        console.error("Botón 'Finalizar Compra' no encontrado en el DOM.");
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