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
        ageVerificationModal.classList.remove('show'); // Asegura que no se muestre si ya está verificado
        ageVerificationModal.style.display = 'none'; // Ocultar completamente con display
        console.log('age-verification.js: Edad ya verificada. Ocultando modal.');
    } else {
        ageVerificationModal.style.display = 'flex'; // Mostrar el modal (usando flex para centrar)
        setTimeout(() => {
            ageVerificationModal.classList.add('show'); // Añade la clase 'show' para la animación de entrada
        }, 50); // Pequeño retraso para que la transición CSS funcione
        console.log('age-verification.js: Edad no verificada. Mostrando modal.');
    }

    confirmAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Mayor de 18" clicado.');
        ageVerificationModal.classList.remove('show'); // Inicia animación de salida
        ageVerificationModal.addEventListener('transitionend', function handler() {
            ageVerificationModal.style.display = 'none'; // Ocultar después de la transición
            ageVerificationModal.removeEventListener('transitionend', handler);
        });
        localStorage.setItem('ageVerified', 'true');
        console.log('age-verification.js: Edad verificada y guardada. Modal oculto.');
        // Opcional: Recargar la página o habilitar el contenido principal aquí si fuera necesario
        // Pero en este caso, main.js ya verifica si el modal está visible para continuar.
        window.location.reload(); // Recargar para que main.js continúe con la carga completa
    });

    declineAgeBtn.addEventListener('click', () => {
        console.log('age-verification.js: Botón "Soy Menor de Edad" clicado. Redirigiendo...');
        // Redirección obligatoria para menores
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

    console.log('age-verification.js: Verificación de edad configurada.');
}
