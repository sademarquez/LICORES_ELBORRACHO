
import React, { createContext, useState, useContext, useEffect } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  return useContext(PWAContext);
};

export const PWAProvider = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        setInstallPrompt(null);
      });
    }
  };

  const value = {
    isInstallable: !!installPrompt,
    triggerInstall,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};
