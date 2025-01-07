'use client';
import Homepage from '@/components/homepage/home/Homepage';
import SignUp from '@/components/signup/SignUp';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
// import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const playerId = useAppSelector((state: RootState) => state.user.playerId);

  return (
    <main className="flex min-h-screen overflow-y-hidden ">
      <Toaster />
      {playerId ? <Homepage /> : <SignUp />}
    </main>
  );
}
