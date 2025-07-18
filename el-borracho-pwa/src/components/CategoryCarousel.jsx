
import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import './CategoryCarousel.css';

// Re-using the ProductCard component structure
const ProductCard = ({ product, onAddToCart }) => (
  <motion.div 
    className="product-card-carousel"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ translateY: -5 }}
  >
    <div className="product-image-container">
      <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
    </div>
    <div className="product-details">
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">${product.price.toLocaleString('es-CO')}</p>
      <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
        Agregar
      </button>
    </div>
  </motion.div>
);

export const CategoryCarousel = ({ category, products }) => {
  const { addToCart } = useCart();

  return (
    <section className="category-section">
      <h2 className="category-title">{category}</h2>
      <div className="carousel-container">
        <motion.div className="carousel-track">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
