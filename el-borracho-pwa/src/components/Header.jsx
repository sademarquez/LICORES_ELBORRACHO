
import React from 'react';
import { useCart } from '../context/CartContext';
import { useScrollPosition } from '../hooks/useScrollPosition';
import logo from '/logo_1.svg';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import './Header.css';

export const Header = ({ mainRef }) => {
  const { toggleCart, cartItems } = useCart();
  const scrollPosition = useScrollPosition(mainRef);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const isFloating = scrollPosition > 50;

  return (
    <header className="app-header">
      <div className={`logo-container ${isFloating ? 'floating' : ''}`}>
        <img 
          src={logo} 
          alt="El Borracho Logo" 
          className="logo"
        />
      </div>
      <div className="cart-icon-container" onClick={toggleCart}>
        <Badge badgeContent={cartItemCount} color="warning">
          <ShoppingCartIcon sx={{ color: '#D4AF37', fontSize: 30 }} />
        </Badge>
      </div>
    </header>
  );
};
