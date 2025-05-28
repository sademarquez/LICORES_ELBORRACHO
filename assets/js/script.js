// ==============================================
// 1. SELECTORES DE ELEMENTOS HTML
// ==============================================
const productosContainer = document.getElementById('productos-container');
const cartButton = document.getElementById('cart-button'); // Botón flotante del carrito
const navCartButton = document.getElementById('nav-cart-button'); // Botón de carrito en la navegación (si existe)
const cartModal = document.getElementById('cart-modal');
const closeCartModalBtn = document.getElementById('close-cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const carouselTrack = document.getElementById('carousel-track');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const finalizePurchaseBtn = document.getElementById('finalize-purchase-btn'); // Nuevo: Botón para finalizar compra/WhatsApp

// ==============================================
// 2. VARIABLES GLOBALES Y ESTADO
// ==============================================
let productsData = []; // Almacenará todos los productos cargados
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carga el carrito desde localStorage
let carouselIndex = 0; // Índice actual del carrusel

// ==============================================
// 3. FUNCIONES DE CARGA Y RENDERIZADO
// ==============================================

/**
 * Carga los productos desde products.json
 */
async function loadProducts() {
    try {
        // ESTA ES LA LÍNEA QUE DEBES REVISAR CON MUCHO CUIDADO:
        // Asegúrate de que tu products.json esté en la carpeta 'assets/data'
        // y que Netlify esté sirviendo tu sitio desde la raíz donde está 'assets'.
        const response = await fetch('/assets/data/products.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        productsData = await response.json();
        console.log("Productos cargados:", productsData);

        renderProducts(productsData); // Renderiza todos los productos
        // FILTRO DE DESTACADOS: Asegúrate de que el campo 'destacado' exista en tu products.json
        renderFeaturedProducts(productsData.filter(p => p.destacado === true)); // Renderiza productos destacados para el carrusel
        updateCarousel(); // Inicializa la posición del carrusel
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        productosContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar productos. Intenta de nuevo más tarde.</p>';
        carouselTrack.innerHTML = '<p class="text-red-500 text-center w-full">Error al cargar productos destacados.</p>';
    }
}

/**
 * Renderiza los productos en el contenedor principal del catálogo.
 * @param {Array} products - Lista de productos a renderizar.
 */
function renderProducts(products) {
    productosContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar
    if (products.length === 0) {
        productosContainer.innerHTML = '<p class="text-gray-400 text-center col-span-full">No hay productos disponibles.</p>';
        return;
    }
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bg-slate-800/80 panel-glass rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-contain mb-4">
            <h3 class="text-2xl font-bold text-yellow-400 mb-2">${product.nombre}</h3>
            <p class="text-gray-300 text-sm mb-2">${product.descripcion}</p>
            <p class="text-gray-400 text-xs mb-4">Volumen: ${product.volumen} | Categoría: ${product.categoria}</p>
            <p class="text-3xl font-extrabold text-white mb-4">$${product.precio.toLocaleString('es-CO')}</p>
            <button data-id="${product.id}" 
                    class="add-to-cart-btn w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-md transition duration-300 
                           ${product.disponible ? '' : 'opacity-50 cursor-not-allowed'}"
                    ${product.disponible ? '' : 'disabled'}>
                ${product.disponible ? 'Agregar al Carrito' : 'Agotado'}
            </button>
        `;
        productosContainer.appendChild(productCard);
    });

    // Añadir event listeners después de que las tarjetas de productos se han creado
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // CORRECCIÓN CRÍTICA: No usar parseInt, ya que los IDs son strings (ej. "licor-001")
            const productId = event.target.dataset.id; 
            addToCart(productId);
        });
    });
    console.log("Productos del catálogo renderizados.");
}

/**
 * Renderiza los productos destacados en el carrusel.
 * @param {Array} featuredProducts - Lista de productos destacados a renderizar.
 */
function renderFeaturedProducts(featuredProducts) {
    carouselTrack.innerHTML = ''; // Limpiar el contenedor
    if (featuredProducts.length === 0) {
        carouselTrack.innerHTML = '<p class="text-gray-400 text-center w-full">No hay productos destacados disponibles.</p>';
        carouselPrevBtn.classList.add('carousel-nav-hidden');
        carouselNextBtn.classList.add('carousel-nav-hidden');
        return;
    } else {
        carouselPrevBtn.classList.remove('carousel-nav-hidden');
        carouselNextBtn.classList.remove('carousel-nav-hidden');
    }

    featuredProducts.forEach(product => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item bg-slate-800/80 panel-glass rounded-lg shadow-lg flex-none p-6 flex flex-col items-center text-center';
        carouselItem.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-40 object-contain mb-4">
            <h3 class="text-xl font-bold text-yellow-400 mb-1">${product.nombre}</h3>
            <p class="text-gray-300 text-sm mb-2">${product.descripcion.substring(0, 70)}...</p>
            <p class="text-2xl font-extrabold text-white mb-4">$${product.precio.toLocaleString('es-CO')}</p>
            <button data-id="${product.id}" 
                    class="add-to-cart-btn w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-md transition duration-300 
                           ${product.disponible ? '' : 'opacity-50 cursor-not-allowed'}"
                    ${product.disponible ? '' : 'disabled'}>
                ${product.disponible ? 'Agregar al Carrito' : 'Agotado'}
            </button>
        `;
        carouselTrack.appendChild(carouselItem);
    });

    // Añadir event listeners para los botones del carrusel también
    carouselTrack.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // CORRECCIÓN CRÍTICA: No usar parseInt, ya que los IDs son strings
            const productId = event.target.dataset.id;
            addToCart(productId);
        });
    });
    console.log("Productos destacados renderizados.");
}

/**
 * Actualiza la posición del carrusel.
 */
function updateCarousel() {
    if (!carouselTrack || carouselTrack.children.length === 0) {
        console.warn("Carousel track not found or has no children. Cannot update carousel.");
        return;
    }

    const itemWidth = carouselTrack.children[0].offsetWidth + 32; // Ancho del item + gap (2rem = 32px)
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;

    // Ocultar/mostrar botones de navegación
    carouselPrevBtn.style.display = carouselIndex === 0 ? 'none' : 'block';
    // Muestra el siguiente botón si hay más elementos ocultos a la derecha
    // Calcula cuántos items caben en la vista actual
    const visibleWidth = carouselTrack.offsetWidth;
    const totalContentWidth = carouselTrack.scrollWidth;

    // Si el contenido total es mayor que el visible y no estamos al final
    if (totalContentWidth > visibleWidth) {
        // Calcular el número de items visibles
        const itemsPerView = Math.floor(visibleWidth / itemWidth);
        // Si el índice actual más los items visibles es menor que el total de items
        carouselNextBtn.style.display = (carouselIndex + itemsPerView) < carouselTrack.children.length ? 'block' : 'none';
    } else {
        carouselNextBtn.style.display = 'none'; // No hay scroll posible si el contenido es menor o igual al visible
    }

    console.log(`Carrusel actualizado. Índice: ${carouselIndex}, Ancho de Item: ${itemWidth}`);
}

/**
 * Navega el carrusel al elemento anterior.
 */
function prevCarousel() {
    if (carouselIndex > 0) {
        carouselIndex--;
        updateCarousel();
    }
}

/**
 * Navega el carrusel al elemento siguiente.
 */
function nextCarousel() {
    if (carouselTrack && carouselTrack.children.length > 0) {
        const itemsPerView = Math.floor(carouselTrack.offsetWidth / (carouselTrack.children[0].offsetWidth + 32)); // Recalcula items por vista
        if (carouselIndex < carouselTrack.children.length - itemsPerView) {
            carouselIndex++;
            updateCarousel();
        } else {
            // Opcional: Volver al inicio si se llega al final
            // carouselIndex = 0;
            // updateCarousel();
        }
    }
}


// ==============================================
// 4. FUNCIONALIDAD DEL CARRITO
// ==============================================

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {string} productId - El ID del producto a añadir.
 */
function addToCart(productId) {
    const productToAdd = productsData.find(p => p.id === productId);
    if (!productToAdd) {
        console.error("Producto no encontrado:", productId);
        alert('Error: Producto no encontrado.');
        return;
    }

    if (!productToAdd.disponible) {
        alert('Lo sentimos, este producto está agotado.');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
        console.log(`Cantidad de ${productToAdd.nombre} incrementada. Nuevo: ${existingItem.quantity}`);
    } else {
        cart.push({ ...productToAdd, quantity: 1 });
        console.log(`${productToAdd.nombre} añadido al carrito.`);
    }

    saveCart();
    updateCartDisplay();
    // SUGERENCIA: Considera usar un Toast/Snackbar en lugar de alert() para mejor UX.
    // alert(`${productToAdd.nombre} ha sido añadido al carrito.`);
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Carrito guardado en localStorage.");
}

/**
 * Actualiza la visualización del carrito en el modal y el contador del botón flotante.
 */
function updateCartDisplay() {
    cartItemsContainer.innerHTML = ''; // Limpiar el contenido actual del carrito
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center bg-slate-700/50 p-3 rounded-md mb-2';
            itemElement.innerHTML = `
                <span>${item.nombre} x ${item.quantity}</span>
                <span>$${(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                <div class="flex space-x-2">
                    <button data-id="${item.id}" class="remove-one-from-cart-btn text-yellow-400 hover:text-yellow-500 font-bold px-2 py-1 rounded">-</button>
                    <button data-id="${item.id}" class="remove-from-cart-btn text-red-400 hover:text-red-500 font-bold px-2 py-1 rounded">Remover</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.precio * item.quantity;
            itemCount += item.quantity;
        });
    }

    cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    cartCountElement.textContent = itemCount.toString();

    // Añadir event listeners a los botones de remover del carrito
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.remove-one-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            removeOneFromCart(productId);
        });
    });

    console.log("Visualización del carrito actualizada.");
}

/**
 * Elimina un producto completamente del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
function removeFromCart(productId) {
    const initialCartLength = cart.length;
    cart = cart.filter(item => item.id !== productId);
    if (cart.length < initialCartLength) {
        console.log(`Producto con ID ${productId} eliminado completamente del carrito.`);
    } else {
        console.warn(`Intento de eliminar producto con ID ${productId} que no se encontró en el carrito.`);
    }
    saveCart();
    updateCartDisplay();
}

/**
 * Reduce la cantidad de un producto en el carrito, o lo elimina si la cantidad llega a 0.
 * @param {string} productId - El ID del producto a reducir.
 */
function removeOneFromCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity--;
        if (existingItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
            console.log(`Producto con ID ${productId} eliminado del carrito al llegar a 0 unidades.`);
        } else {
            console.log(`Cantidad de ${existingItem.nombre} reducida a ${existingItem.quantity}.`);
        }
    } else {
        console.warn(`Intento de reducir cantidad de producto con ID ${productId} que no se encontró en el carrito.`);
    }
    saveCart();
    updateCartDisplay();
}

// ==============================================
// 5. FUNCIONALIDAD DE WHATSAPP
// ==============================================

/**
 * Genera el mensaje de WhatsApp con el resumen del pedido.
 */
function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
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

    const phoneNumber = "573101234567"; // Reemplaza con el número de teléfono de WhatsApp (incluyendo código de país)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    console.log("Pedido enviado a WhatsApp.");
    
    // Opcional: Limpiar el carrito después de enviar el pedido
    // cart = [];
    // saveCart();
    // updateCartDisplay();
    // closeCartModal(); // Cierra el modal del carrito
}

// ==============================================
// 6. INICIALIZACIÓN DE LA APLICACIÓN
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); // Cargar productos al iniciar la página
    updateCartDisplay(); // Actualizar la visualización del carrito al cargar

    // --- Event listeners para el modal del carrito ---
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'flex'; // Mostrar el modal
        console.log("Modal del carrito abierto.");
    });

    if (navCartButton) { // Solo si el botón de carrito en la nav existe
        navCartButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir el salto si el href es "#"
            cartModal.style.display = 'flex'; // Mostrar el modal
            console.log("Modal del carrito (nav) abierto.");
        });
    }

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none'; // Ocultar el modal
        console.log("Modal del carrito cerrado.");
    });

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
            console.log("Modal del carrito cerrado haciendo clic fuera.");
        }
    });

    // --- Event listeners para la navegación con scroll suave ---
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previene el comportamiento por defecto del enlace

            const targetId = this.getAttribute('href');
            if (targetId === '#') { // Maneja enlaces sin ID específico (como el de Carrito en nav)
                return; 
            }
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Utiliza scrollIntoView para un desplazamiento suave
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                console.log(`Scroll suave a la sección: ${targetId}`);
            } else {
                console.warn(`Elemento con ID '${targetId.substring(1)}' no encontrado para scroll.`);
            }
        });
    });

    // --- Event listeners para el carrusel ---
    carouselPrevBtn.addEventListener('click', prevCarousel);
    carouselNextBtn.addEventListener('click', nextCarousel);

    // Ajustar carrusel al redimensionar la ventana para asegurar el cálculo correcto del ancho
    window.addEventListener('resize', () => {
        updateCarousel();
        console.log("Ventana redimensionada, carrusel ajustado.");
    });

    // --- Event listener para el botón de Finalizar Compra (WhatsApp) ---
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', sendOrderViaWhatsApp);
        console.log("Event listener para Finalizar Compra (WhatsApp) añadido.");
    }
});