'use client';
import FadeIn from '../animation/FadeIn';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
// import { userDetails } from '../types/types';
import ProgressBar from '../animation/ProgressBar';
import VSDivider from '@/components/VsDivider';
import PlayerCard from '@/components/PlayerCard';
import StartButton from '@/components/StartButton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  // const currentUser = useAppSelector((state: RootState) => state.user as userDetails);
  const playersObject = useAppSelector((state: RootState) => state.players.players);

  const router = useRouter();

  const handleStartGame = () => {
    // console.log('Game starting...');
    router.push('/battle');
  };

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [loadingTime, setLoadingTime] = useState(3000);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 100 / (loadingTime / 100);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    // Cleanup interval
    return () => clearInterval(interval);
  }, [loadingTime]);

  useEffect(() => {
    // When progress reaches 100%, set loading to false after a small delay
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setIsReady(true), 500); // Delay showing the start button
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <FadeIn>
      <div className="relative min-h-screen w-full bg-black flex flex-col items-center overflow-hidden px-4">
        {/* Player 1 (Blue) lighting effect */}
        <div className="absolute top-[60px] left-0 w-1/2 h-full">
          <div className="absolute border inset-0 bg-blue-500/15 blur-3xl"></div>
        </div>

        {/* Player 2 (Red) lighting effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-red-500/15 blur-3xl"></div>
        </div>

        {/* Battle title */}
        <div className="relative z-10 mb-10 text-center mt-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient text-gradient-neo-plasma tracking-tight">
            BATTLE ARENA
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Prepare for the ultimate face-off
          </p>
        </div>

        {/* Main content container */}
        <div className="relative z-10 w-full max-w-4xl">
          <div className="grid sm:grid-cols-7 max-sm:flex max-sm:justify-center gap-4 mb-[40px] items-center">
            {/* Player 1 */}
            <div className="sm:col-span-3 w-full">
              <PlayerCard
                player={playersObject?.playerOne}
                position="left"
                isLoading={isLoading}
              />
            </div>

            {/* VS Divider */}
            <div className="sm:col-span-1 py-4 sm:py-0">
              <VSDivider isLoading={isLoading} />
            </div>

            {/* Player 2 */}
            <div className="sm:col-span-3 w-full">
              <PlayerCard
                player={playersObject?.playerTwo}
                position="right"
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Progress bar container */}
          <div className="mt-[50px] px-4 md:px-12">
            <ProgressBar progress={progress} />
          </div>

          {/* Start button container */}
          <div className="mt-8 flex justify-center">
            <StartButton isReady={isReady} onClick={handleStartGame} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
