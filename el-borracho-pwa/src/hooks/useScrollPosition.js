
import { useState, useEffect } from 'react';

export const useScrollPosition = (elementRef) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      setScrollPosition(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [elementRef]);

  return scrollPosition;
};
