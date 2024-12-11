'use client';
import Homepage from '@/components/homepage/home/Homepage';
import Image from 'next/image';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <main className="flex min-h-screen ">
      <Toaster />
      <Homepage />
    </main>
  );
}
