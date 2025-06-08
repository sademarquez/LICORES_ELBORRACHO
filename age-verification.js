// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (ageVerificationModal && confirmAgeBtn && declineAgeBtn) {
        confirmAgeBtn.addEventListener('click', () => {
            ageVerificationModal.style.display = 'none';
            // Podemos guardar una cookie o localStorage para recordar la confirmación
            localStorage.setItem('ageVerified', 'true');
        });

        declineAgeBtn.addEventListener('click', () => {
            // Redirigir a otra página o simplemente cerrar la ventana
            window.location.href = 'https://www.google.com'; // Puedes cambiar esto
        });

        // Verificar si ya se confirmó la edad en una sesión anterior
        if (localStorage.getItem('ageVerified') === 'true') {
            ageVerificationModal.style.display = 'none';
        } else {
            ageVerificationModal.style.display = 'block'; // Mostrar el modal al cargar la página por primera vez
        }
    } else {
        console.warn('Elementos del modal de verificación de edad no encontrados.');
    }
});
