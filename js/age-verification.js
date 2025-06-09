// js/age-verification.js

// Nota: Este módulo no importa appState directamente porque debe ejecutarse
// ANTES de que se cargue cualquier otro contenido o se intente acceder a datos.
// Su propósito es bloquear el acceso si la edad no está verificada.

export function initAgeVerification() {
    console.log('age-verification.js: Inicializando verificación de edad...');

    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        // Si los elementos no se encuentran, la página podría cargarse sin verificación,
        // lo que podría ser un problema si la verificación es obligatoria.
        // Aquí se asume que si no se encuentran, es un error de configuración del HTML.
        return;
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        ageVerificationModal.style.display = 'none';
        console.log('age-verification.js: Edad ya verificada. Ocultando modal.');
    } else {
        ageVerificationModal.style.display = 'flex'; // Asegurarse de que sea visible
        console.log('age-verification.js: Edad no verificada. Mostrando modal.');
    }

    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.style.display = 'none';
        localStorage.setItem('ageVerified', 'true');
        console.log('age-verification.js: Edad verificada y guardada. Modal oculto.');
    });

    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Menor de Edad" clicado. Redirigiendo...');
        // Puedes redirigir a una página de "contenido no apto" o a Google.
        window.location.href = 'https://www.google.com';
    });

    // Evitar que el modal se cierre al hacer clic fuera:
    // Esta lógica es importante para forzar al usuario a interactuar con los botones.
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.');
            // Puedes añadir una pequeña animación o vibración aquí para indicar que no se puede cerrar
        }
    });

    console.log('age-verification.js: Módulo de verificación de edad inicializado.');
}
