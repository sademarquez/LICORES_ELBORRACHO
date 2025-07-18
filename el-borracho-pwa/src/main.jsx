
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Background3D from './components/Background3D.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <Suspense fallback={<div style={{ backgroundColor: '#111', height: '100vh' }} />}>
        <Background3D />
      </Suspense>
      <App />
    </CartProvider>
  </React.StrictMode>
);
