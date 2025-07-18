
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CheckoutModal.css';

import { getFunctions, httpsCallable } from 'firebase/functions';

export const CheckoutModal = () => {
  const { isCheckoutOpen, toggleCheckout, cartItems, cartTotal, clearCart } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) {
      alert('Por favor, completa tu nombre y dirección.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const orderDetails = {
      customer: { name, address },
      items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      total: cartTotal,
    };

    try {
      const functions = getFunctions();
      const createOrder = httpsCallable(functions, 'createOrder');
      const result = await createOrder(orderDetails);
      
      const pickupCode = result.data.pickupCode;
      
      // --- WhatsApp Logic ---
      const storePhoneNumber = "573185004268"; // WhatsApp number with country code
      let message = `¡Hola! 👋 Acabo de hacer un pedido:\n\n`;
      message += `*Código de Recogida:* ${pickupCode}\n\n`;
      message += `*Cliente:* ${name}\n`;
      message += `*Dirección:* ${address}\n\n`;
      message += `*Pedido:*\n`;
      cartItems.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString('es-CO')}\n`;
      });
      message += `\n*Total a Pagar:* ${cartTotal.toLocaleString('es-CO')}\n\n`;
      message += `¡Gracias!`;

      const whatsappUrl = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      // --- End WhatsApp Logic ---

      clearCart();
      toggleCheckout();
    } catch (err) {
      console.error("Error creating order:", err);
      setError("No se pudo enviar el pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCheckoutOpen) {
    return null;
  }

  return (
    <>
      <div className="checkout-backdrop" onClick={toggleCheckout}></div>
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>Finalizar Pedido</h2>
          <button onClick={toggleCheckout} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="order-summary">
            <h4>Resumen de tu pedido</h4>
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toLocaleString('es-CO')}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <span>${cartTotal.toLocaleString('es-CO')}</span>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Tu Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y Apellido"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Tu Dirección</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, barrio, etc."
              required
            />
          </div>
          <button type="submit" className="submit-order-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar Pedido'}
          </button>
        </form>
      </div>
    </>
  );
};
