console.log('[PWA Install] Script loaded.');

let deferredPrompt;
const installButton = document.getElementById('installPwaBtn');

if (installButton) {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que Chrome 67 y anteriores muestren el prompt automáticamente.
        e.preventDefault();
        // Guardar el evento para que pueda ser disparado más tarde.
        deferredPrompt = e;
        // Mostrar nuestro botón de instalación personalizado.
        console.log('[PWA Install] `beforeinstallprompt` event fired. Showing install button.');
        installButton.style.display = 'inline-flex';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('[PWA Install] Install button clicked, but no prompt event available.');
            return;
        }
        // Ocultar nuestro botón.
        installButton.style.display = 'none';
        // Mostrar el prompt de instalación del navegador.
        deferredPrompt.prompt();
        // Esperar a que el usuario responda al prompt.
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA Install] User response to the install prompt: ${outcome}`);
        // Ya no necesitamos el evento.
        deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
        // Ocultar el botón de instalación si la app ya fue instalada.
        console.log('[PWA Install] App was installed.');
        installButton.style.display = 'none';
        deferredPrompt = null;
    });
} else {
    console.error('[PWA Install] Install button with ID "installPwaBtn" not found.');
}
