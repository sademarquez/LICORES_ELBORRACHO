import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './HeroCarousel.css';

export const HeroCarousel = ({ banners }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {banners.map((banner, index) => (
          <div className="embla__slide" key={index}>
            <img className="embla__slide__img" src={banner.imageUrl} alt={banner.title} />
            <div className="embla__slide__content">
              <h2>{banner.title}</h2>
              <p>{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};