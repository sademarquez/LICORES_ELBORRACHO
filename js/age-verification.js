// js/age-verification.js

export function initAgeVerification() {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    // CORRECCIÓN: Verificación robusta
    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Faltan elementos del modal de verificación de edad. La verificación de edad no funcionará.');
        return;
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.style.display = 'none';
    } else {
        ageVerificationModal.style.display = 'flex';
    }

    confirmAgeBtn.addEventListener('click', () => {
        ageVerificationModal.style.display = 'none';
        localStorage.setItem('ageVerified', 'true');
    });

    declineAgeBtn.addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });
}
