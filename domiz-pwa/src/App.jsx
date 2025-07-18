
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Create a query to get orders, sorted by newest first
    const ordersQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));

    // Set up a real-time listener
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error listening to orders: ", err);
      setError("Failed to connect to the orders feed.");
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleDispatch = (order) => {
    const deliveryPersonPhoneNumber = "573115904597"; // Reemplaza con el número real de tu domiciliario
    
    let message = `*Nuevo Pedido para Despachar*\n\n`;
    message += `*Código de Recogida:* ${order.pickupCode}\n\n`;
    message += `*Cliente:* ${order.customer.name}\n`;
    message += `*Dirección:* ${order.customer.address}\n\n`;
    message += `*Pedido:*\n`;
    order.items.forEach(item => {
      message += `- ${item.name} (x${item.quantity})\n`;
    });
    message += `\n*Total a Cobrar:* $${order.total.toLocaleString('es-CO')}\n`;

    const whatsappUrl = `https://wa.me/${deliveryPersonPhoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DOMIZ - Tablero de Pedidos</h1>
      </header>
      <main>
        {loading && <p>Conectando al feed de pedidos...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <div className="orders-dashboard">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className={`order-card status-${order.status}`}>
                  <div className="order-header">
                    <h3>Pedido de: {order.customer.name}</h3>
                    <span className="pickup-code">{order.pickupCode}</span>
                  </div>
                  <div className="order-body">
                    <p><strong>Dirección:</strong> {order.customer.address}</p>
                    <ul>
                      {order.items.map(item => (
                        <li key={item.id}>{item.name} <strong>(x{item.quantity})</strong></li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-footer">
                    <div className="total">
                      Total: ${order.total.toLocaleString('es-CO')}
                    </div>
                    <button 
                      className="dispatch-btn" 
                      onClick={() => handleDispatch(order)}
                      disabled={order.status !== 'nuevo'}
                    >
                      {order.status === 'nuevo' ? 'Despachar Domiciliario' : `Pedido ${order.status}`}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay pedidos nuevos. Esperando...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
