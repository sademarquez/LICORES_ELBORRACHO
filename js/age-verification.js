// js/age-verification.js

export function initAgeVerification() {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.classList.remove('open'); // Quitar clase 'open' si ya está verificado
        ageVerificationModal.style.display = 'none'; // Asegurar que no se muestre
    } else {
        ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible antes de añadir 'open'
        // Pequeño retraso para que la propiedad display se aplique antes de la transición de opacidad/transform
        setTimeout(() => {
            ageVerificationModal.classList.add('open');
        }, 50); 
    }

    confirmAgeBtn.addEventListener('click', () => {
        ageVerificationModal.classList.remove('open'); // Inicia la transición de cierre
        ageVerificationModal.addEventListener('transitionend', function handler() {
            ageVerificationModal.style.display = 'none'; // Oculta después de la transición
            ageVerificationModal.removeEventListener('transitionend', handler);
        });
        localStorage.setItem('ageVerified', 'true');
    });

    declineAgeBtn.addEventListener('click', () => {
        window.location.href = 'https://www.google.com'; // Redirige si no es mayor de edad
    });

    // Evitar que el modal se cierre al hacer clic fuera:
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal && ageVerificationModal.classList.contains('open')) {
            // Opcional: añadir una pequeña animación de "sacudida" para indicar que no se puede cerrar
            ageVerificationModal.classList.add('shake');
            setTimeout(() => {
                ageVerificationModal.classList.remove('shake');
            }, 300);
        }
    });
}
