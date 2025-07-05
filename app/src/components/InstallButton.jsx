
import React, { useState, useEffect } from 'react';

const InstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    } else {
      // Fallback for browsers that don't support the prompt (like Safari on iOS)
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        alert('Para instalar: Toca el botón de Compartir y luego "Agregar a la pantalla de inicio".');
      } else {
        alert('Esta aplicación se puede instalar desde el menú de tu navegador o a través del ícono en la barra de direcciones.');
      }
    }
  };
  
  const buttonStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1000,
    fontSize: '14px'
  };

  return (
    <button style={buttonStyle} onClick={handleInstallClick}>
      Instalar App
    </button>
  );
};

export default InstallButton;
