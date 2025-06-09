// main.js

import { initializeCarousel } from './carousel.js';
import { fetchProducts, renderProductsInContainer, getNewProducts, getOfferProducts, renderProductCard } from './products.js';
import { initializeCart } from './cart.js'; // Assuming you have a cart.js
import { setupSearch } from './search.js'; // Assuming you have a search.js
import { showToast } from './toast.js'; // Assuming you have a toast.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- Age Verification (if applicable) ---
    // Make sure your age-verification.js handles its own display logic
    // if (!sessionStorage.getItem('ageVerified')) {
    //     document.getElementById('age-verification-modal').style.display = 'flex';
    // }

    // --- Initialize Carousels ---

    // Main Hero Carousel (if exists, e.g., for banners)
    const mainHeroCarousel = document.getElementById('main-hero-carousel');
    if (mainHeroCarousel) {
        initializeCarousel(mainHeroCarousel, 5000); // 5 seconds for main banners
    }

    // Brand Logo Carousel (1.8 seconds)
    const brandLogoCarousel = document.getElementById('brand-logo-carousel');
    if (brandLogoCarousel) {
        // You might have static logos in HTML or fetch them from a config
        // For dynamic logos, you'd fetch them here and use brandLogoCarousel.addItems()
        initializeCarousel(brandLogoCarousel, 1800, true); // 1.8 seconds, loop content for smooth scrolling
    }

    // --- Product Loading and Carousel Initialization ---

    // Fetch all products
    const allProducts = await fetchProducts();

    // Render All Products Section (if you have one)
    renderProductsInContainer(allProducts, 'all-products-container');

    // Novedades Carousel (2.5 seconds)
    const newProductsCarouselElement = document.getElementById('new-products-carousel');
    if (newProductsCarouselElement) {
        const newProducts = await getNewProducts();
        const newProductCards = newProducts.map(product => renderProductCard(product));
        // Pass items to the carousel's internal addItems function
        initializeCarousel(newProductsCarouselElement, 2500, false, true); // 2.5 seconds, isProductCarousel: true
        newProductsCarouselElement.addItems(newProductCards);
    }

    // Ofertas Carousel (2.5 seconds)
    const offerProductsCarouselElement = document.getElementById('offer-products-carousel');
    if (offerProductsCarouselElement) {
        const offerProducts = await getOfferProducts();
        const offerProductCards = offerProducts.map(product => renderProductCard(product));
        initializeCarousel(offerProductsCarouselElement, 2500, false, true); // 2.5 seconds, isProductCarousel: true
        offerProductsCarouselElement.addItems(offerProductCards);
    }

    // --- Category Navigation Setup (Example) ---
    const categoryNav = document.getElementById('category-navigation');
    if (categoryNav) {
        // Example: Add event listeners to category links/buttons
        categoryNav.addEventListener('click', async (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.category) {
                const category = event.target.dataset.category;
                const productsByCategory = await getProductsByCategory(category);
                renderProductsInContainer(productsByCategory, 'product-list-container'); // Assuming a main product list container
                showToast(`Mostrando ${category}`, 'info');
            }
        });
    }

    // --- Initialize Cart and Search ---
    initializeCart(); // Assuming initializeCart is in cart.js and sets up event listeners
    setupSearch(allProducts); // Pass all products to search for filtering

    // --- Event listener for Add to Cart buttons ---
    // This assumes all product cards have a button with class 'add-to-cart-btn'
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(event.target.dataset.productId);
            // Example: Assuming addToCart is available globally or imported
            addToCart(productId); // Call the function from cart.js
            showToast('Producto añadido al carrito!', 'success');
        }
    });

    console.log('EL BORRACHO App Initialized!');
});
