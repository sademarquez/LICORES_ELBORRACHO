// js/age-verification.js

document.addEventListener('DOMContentLoaded', () => {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    // Verifica que todos los elementos necesarios existan
    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return; // Sale de la función si los elementos no están presentes
    }

    const ageVerified = localStorage.getItem('ageVerified');

    if (ageVerified === 'true') {
        // Si ya se verificó la edad en una sesión anterior, se oculta el modal.
        // Se usa 'display: none' para ocultarlo completamente.
        ageVerificationModal.style.display = 'none';
        document.body.classList.remove('no-scroll'); // Asegura que el scroll esté habilitado
    } else {
        // Si NO se ha verificado, el modal permanece VISIBLE.
        // Y se evita el scroll en el body para que el usuario interactúe con el modal.
        ageVerificationModal.style.display = 'flex'; // Asegura que el modal esté visible y centrado
        document.body.classList.add('no-scroll'); // Evita el scroll del body
    }

    confirmAgeBtn.addEventListener('click', () => {
        ageVerificationModal.style.display = 'none';
        localStorage.setItem('ageVerified', 'true');
        document.body.classList.remove('no-scroll'); // Habilita el scroll una vez verificado
    });

    declineAgeBtn.addEventListener('click', () => {
        window.location.href = 'https://www.google.com'; // Redirigir a otra URL
    });

    // Evitar que el modal se cierre al hacer clic fuera (ya implementado, pero reforzado)
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // No hacer nada, el usuario debe usar los botones.
            // Esto previene que el modal se cierre haciendo clic en el fondo gris.
        }
    });

    // Añadir una clase al body para deshabilitar el scroll cuando el modal está activo
    // Necesitas añadir esto en tu CSS:
    /*
    body.no-scroll {
        overflow: hidden;
    }
    */
});
