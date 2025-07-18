import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CategoryCarousel } from './components/CategoryCarousel';
import { HeroCarousel } from './components/HeroCarousel';
import './App.css';
import './components/CartSidebar.css';
import './components/CheckoutModal.css';
import './components/Header.css';
import './components/BottomNav.css';
import './components/CategoryCarousel.css';
import './components/HeroCarousel.css';

const banners = [
  {
    imageUrl: '/banners/banner-cervezas.jpg',
    title: 'Cervezas del Mundo',
    subtitle: 'Descubre nuestra selección importada y artesanal.'
  },
  {
    imageUrl: '/banners/banner-licores-premium.png',
    title: 'Licores Premium',
    subtitle: 'Para celebrar momentos inolvidables.'
  },
  {
    imageUrl: '/banners/banner-snacks.jpg',
    title: 'Snacks y Acompañantes',
    subtitle: 'El complemento perfecto para tu bebida.'
  }
];

function App() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAgeVerified, setIsAgeVerified] = useState(null);

  useEffect(() => {
    const ageVerified = localStorage.getItem('ageVerified') === 'true';
    setIsAgeVerified(ageVerified);

    if (ageVerified) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(collection(db, 'products'), orderBy('name'));
      const productSnapshot = await getDocs(productsQuery);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const groupedProducts = productList.reduce((acc, product) => {
        const category = product.category || 'Otros';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      setProductsByCategory(groupedProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching products: ", err);
      setError("No se pudieron cargar los productos. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgeConfirmation = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsAgeVerified(true);
    fetchProducts();
  };

  if (isAgeVerified === null) {
    return null; 
  }

  if (!isAgeVerified) {
    return <AgeVerificationModal open={true} onConfirm={handleAgeConfirmation} />;
  }

  return (
    <div className="App">
      <CartSidebar />
      <CheckoutModal />
      <Header />
      <main>
        <HeroCarousel banners={banners} />
        {loading && <p className="loading-text">Cargando...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          Object.keys(productsByCategory).map(category => (
            <CategoryCarousel 
              key={category}
              category={category}
              products={productsByCategory[category]}
            />
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;