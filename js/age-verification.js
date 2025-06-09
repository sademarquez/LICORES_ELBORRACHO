// js/age-verification.js

export function initAgeVerification() { // Exportar la función para ser llamada desde main.js
    console.log('age-verification.js: DOM cargado. Inicializando verificación de edad...');

    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.classList.add('hidden'); // Usa .hidden class
        console.log('age-verification.js: Edad ya verificada. Ocultando modal.');
    } else {
        ageVerificationModal.classList.remove('hidden'); // Asegura que el modal sea visible
        console.log('age-verification.js: Edad no verificada. Mostrando modal.');
    }

    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.classList.add('hidden'); // Oculta el modal con la clase .hidden
        localStorage.setItem('ageVerified', 'true');
        console.log('age-verification.js: Edad verificada y guardada. Modal oculto.');
    });

    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "No soy mayor de 18" clicado. Redirigiendo...');
        // Considera una salida más elegante o una página específica para "edad-restringida"
        window.location.href = 'https://www.google.com'; // Redirige a Google o a una página "segura"
    });

    // Evita que el modal se cierre al hacer clic fuera, lo cual es deseado para la verificación de edad
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // No hacer nada, mantener el modal abierto si se hace clic en el fondo del overlay
            console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.');
        }
    });

    console.log('age-verification.js: Módulo de verificación de edad configurado.');
}

// No es necesario llamar a initAgeVerification() aquí si se llama desde main.js
