// ===============================================
// 1. SELECTORES DE ELEMENTOS HTML (Inicialmente declarados, se asignarán dentro de DOMContentLoaded)
// ===============================================
let productosContainer; // Contenedor para el catálogo general
let noProductsFoundMessage; // Mensaje para cuando no hay resultados de búsqueda
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
let cartCountElement; // Para el botón flotante del carrito
let cartCountDesktopElement; // Para el contador en la navegación de escritorio
let cartCountMobileElement; // Para el contador en la navegación móvil
let carouselTrack; // El contenedor de los ítems del carrusel de destacados
let carouselPrevBtn;
let carouselNextBtn;
let finalizePurchaseBtn;
let destacadosSection; // La sección completa de destacados
let mobileNavLinks;

// SELECTORES PARA EL BUSCADOR
let productSearchInputDesktop;
let productSearchInputMobile;
let searchButtonDesktop;
let searchButtonMobile;

// ===============================================
// 2. VARIABLES GLOBALES
// ===============================================
let products = []; // Almacena todos los productos cargados desde products.json
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carga el carrito desde localStorage
let carouselIndex = 0;
let itemWidth = 0; // Ancho de cada ítem del carrusel, se calculará dinámicamente
let autoScrollInterval;
const AUTO_SCROLL_INTERVAL_TIME = 5000; // 5 segundos
const WHATSAPP_PHONE_NUMBER = '573174144815'; // ¡IMPORTANTE! Reemplaza con tu número de WhatsApp real (código de país + número, ej: 573218765432)


// ===============================================
// 3. EVENTOS DE DOMContentLoaded
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // Asignación de selectores
    productosContainer = document.getElementById('productos-container');
    noProductsFoundMessage = document.getElementById('no-products-found');
    cartButton = document.getElementById('cart-button');
    hamburgerMenuBtn = document.getElementById('hamburger-menu-btn');
    mobileMenu = document.getElementById('mobile-menu');
    closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    navCartButtonDesktop = document.getElementById('nav-cart-button-desktop');
    navCartButtonMobile = document.getElementById('nav-cart-button-mobile');
    cartModal = document.getElementById('cart-modal');
    closeCartModalBtn = document.getElementById('close-cart-modal');
    cartItemsContainer = document.getElementById('cart-items');
    cartTotalElement = document.getElementById('cart-total');
    cartCountElement = document.getElementById('cart-count');
    cartCountDesktopElement = document.getElementById('cart-count-desktop');
    cartCountMobileElement = document.getElementById('cart-count-mobile');
    
    // El contenedor de productos destacados es el track del carrusel
    carouselTrack = document.getElementById('destacados-productos-track');
    destacadosSection = document.getElementById('destacados'); // La sección completa

    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');
    mobileNavLinks = document.querySelectorAll('#mobile-menu a');

    productSearchInputDesktop = document.getElementById('product-search-desktop');
    productSearchInputMobile = document.getElementById('product-search-mobile');
    searchButtonDesktop = document.getElementById('search-button-desktop');
    searchButtonMobile = document.getElementById('search-button-mobile');


    // ===============================================
    // 4. LISTENERS DE EVENTOS
    // ===============================================

    // Menú móvil
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('-translate-x-full');
                document.body.style.overflow = 'hidden'; // Evita scroll en el body
            }
        });
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = ''; // Restaura scroll en el body
            }
        });
    }

    // Cerrar menú móvil al hacer clic en un enlace de navegación
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    });

    // Carrito flotante
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            if (cartModal) {
                cartModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Botones de carrito en la navegación
    if (navCartButtonDesktop) {
        navCartButtonDesktop.addEventListener('click', () => {
            if (cartModal) {
                cartModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    if (navCartButtonMobile) {
        navCartButtonMobile.addEventListener('click', () => {
            if (cartModal) {
                cartModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            // También cierra el menú móvil si está abierto
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    }

    // Cerrar modal de carrito
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => {
            if (cartModal) {
                cartModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // Navegación del carrusel
    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', prevCarouselItem);
    }
    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', nextCarouselItem);
    }

    // Finalizar compra: Redirección a WhatsApp
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                sendOrderViaWhatsApp(); // Llama a la nueva función
                // Opcional: Vaciar carrito y cerrar modal después de enviar el pedido
                cart = []; 
                localStorage.removeItem('cart');
                displayCart();
                updateCartCount();
                if (cartModal) {
                    cartModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            } else {
                showNotification('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
            }
        });
    }

    // Funcionalidad de búsqueda
    // Usar 'input' para filtrar mientras se escribe, y 'change' para asegurar al salir del input (aunque 'input' es más reactivo)
    if (productSearchInputDesktop) {
        productSearchInputDesktop.addEventListener('input', filterProducts);
    }
    if (productSearchInputMobile) {
        productSearchInputMobile.addEventListener('input', filterProducts);
    }

    if (searchButtonDesktop) {
        searchButtonDesktop.addEventListener('click', () => {
            if (productSearchInputDesktop) {
                productSearchInputDesktop.focus();
                filterProducts(); // Ejecutar filtro al hacer clic en el botón de búsqueda
            }
        });
    }
    if (searchButtonMobile) {
        searchButtonMobile.addEventListener('click', () => {
            if (productSearchInputMobile) {
                productSearchInputMobile.focus();
                filterProducts(); // Ejecutar filtro al hacer clic en el botón de búsqueda
            }
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    }

    // Animaciones al hacer scroll
    window.addEventListener('scroll', animateElements);
    animateElements(); // Ejecutar una vez al cargar para animar elementos visibles desde el principio

    // Listener para recalcular el tamaño del ítem del carrusel al redimensionar la ventana
    window.addEventListener('resize', () => {
        // Detener auto-scroll para evitar saltos durante el redimensionamiento
        stopAutoScroll();
        // Re-inicializar el carrusel para recalcular anchos y clones
        initCarousel(); 
        // Forzar un reflow para que la transición se aplique en el siguiente movimiento
        void carouselTrack.offsetWidth;
        // Reiniciar auto-scroll
        startAutoScroll();
    });

    // Cargar productos, mostrar destacados e inicializar carrusel.
    // También mostrar el catálogo completo inicialmente.
    loadProducts(); 
    displayCart();
    updateCartCount();
});

// ===============================================
// 5. FUNCIONES DE CARGA Y RENDERIZADO DE PRODUCTOS
// ===============================================

async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json'); // Ruta corregida
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        console.log("Productos cargados:", products);
        displayFeaturedProducts(products); // Muestra solo los destacados en el carrusel
        initCarousel(); // Inicializar el carrusel después de cargar los productos y renderizar
        displayAllProducts(); // Muestra el catálogo completo por defecto
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        if (destacadosSection) { 
            destacadosSection.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar los productos destacados. Por favor, intente de nuevo más tarde.</p>';
        }
        if (productosContainer) {
            productosContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar el catálogo de productos. Por favor, intente de nuevo más tarde.</p>';
        }
    }
}

function displayFeaturedProducts(productsToDisplay) {
    if (!carouselTrack) {
        console.error("El contenedor de productos destacados (carousel-track) no se encontró en el DOM.");
        return;
    }
    // No limpiar aquí, ya que initCarousel maneja los clones.
    // Simplemente asegúrate de que initCarousel se llame después de añadir los originales
    const featured = productsToDisplay.filter(product => product.destacado);
    
    // Limpiar solo los productos no-clonados antes de re-añadir
    Array.from(carouselTrack.children).filter(child => !child.classList.contains('cloned')).forEach(child => child.remove());

    featured.forEach(product => {
        const productCard = createProductCard(product);
        // Para que initCarousel pueda clonar, debemos añadir los originales primero
        carouselTrack.appendChild(productCard);
    });
}

function displayAllProducts() {
    if (!productosContainer) {
        console.error("El contenedor del catálogo (#productos-container) no se encontró en el DOM.");
        return;
    }
    productosContainer.innerHTML = ''; // Limpiar antes de añadir
    noProductsFoundMessage.classList.add('hidden'); // Ocultar mensaje de no encontrados

    if (products.length === 0) {
        productosContainer.innerHTML = '<p class="text-slate-400 text-center col-span-full py-8">No hay productos disponibles en el catálogo.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = createProductCard(product);
        productosContainer.appendChild(productCard);
    });
}


function createProductCard(product) {
    const productCard = document.createElement('div');
    // Clases para responsividad: 1 columna, 2 en sm, 3 en md, 4 en lg
    productCard.className = 'flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 box-border animate-fade-in-up'; 
    
    productCard.innerHTML = `
        <div class="bg-slate-800 rounded-lg shadow-lg flex flex-col items-center text-center panel-glass h-full transform transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl">
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-t-lg mb-4 lazyload" loading="lazy">
            <div class="p-4 flex flex-col justify-between flex-grow">
                <div>
                    <h3 class="text-xl font-bold text-yellow-400 mb-2">${product.nombre}</h3>
                    <p class="text-sm text-slate-300 mb-2">${product.descripcion}</p>
                    <p class="text-lg font-semibold text-white mb-4">$${product.precio.toLocaleString('es-CO')}</p>
                </div>
                <button class="add-to-cart-btn bg-yellow-500 text-slate-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition-colors duration-200 transform hover:scale-105 shadow-md" data-product-id="${product.id}">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;

    // Añadir listener para el botón "Agregar al carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            addToCart(productId);
        });
    }
    return productCard;
}

// ===============================================
// 6. FUNCIONES DE CARRITO
// ===============================================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        displayCart();
        updateCartCount();
        showNotification('Producto agregado al carrito', 'success'); // Notificación
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
    updateCartCount();
    showNotification('Producto eliminado del carrito', 'info'); // Notificación
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            removeFromCart(productId); // Si la cantidad es 0 o menos, eliminar
        }
    }
    saveCart();
    displayCart();
    updateCartCount();
}

function displayCart() {
    if (!cartItemsContainer) {
        console.error("El contenedor de ítems del carrito no se encontró.");
        return;
    }
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-slate-400 text-center py-4">Tu carrito está vacío.</p>';
        if (finalizePurchaseBtn) finalizePurchaseBtn.disabled = true; // Deshabilita el botón si el carrito está vacío
    } else {
        if (finalizePurchaseBtn) finalizePurchaseBtn.disabled = false; // Habilita el botón si hay productos
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between bg-slate-700/50 p-3 rounded-lg mb-2 shadow-sm'; // Agregado shadow-sm
            itemElement.innerHTML = `
                <div class="flex items-center flex-grow">
                    <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-md mr-4 border border-slate-600"> <div>
                        <h4 class="text-lg font-semibold text-yellow-400">${item.nombre}</h4>
                        <p class="text-slate-300 text-sm">$${item.precio.toLocaleString('es-CO')}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <button class="quantity-btn bg-slate-600 text-white px-2 py-1 rounded-l transition-colors hover:bg-slate-500" data-id="${item.id}" data-action="decrease" aria-label="Disminuir cantidad de ${item.nombre}">-</button>
                    <span class="bg-slate-500 text-white px-3 py-1 font-medium">${item.quantity}</span>
                    <button class="quantity-btn bg-slate-600 text-white px-2 py-1 rounded-r transition-colors hover:bg-slate-500" data-id="${item.id}" data-action="increase" aria-label="Aumentar cantidad de ${item.nombre}">+</button>
                    <button class="remove-from-cart-btn bg-red-600 hover:bg-red-700 text-white p-2 rounded-full ml-3 transition-colors duration-200 transform hover:scale-110" data-id="${item.id}" aria-label="Eliminar ${item.nombre} del carrito">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.precio * item.quantity;
        });

        // Añadir listeners para botones de cantidad y remover
        cartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const action = e.currentTarget.dataset.action;
                const item = cart.find(i => i.id === id);
                if (item) {
                    let newQuantity = item.quantity;
                    if (action === 'increase') {
                        newQuantity++;
                    } else if (action === 'decrease') {
                        newQuantity--;
                    }
                    updateQuantity(id, newQuantity);
                }
            });
        });

        cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                removeFromCart(id);
            });
        });
    }

    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }
}


function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems.toString();
    if (cartCountDesktopElement) cartCountDesktopElement.textContent = totalItems.toString();
    if (cartCountMobileElement) cartCountMobileElement.textContent = totalItems.toString();
}

// ===============================================
// 7. FUNCIONES DEL CARRUSEL
// ===============================================

function initCarousel() {
    if (!carouselTrack) {
        console.error("El carrusel-track (#destacados-productos-track) no se encontró en el DOM.");
        return;
    }

    // Remover todos los clones existentes para re-inicializar el carrusel limpio
    Array.from(carouselTrack.children).filter(child => child.classList.contains('cloned')).forEach(child => child.remove());

    const originalItems = Array.from(carouselTrack.children);
    const totalOriginalItems = originalItems.length;

    if (totalOriginalItems === 0) {
        console.warn("No hay productos destacados para inicializar el carrusel.");
        return;
    }

    // Determinar cuántos ítems son visibles a la vez para calcular el número de clones y el ancho del ítem
    let itemsVisible;
    if (window.innerWidth >= 1024) { // lg breakpoint
        itemsVisible = 4;
    } else if (window.innerWidth >= 768) { // md breakpoint
        itemsVisible = 3;
    } else if (window.innerWidth >= 640) { // sm breakpoint
        itemsVisible = 2; // Dos productos por fila en móviles y tablets pequeñas
    } else {
        itemsVisible = 1; // Un producto por fila en pantallas muy pequeñas
    }
    
    // Asegurarse de tener al menos 1 ítem visible para evitar división por cero
    if (itemsVisible === 0) itemsVisible = 1; 

    // Calcular el número de clones necesarios para un bucle continuo
    // Necesitamos clonar suficientes elementos para que el salto no sea visible
    // Esto es CLONE_COUNT = itemsVisible
    const CLONE_COUNT = itemsVisible; 

    // Recalcular el ancho del ítem dinámicamente
    const containerWidth = carouselTrack.parentElement.offsetWidth;
    itemWidth = containerWidth / itemsVisible;
    
    // Aplicar el ancho calculado a cada ítem del carrusel (originales y futuros clones)
    Array.from(carouselTrack.children).forEach(child => {
        child.style.width = `${itemWidth}px`;
    });

    // Clonar los últimos CLONE_COUNT elementos y añadirlos al principio (prepend)
    for (let i = 0; i < CLONE_COUNT; i++) {
        const clonedItem = originalItems[totalOriginalItems - 1 - i].cloneNode(true);
        clonedItem.classList.add('cloned'); // Marcar como clonado
        carouselTrack.prepend(clonedItem);
    }

    // Clonar los primeros CLONE_COUNT elementos y añadirlos al final (append)
    for (let i = 0; i < CLONE_COUNT; i++) {
        const clonedItem = originalItems[i].cloneNode(true);
        clonedItem.classList.add('cloned'); // Marcar como clonado
        carouselTrack.appendChild(clonedItem);
    }

    // Re-añadir listeners a los botones de "Agregar al carrito" en los clones
    carouselTrack.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Remover listeners previos para evitar duplicados si se re-inicializa
        const oldClickHandler = button._clickHandler; // Usar una propiedad para guardar la referencia
        if (oldClickHandler) {
            button.removeEventListener('click', oldClickHandler);
        }
        const newClickHandler = (e) => {
            const productId = e.currentTarget.dataset.productId;
            addToCart(productId);
        };
        button.addEventListener('click', newClickHandler);
        button._clickHandler = newClickHandler; // Guardar la referencia
    });


    // Ajustar la posición inicial para mostrar los elementos originales
    carouselIndex = CLONE_COUNT; // Empezar en el primer elemento "real" después de los clones
    carouselTrack.style.transition = 'none'; // Desactivar transición para el salto inicial
    carouselTrack.style.transform = `translateX(${-carouselIndex * itemWidth}px)`;
    void carouselTrack.offsetWidth; // Forzar reflow para aplicar el estilo inmediatamente
    carouselTrack.style.transition = 'transform 0.5s ease-in-out'; // Reactivar transición

    startAutoScroll(); // Iniciar el auto-scroll
}


function updateCarousel() {
    if (!carouselTrack || itemWidth === 0) return;

    // Recalcular itemWidth por si el tamaño de pantalla ha cambiado (aunque resize event lo debería manejar)
    const containerWidth = carouselTrack.parentElement.offsetWidth;
    let itemsVisible;
    if (window.innerWidth >= 1024) { itemsVisible = 4; } 
    else if (window.innerWidth >= 768) { itemsVisible = 3; } 
    else if (window.innerWidth >= 640) { itemsVisible = 2; } 
    else { itemsVisible = 1; }

    const newCalculatedItemWidth = containerWidth / itemsVisible;
    // Si el ancho calculado ha cambiado significativamente, forzar un re-init para recalcular clones si es necesario
    if (Math.abs(newCalculatedItemWidth - itemWidth) > 1) { // Pequeña tolerancia
        initCarousel();
        return; // Detener esta ejecución para que initCarousel se encargue
    }

    const offset = -carouselIndex * itemWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;

    const totalLogicalItems = products.filter(p => p.destacado).length;
    const totalCarouselItems = carouselTrack.children.length;
    const CLONE_COUNT = itemsVisible; // Usar el número de items visibles como CLONE_COUNT

    // Lógica para el bucle infinito (sin transiciones en el salto)
    // Usar setTimeout para permitir que la transición actual termine
    if (carouselIndex >= totalLogicalItems + CLONE_COUNT) { // Si llegamos al final de los originales + clones al final
        setTimeout(() => {
            carouselTrack.style.transition = 'none';
            carouselIndex = CLONE_COUNT; // Volver al inicio de los originales
            carouselTrack.style.transform = `translateX(${-carouselIndex * itemWidth}px)`;
            void carouselTrack.offsetWidth; // Forzar reflow
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
        }, 500); // Duración de la transición
    } else if (carouselIndex < CLONE_COUNT) { // Si llegamos al principio de los originales - clones al inicio
        setTimeout(() => {
            carouselTrack.style.transition = 'none';
            carouselIndex = totalLogicalItems + CLONE_COUNT - 1; // Volver al final de los originales (el último clon antes del bucle)
            carouselTrack.style.transform = `translateX(${-carouselIndex * itemWidth}px)`;
            void carouselTrack.offsetWidth; // Forzar reflow
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
        }, 500); // Duración de la transición
    }
}


function nextCarouselItem() {
    stopAutoScroll(); // Detener para navegación manual
    carouselIndex++;
    updateCarousel();
    startAutoScroll(); // Reiniciar auto-scroll
}

function prevCarouselItem() {
    stopAutoScroll(); // Detener para navegación manual
    carouselIndex--;
    updateCarousel();
    startAutoScroll(); // Reiniciar auto-scroll
}

function startAutoScroll() {
    stopAutoScroll(); // Asegurarse de que no haya múltiples intervalos
    autoScrollInterval = setInterval(() => {
        carouselIndex++; // Incrementar índice para mover al siguiente
        updateCarousel();
    }, AUTO_SCROLL_INTERVAL_TIME);
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}


// ===============================================
// 8. FUNCIONES DE BÚSQUEDA
// ===============================================

function filterProducts() {
    const searchTermDesktop = productSearchInputDesktop ? productSearchInputDesktop.value.toLowerCase() : '';
    const searchTermMobile = productSearchInputMobile ? productSearchInputMobile.value.toLowerCase() : '';
    const searchTerm = searchTermDesktop || searchTermMobile; // Usar el término de búsqueda activo

    if (!productosContainer || !destacadosSection || !noProductsFoundMessage) {
        console.error("Elementos de contenedor de productos o destacados no encontrados.");
        return;
    }

    if (searchTerm.length > 0) {
        const filtered = products.filter(product =>
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.descripcion.toLowerCase().includes(searchTerm) ||
            product.categoria.toLowerCase().includes(searchTerm)
        );
        
        productosContainer.innerHTML = ''; // Limpiar el contenedor del catálogo
        if (filtered.length > 0) {
             filtered.forEach(product => {
                const productCard = createProductCard(product); // Reutiliza la función para crear tarjetas
                productosContainer.appendChild(productCard);
            });
            noProductsFoundMessage.classList.add('hidden'); // Ocultar mensaje si hay resultados
        } else {
            productosContainer.innerHTML = ''; // Asegurar que esté vacío si no hay resultados
            noProductsFoundMessage.classList.remove('hidden'); // Mostrar mensaje de no encontrados
        }
        
        destacadosSection.style.display = 'none'; // Ocultar la sección de destacados
        stopAutoScroll(); // Detener el carrusel
        // Opcional: Desplazar al catálogo si la búsqueda se inicia desde la navegación
        // window.location.href = '#catalogo';

    } else {
        // Si el término de búsqueda está vacío, volver a mostrar el catálogo completo y destacados
        destacadosSection.style.display = 'block'; // Mostrar la sección de destacados
        displayFeaturedProducts(products); // Recargar destacados
        initCarousel(); // Re-inicializar el carrusel
        displayAllProducts(); // Mostrar todos los productos en el catálogo general
        noProductsFoundMessage.classList.add('hidden'); // Ocultar mensaje de no encontrados
    }
}


// ===============================================
// 9. ANIMACIONES AL SCROLL
// ===============================================

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

// ===============================================
// 10. NOTIFICACIONES
// ===============================================
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.warn('Contenedor de notificaciones no encontrado. Crea un div con id="notification-container".');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `p-3 rounded-lg shadow-md mb-3 flex items-center justify-between text-white animate-fade-in-up notification-${type}`;
    
    // Clases de Tailwind según el tipo
    let bgColorClass = 'bg-gray-700';
    if (type === 'success') bgColorClass = 'bg-green-600';
    else if (type === 'error') bgColorClass = 'bg-red-600';
    else if (type === 'warning') bgColorClass = 'bg-orange-500';
    else if (type === 'info') bgColorClass = 'bg-blue-600'; // Añadido para info

    notification.classList.add(bgColorClass);

    notification.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentNode.remove()" aria-label="Cerrar notificación">
            &times;
        </button>
    `;

    notificationContainer.prepend(notification); // Añadir al principio para que los nuevos aparezcan arriba

    setTimeout(() => {
        notification.remove();
    }, 3000); // La notificación desaparece después de 3 segundos
}

// ===============================================
// 11. INTEGRACIÓN CON WHATSAPP
// ===============================================
function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío. Agrega productos para realizar un pedido.', 'warning');
        return;
    }

    let message = "¡Hola! Me gustaría hacer un pedido desde Licores El Borracho:\n\n";
    let totalOrderPrice = 0;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.nombre} (x${item.quantity}) - $${(item.precio * item.quantity).toLocaleString('es-CO')}\n`;
        totalOrderPrice += item.precio * item.quantity;
    });

    message += `\nTotal a pagar: *$${totalOrderPrice.toLocaleString('es-CO')}*\n`;
    message += `\nPor favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);

    // Construir la URL de WhatsApp
    const whatsappURL = `https://wa.me/${573174144815}?text=${encodedMessage}`;

    // Redirigir al usuario a WhatsApp
    window.open(whatsappURL, '_blank');

    showNotification('Redirigiendo a WhatsApp con tu pedido...', 'info');
}