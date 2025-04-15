'use client';
import GameMenu from '@/components/gameMenu/GameMenu';
import Homepage from '@/components/homepage/home/Homepage';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const playerId = useAppSelector((state: RootState) => state.user.userId);

  return (
    <main className="flex max-h-screen h-screen overflow-y-hidden transition-all duration-500">
      <Toaster />
      {<GameMenu />}
      {/* {playerId ? <Homepage /> : <GameMenu />} */}
    </main>
  );
}
