
import React from 'react';
import productsData from '../assets/products.json';

const HomePage = () => {
  return (
    <div className="product-list">
      {productsData.map(product => (
        <div key={product.id} className="product-card">
          <img src={`/images/products/${product.image}`} alt={product.name} />
          <h2>{product.name}</h2>
          <p>${product.price}</p>
          <button>Añadir al carrito</button>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
