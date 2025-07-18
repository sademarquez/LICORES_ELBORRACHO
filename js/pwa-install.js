let deferredPrompt;

export function initPwaInstall() {
    console.log('[PWA Install] Initializing...');
    const installButton = document.getElementById('installPwaBtn');

    if (!installButton) {
        console.warn('[PWA Install] Install button with ID "installPwaBtn" not found in the DOM.');
        return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('[PWA Install] `beforeinstallprompt` event fired. Showing install button.');
        installButton.style.display = 'inline-flex';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('[PWA Install] Install button clicked, but no prompt event available.');
            return;
        }
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA Install] User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
        console.log('[PWA Install] App was installed.');
        installButton.style.display = 'none';
        deferredPrompt = null;
    });
}