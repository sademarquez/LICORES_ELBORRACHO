// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('age-verification.js: DOM cargado. Inicializando verificación de edad...');

    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return; // Sale de la función si los elementos esenciales no están presentes
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        // Si ya se verificó la edad en una sesión anterior, oculta el modal inmediatamente.
        console.log('age-verification.js: Edad ya verificada. Ocultando modal.');
        ageVerificationModal.style.display = 'none';
    } else {
        // Si NO se ha verificado, asegura que el modal esté visible.
        // El CSS (components.css) ya lo establece con display: flex;
        // pero podemos ser explícitos aquí si es necesario o si hay un conflicto CSS.
        console.log('age-verification.js: Edad no verificada. Mostrando modal.');
        ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible
    }

    // Listener para el botón "Soy Mayor de 18"
    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.style.display = 'none'; // Oculta el modal
        localStorage.setItem('ageVerified', 'true'); // Guarda la verificación en localStorage
        console.log('age-verification.js: Edad verificada y guardada. Modal oculto.');
    });

    // Listener para el botón "Soy Menor de Edad"
    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Menor de Edad" clicado. Redirigiendo...');
        window.location.href = 'https://www.google.com'; // Redirige a Google
    });

    // Evitar que el modal se cierre al hacer clic fuera:
    // Esta lógica es importante para forzar al usuario a interactuar con los botones.
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // Si el clic fue directamente en el fondo oscuro del modal, no hacer nada.
            // Los botones dentro del modal tienen sus propios listeners.
            console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.');
        }
    });

    console.log('age-verification.js: Verificación de edad configurada.');
});
