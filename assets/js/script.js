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
        const response = await fetch('assets/json/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        renderProducts(products); // Renderiza todos los productos inicialmente
        renderFeaturedProducts(products); // Renderiza los productos destacados en el carrusel
        updateCartCount(); // Actualiza el contador del carrito al cargar la página
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
                <h3 class="text-xl font-bold mb-2 text-yellow-400">${product.nombre}</h3>
                <p class="text-gray-300 text-sm mb-2 flex-grow">${product.descripcion}</p>
                <p class="text-yellow-300 font-bold text-lg mb-2">$${product.precio.toLocaleString('es-CO')}</p>
                <button class="add-to-cart-btn bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-yellow-600 transition-colors self-start" data-product-id="${product.id}">
                    Añadir al carrito
                </button>
            </div>
        `;
        productosContainer.appendChild(productCard);
    });

    // Añade event listeners a los botones "Añadir al carrito" después de renderizar
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            const productToAdd = products.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            }
        });
    });
};

// Renderiza los productos destacados en el carrusel
const renderFeaturedProducts = (allProducts) => {
    if (!carouselTrack) {
        console.error('El track del carrusel (carouselTrack) no ha sido encontrado.');
        return;
    }
    const featured = allProducts.filter(product => product.destacado);
    carouselTrack.innerHTML = ''; // Limpiar antes de renderizar

    if (featured.length === 0) {
        carouselTrack.innerHTML = '<p class="text-gray-400 text-center col-span-full">No hay productos destacados.</p>';
        return;
    }

    featured.forEach(product => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4'; // Clases para responsive
        carouselItem.innerHTML = `
            <div class="bg-slate-800/80 panel-glass rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition-transform duration-300 hover:scale-105">
                <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-48 object-cover">
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-xl font-bold mb-2 text-yellow-400">${product.nombre}</h3>
                    <p class="text-gray-300 text-sm mb-2 flex-grow">${product.descripcion}</p>
                    <p class="text-yellow-300 font-bold text-lg mb-2">$${product.precio.toLocaleString('es-CO')}</p>
                    <button class="add-to-cart-btn bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-yellow-600 transition-colors self-start" data-product-id="${product.id}">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        `;
        carouselTrack.appendChild(carouselItem);
    });

    // Calcular el ancho del ítem después de que se han renderizado
    // Esto debe hacerse después de que los elementos están en el DOM
    setTimeout(() => {
        if (carouselTrack.children.length > 0) {
            itemWidth = carouselTrack.children[0].offsetWidth;
            // Ajustar el transform para que el carrusel empiece correctamente
            carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
            startAutoScroll(); // Iniciar el auto-scroll una vez que los ítems están cargados
        }
    }, 100); // Pequeño retraso para asegurar que los elementos se han renderizado
};


// ==============================================
// 4. FUNCIONES DEL CARRUSEL
// ==============================================

const moveCarousel = (direction) => {
    const totalItems = carouselTrack.children.length;
    const itemsInView = Math.floor(carouselTrack.offsetWidth / itemWidth); // Número de ítems visibles
    
    if (direction === 'next') {
        carouselIndex++;
        if (carouselIndex > totalItems - itemsInView) {
            carouselIndex = 0; // Vuelve al principio
        }
    } else { // 'prev'
        carouselIndex--;
        if (carouselIndex < 0) {
            carouselIndex = totalItems - itemsInView; // Va al final
        }
    }
    carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
};

const startAutoScroll = () => {
    clearInterval(autoScrollInterval); // Limpiar cualquier intervalo existente
    autoScrollInterval = setInterval(() => {
        moveCarousel('next');
    }, AUTO_SCROLL_DELAY);
};

const resetAutoScroll = () => {
    clearInterval(autoScrollInterval);
    startAutoScroll();
};

// ==============================================
// 5. FUNCIONES DEL CARRITO
// ==============================================

// Añadir producto al carrito
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
    showToast(`${product.nombre} añadido al carrito!`); // Mostrar toast
};

// Remover producto del carrito
const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
};

// Actualizar cantidad de producto en el carrito
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

// Guardar carrito en localStorage
const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Renderizar elementos del carrito en el modal
const renderCartItems = () => {
    if (!cartItemsContainer || !cartTotalElement) {
        console.error('Elementos del carrito no encontrados en el DOM.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item flex items-center mb-4 pb-4 border-b border-slate-700/50';
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="w-20 h-20 object-cover rounded-lg mr-4">
                <div class="cart-item-details flex-grow">
                    <h4 class="font-bold text-yellow-400">${item.nombre}</h4>
                    <p class="text-gray-300 text-sm">$${item.precio.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-controls flex items-center">
                    <button class="bg-yellow-500 text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold hover:bg-yellow-600 transition-colors" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="cart-item-quantity text-lg mx-2">${item.quantity}</span>
                    <button class="bg-yellow-500 text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold hover:bg-yellow-600 transition-colors" data-id="${item.id}" data-action="increase">+</button>
                    <button class="ml-4 text-red-500 hover:text-red-600 transition-colors" data-id="${item.id}" data-action="remove">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.precio * item.quantity;
        });

        // Añadir event listeners a los nuevos botones
        cartItemsContainer.querySelectorAll('button').forEach(button => {
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

// Actualizar el contador de ítems en el carrito (en los botones)
const updateCartCount = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    if (cartCountDesktopElement) cartCountDesktopElement.textContent = totalItems;
    if (cartCountMobileElement) cartCountMobileElement.textContent = totalItems;
};

// ==============================================
// 6. FUNCIONES DE BÚSQUEDA
// ==============================================

const filterProducts = () => {
    const searchTerm = productSearchInput.value.toLowerCase();
    const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion.toLowerCase().includes(searchTerm) ||
        (product.categoria && product.categoria.toLowerCase().includes(searchTerm)) || // Asegúrate de que categoría exista
        (product.notas && product.notas.toLowerCase().includes(searchTerm)) // Incluye notas en la búsqueda
    );
    renderProducts(filtered); // Renderiza los productos filtrados
};


// ==============================================
// 7. FUNCIONES DE UI Y ACCESORIOS
// ==============================================

// Mostrar un toast (mensaje temporal)
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg z-50 transition-opacity duration-300 opacity-0';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Forzar reflow para que la transición CSS funcione
    void toast.offsetWidth; 
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); // Duración del toast
};


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

// ==============================================
// 8. EVENT LISTENERS PRINCIPALES (Ejecutar cuando el DOM esté completamente cargado)
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    // Asignación de elementos HTML a las variables
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
    cartCountDesktopElement = document.getElementById('cart-count-desktop');
    cartCountMobileElement = document.getElementById('cart-count-mobile');
    carouselTrack = document.getElementById('carousel-track');
    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    finalizePurchaseBtn = document.getElementById('finalize-purchase-btn');
    destacadosSection = document.getElementById('destacados'); // Usado para Intersection Observer si se implementa
    mobileNavLinks = document.getElementById('mobile-nav-links');

    productSearchInput = document.getElementById('product-search-input');
    searchButtonDesktop = document.getElementById('search-button-desktop');
    searchButtonMobile = document.getElementById('search-button-mobile');


    // Cargar productos al inicio
    loadProducts();
    // Renderizar ítems del carrito al cargar la página
    renderCartItems();
    updateCartCount();


    // Event Listeners para el menú móvil (hamburguesa)
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('-translate-x-full');
                mobileMenu.classList.add('translate-x-0');
                document.body.style.overflow = 'hidden'; // Evita scroll del body
            }
        });
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('translate-x-0');
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = ''; // Restaura scroll del body
            }
        });
    }

    // Cierra el menú móvil al hacer clic en un enlace de navegación
    if (mobileNavLinks) {
        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu) {
                    mobileMenu.classList.remove('translate-x-0');
                    mobileMenu.classList.add('-translate-x-full');
                    document.body.style.overflow = '';
                }
            });
        });
    }


    // Event Listeners para el carrito (botones de abrir/cerrar modal)
    const openCartModal = () => {
        if (cartModal) {
            cartModal.style.display = 'flex'; // Cambia a flex para centrar
            setTimeout(() => cartModal.classList.add('active'), 10); // Pequeño delay para la animación
            document.body.style.overflow = 'hidden'; // Evita scroll del body
        }
    };

    const closeCartModal = () => {
        if (cartModal) {
            cartModal.classList.remove('active');
            cartModal.addEventListener('transitionend', function handler() {
                cartModal.style.display = 'none';
                cartModal.removeEventListener('transitionend', handler);
            }, { once: true });
            document.body.style.overflow = ''; // Restaura scroll del body
        }
    };

    if (cartButton) cartButton.addEventListener('click', openCartModal);
    if (navCartButtonDesktop) navCartButtonDesktop.addEventListener('click', openCartModal);
    if (navCartButtonMobile) navCartButtonMobile.addEventListener('click', openCartModal);
    if (closeCartModalBtn) closeCartModalBtn.addEventListener('click', closeCartModal);

    // Cerrar modal si se hace clic fuera del contenido
    if (cartModal) {
        cartModal.addEventListener('click', (event) => {
            if (event.target === cartModal) {
                closeCartModal();
            }
        });
    }

    // Event Listener para finalizar compra
    if (finalizePurchaseBtn) {
        finalizePurchaseBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                alert('¡Compra finalizada con éxito! Gracias por tu pedido.');
                cart = []; // Vaciar el carrito
                saveCart();
                renderCartItems();
                updateCartCount();
                closeCartModal();
            } else {
                alert('Tu carrito está vacío. Añade productos para finalizar la compra.');
            }
        });
    }

    // Event Listeners para el carrusel
    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', () => {
            moveCarousel('prev');
            resetAutoScroll(); // Reinicia el auto-scroll al interactuar manualmente
        });
    }
    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', () => {
            moveCarousel('next');
            resetAutoScroll(); // Reinicia el auto-scroll al interactuar manualmente
        });
    }

    // Event listener para el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
        if (carouselTrack && carouselTrack.children.length > 0) {
            itemWidth = carouselTrack.children[0].offsetWidth;
            // Asegúrate de que el carrusel se reajuste a la posición actual
            carouselTrack.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
        }
    });


    // Event listener para el input de búsqueda (busca mientras se escribe)
    if (productSearchInput) {
        productSearchInput.addEventListener('input', filterProducts);
    }

    // Event listeners para los botones de búsqueda (desktop y mobile)
    if (searchButtonDesktop) {
        searchButtonDesktop.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus(); // Enfocar el input al hacer clic en la lupa
                window.location.href = '#catalogo'; // Opcional: scroll al catálogo
                filterProducts(); // Llama a la función de búsqueda
            }
        });
    }
    if (searchButtonMobile) {
        searchButtonMobile.addEventListener('click', () => {
            if (productSearchInput) {
                productSearchInput.focus(); // Enfocar el input al hacer clic en la lupa
                window.location.href = '#catalogo'; // Opcional: scroll al catálogo
                filterProducts(); // Llama a la función de búsqueda
            }
            // Si el menú móvil está abierto, ciérralo
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    }

    // Event listener para el scroll (para animaciones)
    window.addEventListener('scroll', animateElements);
    // Ejecutar una vez al cargar para animar elementos visibles desde el principio
    animateElements();
});