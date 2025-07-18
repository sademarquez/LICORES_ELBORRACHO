
import React from 'react';
import { useCart } from '../context/CartContext';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import './BottomNav.css';

export const BottomNav = ({ onSearchClick }) => {
  const { toggleCart, cartItems } = useCart();
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <button className="nav-button active">
        <HomeIcon />
        <span>Inicio</span>
      </button>
      <button className="nav-button" onClick={onSearchClick}>
        <SearchIcon />
        <span>Buscar</span>
      </button>
      <button className="nav-button" onClick={toggleCart}>
        <Badge badgeContent={cartItemCount} color="warning">
          <ShoppingCartIcon />
        </Badge>
        <span>Carrito</span>
      </button>
    </nav>
  );
};
