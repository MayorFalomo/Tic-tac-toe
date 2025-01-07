'use client';
import Homepage from '@/components/homepage/home/Homepage';
import SignUp from '@/components/signup/SignUp';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <main className="flex min-h-screen ">
      <Toaster />
      <SignUp />
      {/* <Homepage /> */}
    </main>
  );
}
