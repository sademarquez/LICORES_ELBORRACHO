// js/age-verification.js

export function initAgeVerification() {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            // Si ya se verificó la edad, asegurarse de que el modal esté oculto.
            ageVerificationModal.classList.remove('show-modal');
            ageVerificationModal.style.display = 'none'; // Fallback directo
        } else {
            // Si NO se ha verificado, mostrar el modal.
            ageVerificationModal.classList.add('show-modal');
            ageVerificationModal.style.display = 'flex'; // Asegurar que se muestre como flex
        }

        confirmAgeBtn.addEventListener('click', () => {
            ageVerificationModal.classList.remove('show-modal');
            ageVerificationModal.style.display = 'none'; // Ocultar al confirmar
            localStorage.setItem('ageVerified', 'true');
        });

        declineAgeBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com'; // Redirigir a otra URL
        });

        // Este listener previene que el modal se cierre haciendo clic fuera de su contenido,
        // forzando al usuario a usar los botones.
        window.addEventListener('click', (event) => {
            if (event.target === ageVerificationModal) {
                // No hacer nada; el usuario debe interactuar con los botones.
            }
        });

    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
    }
}
