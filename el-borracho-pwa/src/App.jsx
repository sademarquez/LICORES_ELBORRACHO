
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { useCart } from './context/CartContext';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import './App.css';
import './components/CartSidebar.css'; // Import cart styles
import './components/CheckoutModal.css'; // Import checkout styles

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, toggleCart, cartItems } = useCart();

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsQuery = query(collection(db, 'products'), orderBy('name'));
        const productSnapshot = await getDocs(productsQuery);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setError(null);
      } catch (err) {
        console.error("Error fetching products: ", err);
        setError("No se pudieron cargar los productos. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="App">
      <CartSidebar />
      <CheckoutModal />
      <header className="App-header">
        <div className="logo">EL BORRACHO</div>
        <div className="cart-icon" onClick={toggleCart}>
          🛒
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
        </div>
      </header>
      <main>
        <h1 className="main-title">Nuestros Productos</h1>
        {loading && <p className="loading-text">Cargando...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price.toLocaleString('es-CO')}</p>
                    <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay productos disponibles en este momento.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
