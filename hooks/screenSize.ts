import { useEffect, useState } from 'react';

export const useScreenSize = (width: number) => {
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > width);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > width);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width]);

  return isWideScreen;
};