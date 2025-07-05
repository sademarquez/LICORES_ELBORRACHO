
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/css/styles.css';
import './assets/css/components.css';
import './assets/css/responsive.css';

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import InstallButton from './components/InstallButton';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <InstallButton />
          <h1>Licores El Borracho</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
