'use client';
import Homepage from '@/components/homepage/home/Homepage';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <main className="flex min-h-screen ">
      <Toaster />
      <Homepage />
    </main>
  );
}
