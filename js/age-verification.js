// js/age-verification.js

export function initAgeVerification() {
    console.log('age-verification.js: Inicializando verificación de edad...');

    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.style.display = 'none';
        console.log('age-verification.js: Edad ya verificada. Ocultando modal.');
    } else {
        ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible para centrar
        console.log('age-verification.js: Edad no verificada. Mostrando modal.');
    }

    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.style.display = 'none';
        localStorage.setItem('ageVerified', 'true');
        console.log('age-verification.js: Edad verificada y guardada. Modal oculto.');
    });

    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "No soy Mayor de 18" clicado. Redirigiendo...');
        window.location.href = 'https://www.google.com'; // Redirigir a una página externa
    });

    // Evitar que el modal se cierre al hacer clic fuera:
    // Esta lógica es importante para forzar al usuario a interactuar con los botones.
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.');
        }
    });

    console.log('age-verification.js: Verificación de edad configurada.');
}
