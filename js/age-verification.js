// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            // Si ya se verificó la edad en una sesión anterior, se oculta el modal con clase
            ageVerificationModal.classList.add('hidden');
        } else {
            // El modal ya es visible por el 'style="display:flex;"' en el HTML
            // y las transiciones CSS controlarán su apariencia inicial.
        }

        confirmAgeBtn.addEventListener('click', () => {
            // Añadir clase hidden para animar la salida antes de ocultar completamente
            ageVerificationModal.classList.add('hidden');
            localStorage.setItem('ageVerified', 'true');
            // Quitar el display:flex después de la animación
            ageVerificationModal.addEventListener('transitionend', () => {
                if (ageVerificationModal.classList.contains('hidden')) {
                    ageVerificationModal.style.display = 'none';
                }
            }, { once: true });
        });

        declineAgeBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com'; // Redirigir a otra URL
        });

        // Evitar que el modal se cierre al hacer clic fuera - CUIDADO: si hay una clase de ocultar, se debe mantener esta lógica.
        // La solicitud indica que el modal de edad NO debe cerrarse al hacer clic fuera, solo con los botones.
        // La implementación actual ya lo hace. No se necesita cambio aquí.
        window.addEventListener('click', (event) => {
            if (event.target === ageVerificationModal) {
                // No hacer nada, el usuario debe usar los botones.
            }
        });

    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
    }
});
