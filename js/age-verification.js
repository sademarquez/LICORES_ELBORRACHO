// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            ageVerificationModal.style.display = 'none'; // Ocultar si ya se verificó
        } else {
            // Si no se ha verificado, el modal ya es visible por el 'style="display:flex;"' en el HTML
            // No es necesario añadir ageVerificationModal.style.display = 'flex'; aquí, pero no hace daño si lo tenías.
            // Lo más importante es que el display:flex en el HTML inicial sobreescriba el display:none del CSS general.
        }

        confirmAgeBtn.addEventListener('click', () => {
            ageVerificationModal.style.display = 'none';
            localStorage.setItem('ageVerified', 'true');
        });

        declineAgeBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com'; // Redirigir a otra URL
        });

        // Este modal NO se cierra al hacer clic fuera, forzando la interacción.
        window.addEventListener('click', (event) => {
            if (event.target === ageVerificationModal) {
                // No hacer nada, el usuario debe usar los botones.
            }
        });

    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
    }
});
