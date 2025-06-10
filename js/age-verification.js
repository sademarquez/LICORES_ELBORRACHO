// js/age-verification.js

// Nota: Este módulo no importa appState directamente porque debe ejecutarse
// ANTES de que se cargue cualquier otro contenido o se intente acceder a datos.
// Su propósito es bloquear el acceso si la edad no está verificada.

export function initAgeVerification() {
    const ageVerificationModal = document.getElementById('ageVerificationModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const declineAgeBtn = document.getElementById('declineAgeBtn');

    // Validación de elementos: Si alguno no se encuentra, la función se aborta.
    if (!ageVerificationModal || !confirmAgeBtn || !declineAgeBtn) {
        console.warn('age-verification.js: Elementos del modal de verificación de edad no encontrados. La verificación de edad no funcionará.');
        return;
    }

    // --- CORRECCIÓN CLAVE: El aviso de edad siempre se muestra al cargar la página ---
    // Se elimina cualquier dependencia de localStorage o de un estado previo.
    // El modal se fuerza a ser visible y completamente opaco al inicio.
    ageVerificationModal.style.display = 'flex'; // Asegura que el modal esté visible
    ageVerificationModal.style.opacity = '1';    // Asegura que no esté transparente al aparecer

    // Event listener para el botón "Soy mayor de 18"
    confirmAgeBtn.addEventListener('click', () => {
        // --- Transición suave para ocultar el modal ---
        // 1. Establece la opacidad a 0 para iniciar el desvanecimiento.
        ageVerificationModal.style.opacity = '0';
        // 2. Define la propiedad de transición para la opacidad.
        //    Esto hace que el cambio de opacidad sea gradual (0.5 segundos, con una curva 'ease-out').
        ageVerificationModal.style.transition = 'opacity 0.5s ease-out';

        // 3. Después de que la transición haya terminado (500ms), oculta el modal completamente.
        //    Esto es crucial para que el modal no siga ocupando espacio ni sea interactuable.
        setTimeout(() => {
            ageVerificationModal.style.display = 'none';
            // Opcional: Reinicia la opacidad a 1 y quita la transición para futuras interacciones
            // si el modal pudiera ser reutilizado de alguna forma en el futuro
            ageVerificationModal.style.opacity = '1';
            ageVerificationModal.style.transition = 'none'; // Importante quitar la transición para evitar conflictos si se vuelve a mostrar
        }, 500); // El tiempo aquí debe coincidir con la duración de la transición (0.5s = 500ms)
    });

    // Event listener para el botón "No soy mayor de 18"
    declineAgeBtn.addEventListener('click', () => {
        // --- Redirección inmediata a google.com ---
        // No hay transiciones, simplemente redirige.
        window.location.href = 'https://www.google.com';
    });

    // Se mantiene la lógica para evitar que el modal se cierre al hacer clic fuera de su contenido.
    // Esto fuerza al usuario a interactuar con los botones.
    window.addEventListener('click', (event) => {
        if (event.target === ageVerificationModal) {
            // console.log('age-verification.js: Clic en el fondo del modal de verificación de edad. No se cierra.'); // ELIMINADO
            // Puedes añadir una pequeña animación o vibración aquí para indicar que no se puede cerrar
            // Por ejemplo: ageVerificationModal.classList.add('shake-animation');
            // setTimeout(() => ageVerificationModal.classList.remove('shake-animation'), 300);
        }
    });
}
