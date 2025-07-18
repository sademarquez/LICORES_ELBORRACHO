import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Background3D from './components/Background3D.jsx';
import './index.css';

// Render the 3D background into its own dedicated div
const bgRoot = ReactDOM.createRoot(document.getElementById('bg'));
bgRoot.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Background3D />
    </Suspense>
  </React.StrictMode>
);

// Render the main application into the root div
const appRoot = ReactDOM.createRoot(document.getElementById('root'));
appRoot.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);