'use client';
import GameMenu from '@/components/gameMenu/GameMenu';
import Preload from '@/components/Preload';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionActive = sessionStorage.getItem('sessionActive');

    if (!sessionActive) {
      setIsLoading(true);

      sessionStorage.setItem('sessionActive', 'true');

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 4000);

      return () => clearTimeout(timer); // Cleanup the timer
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="flex max-h-screen h-screen overflow-y-hidden overflow-x-hidden transition-all duration-500">
      <Toaster />
      <AnimatePresence>{isLoading ? <Preload /> : <GameMenu />}</AnimatePresence>
    </main>
  );
}
