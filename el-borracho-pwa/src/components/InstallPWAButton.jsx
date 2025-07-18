
import React from 'react';
import { usePWA } from '../context/PWAContext';
import { Fab, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export const InstallPWAButton = () => {
  const { isInstallable, triggerInstall } = usePWA();

  if (!isInstallable) {
    return null;
  }

  return (
    <Tooltip title="Instalar Aplicación" placement="left">
      <Fab
        color="warning"
        aria-label="install"
        onClick={triggerInstall}
        sx={{
          position: 'fixed',
          bottom: 86, // Position above the bottom nav
          right: 16,
          zIndex: 100,
        }}
      >
        <DownloadIcon />
      </Fab>
    </Tooltip>
  );
};
