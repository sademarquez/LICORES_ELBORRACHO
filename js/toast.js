// js/toast.js

export function showToastNotification(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Elemento #toast-container no encontrado. No se pueden mostrar las notificaciones.');
        return;
    }

    // Asegurar que el contenedor tenga el rol ARIA para live regions
    if (!toastContainer.hasAttribute('aria-live')) {
        toastContainer.setAttribute('aria-live', 'polite'); // Anuncia cambios sin interrumpir flujo
        toastContainer.setAttribute('aria-atomic', 'true'); // Anuncia el contenido completo del toast
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toast.setAttribute('role', 'status'); // Indica que es un mensaje de estado

    toastContainer.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animación de salida y eliminación
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide'); // Para la animación de salida
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, duration);
}
