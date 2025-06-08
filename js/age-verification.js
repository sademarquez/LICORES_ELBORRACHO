// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        // Verificar si ya se confirmó la edad en una sesión anterior
        const ageVerified = localStorage.getItem('ageVerified');

        if (ageVerified === 'true') {
            ageVerificationModal.style.display = 'none'; // Si ya verificó, ocultar inmediatamente
        } else {
            ageVerificationModal.style.display = 'flex'; // Mostrar el modal al cargar la página (se usa flex para centrar)
        }

        confirmAgeBtn.addEventListener('click', () => {
            ageVerificationModal.style.display = 'none';
            localStorage.setItem('ageVerified', 'true');
            // Puedes añadir aquí un evento para iniciar otras animaciones o funcionalidades post-verificación
        });

        declineAgeBtn.addEventListener('click', () => {
            // Redirigir a otra página o simplemente cerrar la ventana
            window.location.href = 'https://www.google.com'; // O cualquier URL de salida
        });

        // Asegurarse de que el modal de verificación de edad no se cierre al hacer clic fuera
        // ya que es crítico para la UX que el usuario elija una opción.
        window.addEventListener('click', (event) => {
            if (event.target === ageVerificationModal) {
                // No hacer nada, forzar al usuario a usar los botones
            }
        });
    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
    }
});
