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

    // --- MODIFICACIÓN CLAVE: Siempre muestra el modal ---
    // Eliminamos la lógica de localStorage y siempre mostramos el modal al cargar la página.
    ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible
    ageVerificationModal.style.opacity = '1'; // Asegurarse de que sea completamente opaco al inicio

    confirmAgeBtn.addEventListener('click', () => {
        // --- MODIFICACIÓN: Transición suave para "Soy mayor de 18" ---
        // Aplicar la transición para desvanecer el modal
        ageVerificationModal.style.opacity = '0';
        ageVerificationModal.style.transition = 'opacity 0.5s ease-out'; // Duración y curva de la transición

        // Ocultar el modal completamente después de que la transición termine
        setTimeout(() => {
            ageVerificationModal.style.display = 'none';
            // Opcional: Podrías querer resetear la opacidad a 1 aquí
            // si el modal pudiera ser reutilizado y necesitará aparecer de nuevo con opacidad completa.
            // ageVerificationModal.style.opacity = '1';
        }, 500); // Coincide con la duración de la transición (0.5s = 500ms)
    });

    declineAgeBtn.addEventListener('click', () => {
        // --- MODIFICACIÓN: Redirección inmediata para "No soy mayor de 18" ---
        window.location.href = 'https://www.google.com';
    });

    // Evitar que el modal se cierre al hacer clic fuera (se mantiene esta lógica):
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // Puedes añadir una pequeña animación o vibración aquí para indicar que no se puede cerrar
            // Por ejemplo, ageVerificationModal.classList.add('shake-animation');
            // setTimeout(() => ageVerificationModal.classList.remove('shake-animation'), 300);
        }
    });
}
