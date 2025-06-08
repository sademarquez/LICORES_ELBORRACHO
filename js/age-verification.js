// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            ageVerificationModal.style.display = 'none';
        } else {
            // Asegura que el modal esté visible si no se ha verificado la edad
            // Esto es redundante con el CSS si ya tiene display: flex, pero explícito
            ageVerificationModal.style.display = 'flex';
        }

        confirmAgeBtn.addEventListener('click', () => {
            ageVerificationModal.style.display = 'none';
            localStorage.setItem('ageVerified', 'true');
        });

        declineAgeBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com'; // Redirigir a otra URL
        });

        // Evitar que el modal se cierre al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === ageVerificationModal) {
                // No hacer nada, el usuario debe usar los botones.
            }
        });

    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
    }
});
