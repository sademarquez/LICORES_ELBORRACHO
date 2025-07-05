
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1rem',
    background: 'rgba(0,0,0,0.7)',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem'
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Inicio</Link>
      <Link to="/cart" style={linkStyle}>Carrito</Link>
    </nav>
  );
};

export default Navbar;
