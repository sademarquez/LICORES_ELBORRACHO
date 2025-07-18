
import React from 'react';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

export const CartSidebar = () => {
  const { isCartOpen, cartItems, toggleCart, updateQuantity, removeFromCart, cartTotal, toggleCheckout } = useCart();

  if (!isCartOpen) {
    return null;
  }

  const handleCheckout = () => {
    toggleCart(); // Cierra el sidebar del carrito
    toggleCheckout(); // Abre el modal de checkout
  };

  return (
    <>
      <div className="cart-backdrop" onClick={toggleCart}></div>
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button onClick={toggleCart} className="close-btn">&times;</button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imageUrl} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>${item.price.toLocaleString('es-CO')}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn">&times;</button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>${cartTotal.toLocaleString('es-CO')}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>Hacer Pedido</button>
          </div>
        )}
      </div>
    </>
  );
};
