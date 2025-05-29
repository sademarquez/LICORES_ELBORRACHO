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

// ==============================================
// 2. VARIABLES GLOBALES Y ESTADO
// ==============================================
let productsData = []; // Almacenará todos los productos cargados
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carga el carrito desde localStorage
let carouselIndex = 0; // Índice actual del carrusel activo
let itemWidth = 0; // Ancho de un ítem del carrusel, calculado dinámicamente

// ==============================================
// 3. FUNCIONES DE CARGA Y RENDERIZADO
// ==============================================

/**
 * Carga los productos desde products.json
 */
async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        productsData = await response.json();
        console.log("Productos cargados:", productsData);
        renderFeaturedProducts(productsData); // Renderizar productos destacados primero
        renderProducts(productsData); // Luego renderizar el catálogo completo
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        if (productosContainer) {
            productosContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Error al cargar los productos. Por favor, intente más tarde.</p>';
        } else {
            console.warn("Elemento 'productos-container' no encontrado al intentar mostrar mensaje de error.");
        }
        if (carouselTrack) {
             carouselTrack.innerHTML = '<p class="text-red-500 text-center w-full">Error al cargar productos destacados.</p>';
        }
    }
}

/**
 * Renderiza los productos en el contenedor principal.
 * @param {Array} products - Array de objetos de producto.
 */
function renderProducts(products) {
    if (!productosContainer) {
        console.warn("Elemento 'productos-container' no encontrado, no se pueden renderizar productos.");
        return;
    }
    productosContainer.innerHTML = ''; // Limpiar productos existentes
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-slate-800/80 panel-glass rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col cursor-pointer';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-t-lg">
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="text-xl font-bold text-yellow-400 mb-2">${product.nombre}</h3>
                <p class="text-gray-300 text-sm mb-2 flex-grow">${product.descripcion.substring(0, 100)}${product.descripcion.length > 100 ? '...' : ''}</p> 
                <div class="flex justify-between items-center mt-auto pt-2 border-t border-slate-700/50">
                    <span class="text-2xl font-bold text-white">$${product.precio.toLocaleString('es-CO')}</span>
                    <button class="add-to-cart-btn bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded-full transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
                            data-id="${product.id}"
                            data-nombre="${product.nombre}"
                            data-precio="${product.precio}"
                            data-imagen="${product.imagen}">
                        Añadir
                    </button>
                </div>
            </div>
        `;
        productosContainer.appendChild(productCard);
    });
    addAddToCartListeners();
}

/**
 * Renderiza los productos destacados en el carrusel.
 * @param {Array} allProducts - Array de todos los productos cargados.
 */
function renderFeaturedProducts(allProducts) {
    if (!carouselTrack) {
        console.warn("Elemento 'carousel-track' no encontrado, no se pueden renderizar productos destacados.");
        return;
    }
    carouselTrack.innerHTML = ''; // Limpiar productos destacados existentes

    const featuredProducts = allProducts.filter(product => product.destacado);
    if (featuredProducts.length === 0) {
        carouselTrack.innerHTML = '<p class="text-gray-400 text-center w-full">No hay productos destacados disponibles.</p>';
        return;
    }

    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        // Mantener las clases Tailwind de tamaño para el cálculo inicial del ancho,
        // pero la transformación visual será manejada por JS.
        productCard.className = 'flex-none w-64 mr-4 bg-slate-800/80 panel-glass rounded-lg shadow-lg overflow-hidden flex flex-col';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-40 object-cover rounded-t-lg">
            <div class="p-3 flex-grow flex flex-col">
                <h3 class="text-lg font-bold text-yellow-400 mb-1">${product.nombre}</h3>
                <p class="text-gray-300 text-xs mb-2 flex-grow">${product.descripcion.substring(0, 70)}...</p>
                <div class="flex justify-between items-center mt-auto pt-2 border-t border-slate-700/50">
                    <span class="text-xl font-bold text-white">$${product.precio.toLocaleString('es-CO')}</span>
                    <button class="add-to-cart-btn bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-1 px-3 rounded-full text-sm transition duration-300"
                            data-id="${product.id}"
                            data-nombre="${product.nombre}"
                            data-precio="${product.precio}"
                            data-imagen="${product.imagen}">
                        Añadir
                    </button>
                </div>
            </div>
        `;
        carouselTrack.appendChild(productCard);
    });
    // Inicializar o actualizar el carrusel después de renderizar productos
    updateCarousel();
    addAddToCartListeners(); // Asegurarse de que los botones tengan listeners
}


/**
 * Actualiza la visualización del carrito en el modal.
 */
function updateCartDisplay() {
    if (!cartItemsContainer) {
        console.warn("Elemento 'cart-items' no encontrado, no se puede actualizar la visualización del carrito.");
        return;
    }
    cartItemsContainer.innerHTML = ''; // Limpiar ítems existentes
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between bg-slate-700/50 p-3 rounded-lg mb-2';
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md mr-3">
                <div class="flex-grow">
                    <p class="font-bold text-white">${item.nombre}</p>
                    <p class="text-gray-300 text-sm">$${item.precio.toLocaleString('es-CO')} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="remove-one-btn text-white bg-red-600 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm" data-id="${item.id}">-</button>
                    <span class="text-white font-bold">${item.quantity}</span>
                    <button class="add-one-btn text-white bg-green-600 hover:bg-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm" data-id="${item.id}">+</button>
                    <button class="remove-all-btn text-red-400 hover:text-red-600 ml-2 text-xl" data-id="${item.id}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.precio * item.quantity;
        });
    }

    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    } else {
        console.warn("Elemento 'cart-total' no encontrado.");
    }

    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems.toString();
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none'; // Mostrar/ocultar contador
    } else {
        console.warn("Elemento 'cart-count' no encontrado.");
    }

    addCartItemListeners(); // Añadir listeners a los botones de +/-/x
}

// ==============================================
// 4. FUNCIONES DE LÓGICA DEL CARRITO
// ==============================================

/**
 * Añade un producto al carrito.
 * @param {string} id - ID del producto.
 * @param {string} nombre - Nombre del producto.
 * @param {number} precio - Precio del producto.
 * @param {string} imagen - URL de la imagen del producto.
 */
function addToCart(id, nombre, precio, imagen) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, nombre, precio, imagen, quantity: 1 });
    }
    saveCart();
    updateCartDisplay();
    alert(`"${nombre}" ha sido añadido al carrito.`);
    console.log("Producto añadido al carrito:", { id, nombre, precio, imagen });
}

/**
 * Añade event listeners a los botones "Añadir al Carrito".
 */
function addAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.onclick = (e) => { // Usar onclick para evitar duplicados si se llama varias veces renderProducts
            const { id, nombre, precio, imagen } = e.currentTarget.dataset;
            addToCart(id, nombre, parseFloat(precio), imagen);
        };
    });
}

/**
 * Añade event listeners a los botones dentro de los ítems del carrito (+, -, x).
 */
function addCartItemListeners() {
    document.querySelectorAll('.add-one-btn').forEach(button => {
        button.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            const item = cart.find(i => i.id === id);
            if (item) {
                item.quantity++;
                saveCart();
                updateCartDisplay();
            }
        };
    });

    document.querySelectorAll('.remove-one-btn').forEach(button => {
        button.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            const itemIndex = cart.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1); // Eliminar si la cantidad es 1
                }
                saveCart();
                updateCartDisplay();
            }
        };
    });

    document.querySelectorAll('.remove-all-btn').forEach(button => {
        button.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            cart = cart.filter(item => item.id !== id);
            saveCart();
            updateCartDisplay();
            alert('Producto eliminado del carrito.');
        };
    });
}

/**
 * Guarda el carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Carrito guardado:", cart);
}

// ==============================================
// 5. FUNCIONALIDAD DE WHATSAPP
// ==============================================

/**
 * Genera el mensaje de WhatsApp con el resumen del pedido y limpia el carrito.
 */
function sendOrderViaWhatsApp() {
    console.log("sendOrderViaWhatsApp function called.");

    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
        console.log("Carrito vacío. No se puede enviar el pedido.");
        return;
    }

    let message = "¡Hola! Me gustaría hacer un pedido con los siguientes productos:\n\n";
    let total = 0;

    cart.forEach(item => {
        message += `- ${item.nombre} x ${item.quantity} = $${(item.precio * item.quantity).toLocaleString('es-CO')}\n`;
        total += item.precio * item.quantity;
    });

    message += `\nTotal a pagar: $${total.toLocaleString('es-CO')}\n\n`;
    message += "¡Gracias!";

    const phoneNumber = "573101234567"; // ¡CAMBIA ESTE NÚMERO A TU NÚMERO REAL DE WHATSAPP!
    console.log("Número de teléfono de WhatsApp configurado:", phoneNumber);
    console.log("Mensaje a enviar (antes de encodeURIComponent):\n", message);

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log("URL de WhatsApp generada:", whatsappUrl);

    window.open(whatsappUrl, '_blank');
    console.log("Intento de abrir WhatsApp.");

    cart = []; // Vacía el array del carrito
    saveCart(); // Guarda el carrito vacío en localStorage
    updateCartDisplay(); // Actualiza la interfaz del carrito para mostrarlo vacío
    cartModal.style.display = 'none'; // Cierra el modal del carrito

    alert('Tu pedido ha sido enviado a WhatsApp. ¡Gracias por tu compra!');
}

// ==============================================
// 6. FUNCIONALIDAD DEL CARRUSEL (DESTACADOS) - ¡ACTUALIZADO PARA EFECTO 3D!
// ==============================================

/**
 * Actualiza la visualización del carrusel aplicando transformaciones 3D.
 */
function updateCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) {
        console.warn("Carrusel no encontrado o sin ítems para actualizar.");
        return;
    }

    const items = Array.from(carouselTrack.children);
    const numItems = items.length;

    // Calcular el ancho real de un ítem (w-64 = 256px + mr-4 = 16px)
    // Se calcula solo una vez o si no está definido para optimizar.
    if (items.length > 0 && itemWidth === 0) {
        const firstItem = items[0];
        const computedStyle = getComputedStyle(firstItem);
        const itemClientWidth = firstItem.offsetWidth; // Ancho incluyendo padding y borde
        const itemMarginRight = parseFloat(computedStyle.marginRight);
        itemWidth = itemClientWidth + itemMarginRight;
        if (itemWidth === 0) itemWidth = 256 + 16; // Fallback si el cálculo falla
    }

    // Asegurar que carouselIndex esté dentro de los límites
    carouselIndex = Math.max(0, Math.min(carouselIndex, numItems - 1));

    // Desplazar el contenedor del carrusel para centrar el elemento activo
    // Aquí usamos un ajuste para que el elemento activo (carouselIndex) se posicione
    // cerca del centro de la vista del carrusel, pero los transform individuales lo harán "flotar".
    // Esto es especialmente importante para móvil donde solo se ve un item a la vez.
    const carouselContainerWidth = carouselTrack.parentElement.offsetWidth;
    const scrollOffset = (carouselContainerWidth / 2) - (itemWidth / 2) - (carouselIndex * itemWidth);
    carouselTrack.style.transform = `translateX(${scrollOffset}px)`;


    // Aplicar transformaciones 3D a cada ítem individual
    items.forEach((item, i) => {
        const offset = i - carouselIndex; // Distancia del ítem al índice central

        let transform = '';
        let opacity = 0; // Por defecto, todos ocultos
        let zIndex = 1; // Z-index base bajo
        let pointerEvents = 'none'; // No interactivo por defecto

        // Definir transformaciones para los ítems cercanos al activo
        if (offset === 0) { // Ítem activo (centro)
            transform = `
                scale(1.1)        /* Ligeramente más grande */
                rotateY(0deg)     /* Sin rotación */
                translateZ(100px) /* Se mueve hacia adelante */
            `;
            opacity = 1;
            zIndex = 30; // El más alto
            pointerEvents = 'auto'; // Habilitar interacción
        } else if (offset === -1) { // Ítem directamente a la izquierda
            transform = `
                scale(0.85)         /* Más pequeño */
                rotateY(25deg)      /* Rotado hacia atrás a la izquierda */
                translateZ(-80px)   /* Se mueve hacia atrás en profundidad */
                translateX(-50px)   /* Se mueve hacia la izquierda para simular apilamiento */
            `;
            opacity = 0.7;
            zIndex = 20; // Detrás del activo
        } else if (offset === 1) { // Ítem directamente a la derecha
            transform = `
                scale(0.85)         /* Más pequeño */
                rotateY(-25deg)     /* Rotado hacia atrás a la derecha */
                translateZ(-80px)   /* Se mueve hacia atrás en profundidad */
                translateX(50px)    /* Se mueve hacia la derecha para simular apilamiento */
            `;
            opacity = 0.7;
            zIndex = 20; // Detrás del activo
        } else if (offset === -2) { // Ítem dos a la izquierda
            transform = `
                scale(0.7)          /* Aún más pequeño */
                rotateY(45deg)      /* Más rotado */
                translateZ(-150px)  /* Más atrás */
                translateX(-80px)   /* Más a la izquierda */
            `;
            opacity = 0.4;
            zIndex = 10; // Más atrás
        } else if (offset === 2) { // Ítem dos a la derecha
            transform = `
                scale(0.7)          /* Aún más pequeño */
                rotateY(-45deg)     /* Más rotado */
                translateZ(-150px)  /* Más atrás */
                translateX(80px)    /* Más a la derecha */
            `;
            opacity = 0.4;
            zIndex = 10; // Más atrás
        } else { // Otros ítems (fuera de vista o muy lejos)
            transform = `
                scale(0.6)          /* Muy pequeño */
                rotateY(${offset > 0 ? -60 : 60}deg) /* Rotación fuerte */
                translateZ(-200px)  /* Muy atrás */
                translateX(${offset > 0 ? 100 : -100}px) /* Fuera de vista */
            `;
            opacity = 0; // Completamente transparente
            zIndex = 5; // El más bajo
        }

        item.style.transform = transform;
        item.style.opacity = opacity;
        item.style.zIndex = zIndex;
        item.style.pointerEvents = pointerEvents;

        // Añadir/quitar clase 'carousel-active-item' para estilos CSS adicionales
        if (offset === 0) {
            item.classList.add('carousel-active-item');
        } else {
            item.classList.remove('carousel-active-item');
        }
    });

    // Actualizar el estado de los botones de navegación
    if (carouselPrevBtn) {
        carouselPrevBtn.disabled = carouselIndex === 0;
        carouselPrevBtn.classList.toggle('opacity-50', carouselIndex === 0);
    }
    if (carouselNextBtn) {
        carouselNextBtn.disabled = carouselIndex === numItems - 1;
        carouselNextBtn.classList.toggle('opacity-50', carouselIndex === numItems - 1);
    }
    console.log(`Carrusel actualizado. Índice: ${carouselIndex}`);
}


function prevCarousel() {
    if (carouselIndex > 0) {
        carouselIndex--;
        updateCarousel();
        console.log("Carrusel: Anterior");
    }
}

function nextCarousel() {
    const numItems = carouselTrack.children.length;
    if (carouselIndex < numItems - 1) {
        carouselIndex++;
        updateCarousel();
        console.log("Carrusel: Siguiente");
    }
}


// ==============================================
// 7. INICIALIZACIÓN DE EVENTOS
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); // Cargar productos al iniciar (esto llama a renderFeaturedProducts y updateCarousel)
    updateCartDisplay(); // Actualizar la visualización del carrito al cargar

    // --- Abrir/Cerrar Modal del Carrito ---
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            cartModal.style.display = 'flex';
            console.log("Modal del carrito abierto desde botón flotante.");
        });
    }

    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
            console.log("Modal del carrito cerrado desde botón de cierre.");
        });
    }

    // Cerrar el modal del carrito al hacer clic fuera
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
                console.log("Modal del carrito cerrado haciendo clic fuera.");
            }
        });
    }

    // --- Navegación del Menú Móvil ---
    if (hamburgerMenuBtn && mobileMenu && closeMobileMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full'); // Muestra el menú
            mobileMenu.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden'; // Evita el scroll del cuerpo
            console.log("Menú móvil abierto.");
        });

        closeMobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0'); // Oculta el menú
            mobileMenu.classList.add('-translate-x-full');
            document.body.style.overflow = ''; // Restaura el scroll del cuerpo
            console.log("Menú móvil cerrado.");
        });

        // Cerrar menú móvil cuando se hace clic en un enlace (para scroll suave)
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('translate-x-0');
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
                console.log("Link de menú móvil clicado, cerrando menú.");
            });
        });
    } else {
        console.warn("Elementos del menú móvil no encontrados. Verifica los IDs en index.html.");
    }


    // --- Event listeners para la navegación con scroll suave (tanto escritorio como móvil) ---
    document.querySelectorAll('nav a[href^="#"], .mobile-nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previene el comportamiento por defecto del enlace

            const targetId = this.getAttribute('href');
            if (targetId === '#') { // Maneja enlaces sin ID específico (como los de Carrito)
                return;
            }
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                console.log(`Scroll suave a la sección: ${targetId}`);
            } else {
                console.warn(`Elemento con ID '${targetId.substring(1)}' no encontrado para scroll.`);
            }
        });
    });


    // --- Event listener para los botones de carrito en la navegación (escritorio y móvil) ---
    if (navCartButtonDesktop) {
        navCartButtonDesktop.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el comportamiento por defecto del enlace
            cartModal.style.display = 'flex';
            console.log("Modal del carrito abierto desde nav (escritorio).");
        });
    }

    if (navCartButtonMobile) {
        navCartButtonMobile.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el comportamiento por defecto del enlace
            cartModal.style.display = 'flex';
            // Cierra el menú móvil si se abre el carrito desde allí
            if (mobileMenu) {
                mobileMenu.classList.remove('translate-x-0');
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
            console.log("Modal del carrito abierto desde nav (móvil).");
        });
    }


    // --- Event listeners para el carrusel ---
    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', prevCarousel);
    }
    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', nextCarousel);
    }

    // Ajustar carrusel al redimensionar la ventana para asegurar el cálculo correcto del ancho
    window.addEventListener('resize', () => {
        updateCarousel();
        console.log("Ventana redimensionada, carrusel ajustado.");
    });

    // --- Event listener para el botón de Finalizar Compra (WhatsApp) ---
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', sendOrderViaWhatsApp);
        console.log("Event listener para Finalizar Compra (WhatsApp) añadido.");
    } else {
        console.error("Botón 'Finalizar Compra' no encontrado en el DOM.");
    }
});