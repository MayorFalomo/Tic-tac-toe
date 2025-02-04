'use client';
import GameMenu from '@/components/gameMenu/GameMenu';
import Homepage from '@/components/homepage/home/Homepage';
import Preload from '@/components/Preload';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const playerId = useAppSelector((state: RootState) => state.user.playerId);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 2800);
  }, []);

  return (
    <main className="flex max-h-screen h-screen overflow-y-hidden transition-all duration-500">
      <Toaster />
      {!loading ? <Preload /> : playerId ? <Homepage /> : <GameMenu />}
    </main>
  );
}
