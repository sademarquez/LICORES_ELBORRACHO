// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            // Si ya se verificó la edad en una sesión anterior, se oculta el modal.
            ageVerificationModal.style.display = 'none';
        } else {
            // Si NO se ha verificado, el modal permanece VISIBLE.
            // El modal ya es visible por el 'style="display:flex;"' en el HTML.
            // Esta rama 'else' simplemente asegura que no se oculta si no debe.
            // NO se necesita ageVerificationModal.style.display = 'flex'; aquí
            // porque ya está en el HTML y esa es la forma inicial de mostrarlo.
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
