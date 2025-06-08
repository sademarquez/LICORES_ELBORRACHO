// js/toast.js

export function showToastNotification(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('toast.js: Elemento #toast-container no encontrado. No se pueden mostrar las notificaciones.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100); // Pequeño retraso para asegurar la animación

    // Animación de salida y eliminación
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide'); // Para la animación de salida
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true }); // Usar { once: true } para que el listener se elimine solo
    }, duration);
}
