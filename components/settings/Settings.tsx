'use client';
import React, { useEffect, useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { useAudio } from '@/app/AudioContext';
import useSound from 'use-sound';
import { ArrowLeft } from 'lucide-react';
import got from '@/got.mp3';
import Link from 'next/link';
import { useTheme } from '@/app/ThemeContext';

const Settings = () => {
  const [playSound, setPlaySound] = useState<boolean>(false);
  const { play, stop } = useAudio();

  // const { playSound, pauseSound, isPlaying } = useAudio();
  // const [play, { stop }] = useSound(
  //   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  //   {
  //     volume: 1,
  //   }
  // );
  // let audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  // const handleClick = () => {
  //   audio.play();
  // };

  const handleClick = () => {
    setPlaySound(!playSound);
  };

  useEffect(() => {
    if (playSound) {
      play();
    } else {
      stop();
    }
  }, [playSound]);

  const { currentTheme, setCurrentTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };
  console.log(currentTheme, 'currentTheme');

  return (
    <div
      className={`${
        currentTheme === 'light' ? 'bg-royalGreen' : 'bg-black'
      } w-screen h-screen flex items-center justify-center`}
    >
      <div
        className={`${
          currentTheme === 'light' ? 'bg-white text-golden' : 'bg-brightGreen text-white'
        } h-[50%] w-[50%] min-w-[400px] max-[500px]:min-w-[200px] max-[500px]:w-[90%] rounded-md mx-auto`}
      >
        <div className="ml-5 mt-4">
          <Link href="/">
            <span>{<ArrowLeft />} </span>
          </Link>
        </div>
        <div className="flex items-center justify-between space-x-2 w-[90%] mx-auto mt-[30px] ">
          <label
            htmlFor="settings"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Use Sound
          </label>
          {playSound ? (
            <Checkbox onClick={handleClick} id="stopSound" />
          ) : (
            <Checkbox onClick={handleClick} id="applySound" />
          )}
        </div>
        <div className="flex items-center justify-between space-x-2 w-[90%] mx-auto mt-[30px]">
          <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {currentTheme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          </p>

          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div
              onClick={() =>
                handleThemeChange(currentTheme === 'dark' ? 'light' : 'dark')
              }
              className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
