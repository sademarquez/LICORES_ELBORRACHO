
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HeroCarousel.css';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const HeroCarousel = ({ banners }) => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const imageIndex = ((page % banners.length) + banners.length) % banners.length;

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [page]);

  return (
    <div className="hero-carousel-container">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          src={banners[imageIndex].imageUrl}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="hero-image"
        />
      </AnimatePresence>
      <div className="hero-content">
        <h2>{banners[imageIndex].title}</h2>
        <p>{banners[imageIndex].subtitle}</p>
      </div>
      <div className="next" onClick={() => paginate(1)}>
        {'‣'}
      </div>
      <div className="prev" onClick={() => paginate(-1)}>
        {'‣'}
      </div>
    </div>
  );
};
