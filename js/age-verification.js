// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('age-verification.js: DOM cargado. Inicializando verificación de edad...');

    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    // --- CAMBIO CLAVE: Usar sessionStorage en lugar de localStorage ---
    const ageVerified = sessionStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.style.display = 'none';
        console.log('age-verification.js: Edad ya verificada en la sesión. Ocultando modal.');
    } else {
        ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible
        console.log('age-verification.js: Edad no verificada en la sesión. Mostrando modal.');
    }

    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.style.display = 'none';
        sessionStorage.setItem('ageVerified', 'true'); // Guardar en sessionStorage
        console.log('age-verification.js: Edad verificada y guardada en la sesión. Modal oculto.');
    });

    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Menor de Edad" clicado. Redirigiendo...');
        window.location.href = 'https://www.google.com'; // O cualquier otra URL segura
    });

    // Evitar que el modal se cierre al hacer clic fuera:
    // Esta lógica es importante para forzar al usuario a interactuar con los botones.
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.');
        }
    });

    console.log('age-verification.js: Inicialización completa.');
});
