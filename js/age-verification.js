const AGE_VERIFIED_KEY = 'el_borracho_age_verified';

export function initAgeVerification() {
    const modal = document.getElementById('ageVerificationModal');
    const mainContent = document.getElementById('mainContent');
    const confirmBtn = document.getElementById('confirmAgeBtn');
    const declineBtn = document.getElementById('declineAgeBtn');

    if (!modal || !mainContent || !confirmBtn || !declineBtn) {
        console.error('Elementos del modal de verificación no encontrados.');
        if (mainContent) mainContent.style.visibility = 'visible';
        return;
    }

    const isVerified = sessionStorage.getItem(AGE_VERIFIED_KEY);

    if (isVerified === 'true') {
        mainContent.style.visibility = 'visible';
    } else {
        modal.classList.add('visible');
    }

    confirmBtn.addEventListener('click', () => {
        sessionStorage.setItem(AGE_VERIFIED_KEY, 'true');
        modal.classList.remove('visible');
        mainContent.style.visibility = 'visible';
    });

    declineBtn.addEventListener('click', () => {
        alert('Lo sentimos, debes ser mayor de edad para acceder a este sitio.');
        window.location.href = 'https://www.google.com';
    });
}
