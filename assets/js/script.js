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
let cartCountElement; // Para el botón flotante del carrito
let cartCountDesktopElement; // Para el contador en la navegación de escritorio
let cartCountMobileElement; // Para el contador en la navegación móvil
let carouselTrack;
let carouselPrevBtn;
let carouselNextBtn;
let finalizePurchaseBtn;
let destacadosSection;
let mobileNavLinks;

// SELECTORES PARA EL BUSCADOR
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

// Carga los productos desde products.json
const loadProducts = async () => {
    try {
        const response = await fetch('assets/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        renderProducts(products); // Renderiza todos los productos inicialmente
        renderFeaturedProducts(products); // Renderiza los productos destacados en el carrusel
        updateCartCount(); // Actualiza el contador del carrito al cargar la página
        calculateItemWidth(); // Calcular el ancho del ítem después de renderizar el carrusel
        startAutoScroll(); // Iniciar el auto-scroll del carrusel
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        if (productosContainer) {
            productosContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar los productos. Por favor, intente más tarde.</p>';
        }
    }
};

// Renderiza los productos en el contenedor principal (catálogo)
const renderProducts = (productsToRender) => {
    if (!productosContainer) {
        console.error('El contenedor de productos (productosContainer) no ha sido encontrado.');
        return;
    }
    productosContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar
    if (productsToRender.length === 0) {
        productosContainer.innerHTML = '<p class="text-gray-400 text-center col-span-full">No se encontraron productos.</p>';
        return;
    }
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-slate-800/80 panel-glass rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 animate-fade-in-up';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover">
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="text-xl font-bold mb-2 text-white">${product.nombre}</h3>
                <p class="text-gray-400 text-sm mb-2 flex-grow">${product.descripcion}</p>
                <div class="flex justify-between items-center mt-auto">
                    <p class="text-yellow-300 font-bold text-lg">$${product.precio.toLocaleString('es-CO')}</p>
                    <button class="add-to-cart-btn bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-yellow-600 transition-colors" data-product-id="${product.id}">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        `;
        productosContainer.appendChild(productCard);
    });
    addAddToCartEventListeners(); // Añadir event listeners después de renderizar
};

// Renderiza productos destacados en el carrusel
const renderFeaturedProducts = (productsToRender) => {
    if (!carouselTrack) {
        console.error('El contenedor del carrusel (carouselTrack) no ha sido encontrado.');
        return;
    }
    carouselTrack.innerHTML = '';
    const featured = productsToRender.filter(product => product.destacado);
    if (featured.length === 0) {
        carouselTrack.innerHTML = '<p class="text-gray-400 text-center col-span-full">No se encontraron productos destacados.</p>';
        return;
    }
    featured.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'carousel-item bg-slate-800/80 panel-glass rounded-lg shadow-lg overflow-hidden flex flex-col items-center p-4 m-2 flex-none w-64 transform transition-transform duration-300 hover:scale-105 animate-fade-in-up';
        productCard.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-40 object-cover mb-4 rounded">
            <h3 class="text-xl font-bold mb-1 text-white">${product.nombre}</h3>
            <p class="text-gray-400 text-center mb-2 flex-grow">${product.descripcion.substring(0, 70)}...</p>
            <p class="text-yellow-300 font-bold text-lg mb-4">$${product.precio.toLocaleString('es-CO')}</p>
            <button class="add-to-cart-btn bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-yellow-600 transition-colors" data-product-id="${product.id}">
                Añadir al carrito
            </button>
        `;
        carouselTrack.appendChild(productCard);
    });
    calculateItemWidth();
};

// ==============================================
// 4. FUNCIONES DEL CARRUSEL
// ==============================================

const moveCarousel = (direction) => {
    if (!carouselTrack || itemWidth === 0) return;

    if (direction === 'next') {
        carouselIndex++;
        if (carouselIndex >= carouselTrack.children.length) {
            carouselIndex = 0;
        }
    } else if (direction === 'prev') {
        carouselIndex--;
        if (carouselIndex < 0) {
            carouselIndex = carouselTrack.children.length - 1;
        }
    } else if (typeof direction === 'number') {
        carouselIndex = direction;
    }
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
};

const startAutoScroll = () => {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
        moveCarousel('next');
    }, AUTO_SCROLL_DELAY);
};

const resetAutoScroll = () => {
    clearInterval(autoScrollInterval);
    startAutoScroll();
};

const calculateItemWidth = () => {
    if (carouselTrack && carouselTrack.children.length > 0) {
        const firstItem = carouselTrack.children[0];
        const itemComputedStyle = getComputedStyle(firstItem);
        const marginX = parseFloat(itemComputedStyle.marginLeft) + parseFloat(itemComputedStyle.marginRight);
        itemWidth = firstItem.offsetWidth + marginX;
        moveCarousel(carouselIndex);
    } else {
        itemWidth = 0;
    }
};

window.addEventListener('resize', calculateItemWidth);


// ==============================================
// 5. FUNCIONES DEL CARRITO
// ==============================================

const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCartItems();
    updateCartCount();
};

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
};

const updateQuantity = (productId, change) => {
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
};

const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const renderCartItems = () => {
    if (!cartItemsContainer) {
        console.error('El contenedor de ítems del carrito (cartItemsContainer) no ha sido encontrado.');
        return;
    }
    cartItemsContainer.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
        if (finalizePurchaseBtn) {
            finalizePurchaseBtn.disabled = true;
            finalizePurchaseBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (finalizePurchaseBtn) {
            finalizePurchaseBtn.disabled = false;
            finalizePurchaseBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p>Precio: $${item.precio.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-controls">
                    <button data-id="${item.id}" data-action="decrease">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button data-id="${item.id}" data-action="increase">+</button>
                    <button data-id="${item.id}" data-action="remove" class="ml-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center">🗑️</button>
                </div>
                <span class="cart-item-price">$${(item.precio * item.quantity).toLocaleString('es-CO')}</span>
            `;
            cartItemsContainer.appendChild(cartItemElement);
            total += item.precio * item.quantity;
        });
        const controlButtons = cartItemsContainer.querySelectorAll('.cart-item-controls button');
        controlButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const action = event.currentTarget.dataset.action;
                if (action === 'increase') {
                    updateQuantity(id, 1);
                } else if (action === 'decrease') {
                    updateQuantity(id, -1);
                } else if (action === 'remove') {
                    removeFromCart(id);
                }
            });
        });
    }
    cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
};

const updateCartCount = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems.toString();
    if (cartCountDesktopElement) cartCountDesktopElement.textContent = totalItems.toString();
    if (cartCountMobileElement) cartCountMobileElement.textContent = totalItems.toString();
};

const addAddToCartEventListeners = () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.onclick = null;
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const productToAdd = products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            }
        });
    });
};

// ==============================================
// 6. FUNCIONES DEL BUSCADOR
// ==============================================

const filterProducts = () => {
    const searchTerm = productSearchInput.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion.toLowerCase().includes(searchTerm) ||
        product.categoria.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
};


// ==============================================
// 7. INICIALIZACIÓN (Una vez que el DOM esté completamente cargado)
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Asignar elementos a las variables selectoras
    productosContainer = document.getElementById('productos-container');
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
    carouselTrack = document.getElementById('carousel-track');
    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');
    destacadosSection = document.getElementById('destacados');
    mobileNavLinks = document.getElementById('mobile-nav-links');

    productSearchInput = document.getElementById('product-search-input');
    searchButtonDesktop = document.getElementById('search-button-desktop');
    searchButtonMobile = document.getElementById('search-button-mobile');

    // Cargar productos al inicio
    loadProducts();

    // Event listeners para el menú móvil
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('-translate-x-full');
            document.body.style.overflow = '';
        });
    }

    if (mobileNavLinks) {
        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            });
        });
    }

    // Event listeners para el modal del carrito
    const openCartModal = () => {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCartItems();
    };

    if (cartButton) {
        cartButton.addEventListener('click', openCartModal);
    }
    if (navCartButtonDesktop) {
        navCartButtonDesktop.addEventListener('click', openCartModal);
    }
    if (navCartButtonMobile) {
        navCartButtonMobile.addEventListener('click', openCartModal);
    }

    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (cartModal) {
        cartModal.addEventListener('click', (event) => {
            if (event.target === cartModal) {
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Event listeners para el carrusel
    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', () => {
            moveCarousel('prev');
            resetAutoScroll();
        });
    }
    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', () => {
            moveCarousel('next');
            resetAutoScroll();
        });
    }

    // Event listener para el input de búsqueda
    if (productSearchInput) {
        productSearchInput.addEventListener('input', filterProducts);
    }

    // Event listeners para los botones de búsqueda (desktop y mobile)
    if (searchButtonDesktop) {
        searchButtonDesktop.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus();
                window.location.href = '#catalogo';
                filterProducts();
            }
        });
    }
    if (searchButtonMobile) {
        searchButtonMobile.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus();
                window.location.href = '#catalogo';
                filterProducts();
            }
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    }

    window.addEventListener('scroll', animateElements);
    animateElements();
});