
import React, { useState } from 'react';
import { Modal, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCart } from '../context/CartContext';
import './SearchModal.css';

const ProductCard = ({ product, onAddToCart }) => (
  <div className="product-card-search">
    <img src={product.imageUrl} alt={product.name} className="product-image-search" />
    <div className="product-details-search">
      <h3>{product.name}</h3>
      <p>${product.price.toLocaleString('es-CO')}</p>
      <button onClick={() => onAddToCart(product)}>Agregar</button>
    </div>
  </div>
);

export const SearchModal = ({ allProducts, open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const filteredProducts = searchTerm
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <Modal open={open} onClose={onClose} className="search-modal">
      <Box className="search-modal-box">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar licores, cervezas, snacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <div className="search-results">
          {searchTerm && filteredProducts.length === 0 && <p>No se encontraron resultados.</p>}
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </Box>
    </Modal>
  );
};
