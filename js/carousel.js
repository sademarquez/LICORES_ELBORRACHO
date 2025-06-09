// carousel.js

/**
 * Initializes a simple automatic carousel.
 * @param {HTMLElement} carouselElement - The DOM element of the carousel container.
 * @param {number} slideDuration - The time in milliseconds each slide is displayed.
 * @param {boolean} loopContent - If true, duplicates content to create a seamless loop (for continuous scroll).
 * @param {boolean} isProductCarousel - If true, adds specific product carousel classes for styling.
 */
export function initializeCarousel(carouselElement, slideDuration = 3000, loopContent = false, isProductCarousel = false) {
    if (!carouselElement) {
        console.warn('Carousel element not found for initialization.');
        return;
    }

    const carouselInner = document.createElement('div');
    carouselInner.classList.add('carousel-inner');
    carouselElement.appendChild(carouselInner);

    // Collect initial items and move them to carouselInner
    const initialItems = Array.from(carouselElement.children).filter(child => !child.classList.contains('carousel-inner'));
    initialItems.forEach(item => carouselInner.appendChild(item));


    let carouselItems = Array.from(carouselInner.children);
    if (carouselItems.length === 0) {
        console.warn('No carousel items found in the provided element.');
        return;
    }

    // Add classes for product carousels
    if (isProductCarousel) {
        carouselElement.classList.add('product-carousel-container');
        carouselItems.forEach(item => {
            item.classList.add('product-carousel-item');
        });
    } else {
        carouselElement.classList.add('standard-carousel-container'); // For general carousels like banners
    }


    let currentIndex = 0;
    let intervalId;

    // Helper to get the correct number of visible items for dynamic width carousels
    const getVisibleItemsCount = () => {
        if (!isProductCarousel) return 1; // Standard carousels show one at a time
        const containerWidth = carouselElement.clientWidth;
        const itemWidth = carouselItems[0] ? carouselItems[0].offsetWidth : 0;
        return itemWidth > 0 ? Math.floor(containerWidth / itemWidth) : 1;
    };

    function updateCarouselPosition() {
        const visibleItems = getVisibleItemsCount();
        const itemWidth = carouselItems[0] ? carouselItems[0].offsetWidth : 0;
        const offset = -currentIndex * itemWidth;
        carouselInner.style.transform = `translateX(${offset}px)`;
    }

    function showSlide(index) {
        currentIndex = index;
        if (currentIndex >= carouselItems.length) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = carouselItems.length - 1;
        }
        updateCarouselPosition();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        showSlide(currentIndex);
    }

    // Initialize the first slide
    showSlide(currentIndex);

    // Set up automatic sliding
    intervalId = setInterval(nextSlide, slideDuration);

    // Optional: Add navigation arrows (only if needed)
    // const prevButton = document.createElement('button');
    // prevButton.textContent = '<';
    // prevButton.classList.add('carousel-control', 'prev');
    // carouselElement.appendChild(prevButton);
    //
    // const nextButton = document.createElement('button');
    // nextButton.textContent = '>';
    // nextButton.classList.add('carousel-control', 'next');
    // carouselElement.appendChild(nextButton);
    //
    // prevButton.addEventListener('click', () => {
    //     clearInterval(intervalId); // Stop auto-slide on manual interaction
    //     currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    //     showSlide(currentIndex);
    //     intervalId = setInterval(nextSlide, slideDuration); // Restart auto-slide
    // });
    //
    // nextButton.addEventListener('click', () => {
    //     clearInterval(intervalId); // Stop auto-slide on manual interaction
    //     nextSlide();
    //     intervalId = setInterval(nextSlide, slideDuration); // Restart auto-slide
    // });

    // Handle window resize for responsive carousels
    window.addEventListener('resize', () => {
        updateCarouselPosition();
    });

    // Function to add items to the carousel (useful if content is loaded dynamically)
    // This is important for new products and offers being loaded
    carouselElement.addItems = (newItems) => {
        newItems.forEach(item => carouselInner.appendChild(item));
        carouselItems = Array.from(carouselInner.children);
        showSlide(currentIndex); // Re-adjust position
    };
}
