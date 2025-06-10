// js/age-verification.js

// Nota: Este módulo no importa appState directamente porque debe ejecutarse
// ANTES de que se cargue cualquier otro contenido o se intente acceder a datos.
// Su propósito es bloquear el acceso si la edad no está verificada.

export function initAgeVerification() {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    // Siempre muestra el modal al inicio.
    ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible
    ageVerificationModal.style.opacity = '1'; // Asegurarse de que sea completamente opaco al inicio

    confirmAgeBtn.addEventListener('click', () => {
        // Aplicar la transición para desvanecer el modal
        ageVerificationModal.style.opacity = '0';
        ageVerificationModal.style.transition = 'opacity 0.5s ease-out';

        // Ocultar el modal completamente después de que la transición termine
        setTimeout(() => {
            ageVerificationModal.style.display = 'none';
            console.log('age-verification.js: Modal de verificación de edad ocultado después de confirmación.'); // Nuevo log
        }, 500); // Coincide con la duración de la transición (0.5s = 500ms)
    });

    declineAgeBtn.addEventListener('click', () => {
        window.location.href = 'https://www.google.com'; // Redirección inmediata
    });

    // Evitar que el modal se cierre al hacer clic fuera (se mantiene esta lógica):
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // console.log('age-verification.js: Intento de cerrar modal haciendo clic fuera.'); // ELIMINADO
            // Puedes añadir una pequeña animación o vibración aquí para indicar que no se puede cerrar
            // Por ejemplo, ageVerificationModal.classList.add('shake-animation');
            // setTimeout(() => ageVerificationModal.classList.remove('shake-animation'), 300);
        }
    });
}
