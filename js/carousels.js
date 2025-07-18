export function initHeroCarousel(bannersData) {
    const wrapper = document.getElementById('heroSwiperWrapper');
    if (!wrapper || !bannersData) return;
    wrapper.innerHTML = bannersData.map(banner => `
        <div class="swiper-slide hero-slide" style="background-image: url('${banner.imageUrl}')">
            <div class="hero-slide-content">
                <h2>${banner.title}</h2>
                <p>${banner.description}</p>
                <a href="${banner.link}" class="btn">${banner.buttonText}</a>
            </div>
        </div>
    `).join('');
    new Swiper('.hero-swiper', {
        effect: 'coverflow', grabCursor: true, centeredSlides: true, slidesPerView: 'auto', loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false, },
        coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true, },
        pagination: { el: '.swiper-pagination', clickable: true, },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev', },
    });
}

export function initBrandsCarousel(brandsData) {
    const wrapper = document.getElementById('brandsSwiperWrapper');
    if (!wrapper || !brandsData) return;
    wrapper.innerHTML = brandsData.map(brand => `
        <div class="swiper-slide">
            <!-- AÑADIDO: width, height y loading="lazy" para mejorar rendimiento -->
            <div class="brand-logo"><img src="${brand.logoUrl}" alt="${brand.name}" width="150" height="50" loading="lazy"></div>
        </div>
    `).join('');
    new Swiper('.brands-swiper', {
        slidesPerView: 'auto', spaceBetween: 30, loop: true, freeMode: true,
        autoplay: { delay: 0, disableOnInteraction: false, },
        speed: 7000, grabCursor: false, allowTouchMove: false,
    });
}
