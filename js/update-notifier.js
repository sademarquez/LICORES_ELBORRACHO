let newWorker;

function showUpdateBar() {
    const updateBar = document.createElement('div');
    updateBar.id = 'update-bar';
    updateBar.style.position = 'fixed';
    updateBar.style.bottom = '20px';
    updateBar.style.left = '50%';
    updateBar.style.transform = 'translateX(-50%)';
    updateBar.style.padding = '12px 20px';
    updateBar.style.backgroundColor = '#D4AF37'; // Usando el color primario
    updateBar.style.color = '#111111';
    updateBar.style.borderRadius = '50px';
    updateBar.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
    updateBar.style.zIndex = '9999';
    updateBar.style.display = 'flex';
    updateBar.style.alignItems = 'center';
    updateBar.style.gap = '15px';
    updateBar.style.fontFamily = "'Poppins', sans-serif";
    updateBar.style.fontWeight = '600';

    const message = document.createElement('span');
    message.textContent = 'Nueva versión disponible';
    updateBar.appendChild(message);

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Actualizar';
    updateButton.style.padding = '8px 16px';
    updateButton.style.backgroundColor = '#111111';
    updateButton.style.color = '#D4AF37';
    updateButton.style.border = 'none';
    updateButton.style.borderRadius = '30px';
    updateButton.style.cursor = 'pointer';
    updateButton.style.fontWeight = '700';
    
    updateButton.addEventListener('click', () => {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
    });

    updateBar.appendChild(updateButton);
    document.body.appendChild(updateBar);
}

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('[Notifier] Service Worker registrado:', reg);

            reg.addEventListener('updatefound', () => {
                // Se encontró una nueva versión del SW, se está instalando.
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    // El estado del nuevo SW cambió.
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // El nuevo SW está instalado y listo para activarse.
                        // Mostramos la barra de actualización.
                        showUpdateBar();
                    }
                });
            });
        });

        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    }
}
