'use client';
import GameMenu from '@/components/gameMenu/GameMenu';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <main className="flex max-h-screen h-screen overflow-y-hidden transition-all duration-500">
      <Toaster />
      {<GameMenu />}
    </main>
  );
}
