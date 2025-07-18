
import React from 'react';
import { Modal, Box, Typography, Button, Stack } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'rgba(25, 25, 25, 0.9)',
  border: '2px solid #D4AF37',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  color: '#f5f5f5',
};

export const AgeVerificationModal = ({ open, onConfirm }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="age-verification-title"
      aria-describedby="age-verification-description"
      disableEscapeKeyDown
    >
      <Box sx={style}>
        <Typography id="age-verification-title" variant="h5" component="h2" sx={{ color: '#D4AF37', fontWeight: 'bold' }}>
          ¿Eres mayor de edad?
        </Typography>
        <Typography id="age-verification-description" sx={{ mt: 2, color: '#a3a3a3' }}>
          Para ingresar a este sitio, debes tener la edad legal para consumir alcohol en tu país de residencia.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button 
            variant="outlined" 
            sx={{ borderColor: '#f5f5f5', color: '#f5f5f5' }}
            onClick={() => window.location.href = 'https://www.google.com'}
          >
            No, soy menor
          </Button>
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#D4AF37', color: 'black', '&:hover': { backgroundColor: '#FFBF00' } }}
            onClick={onConfirm}
          >
            Sí, soy mayor
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
