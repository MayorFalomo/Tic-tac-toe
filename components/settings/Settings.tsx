'use client';
import React, { useCallback, useEffect } from 'react';
import { Checkbox } from '../ui/checkbox';
import { useAudio } from '@/contexts/AudioContext';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch } from '@/lib/hooks';
import {
  changeIconColor,
  changeNotifBg,
  setTrackSound,
} from '@/lib/features/TrackerSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import FadeIn from '@/app/animation/FadeIn';
import Bouncy from '@/app/animation/Bouncy';
import { motion } from 'framer-motion';
import { settingsBtnStyle } from '@/app/animation/constants';
import { GoArrowLeft } from 'react-icons/go';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const track = useSelector((state: RootState) => state?.track);
  const { play, stop } = useAudio();
  const { currentTheme, setCurrentTheme } = useTheme();

  useEffect(() => {
    if (track?.trackSound) {
      play();
    } else {
      stop();
    }
  }, [track?.trackSound]);

  const handleSoundControl = useCallback(() => {
    dispatch(setTrackSound(!track.trackSound));
  }, [track?.trackSound]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const handleNotifBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeNotifBg(e.target.value));
    localStorage.setItem('notifBg', e.target.value);
  };

  const iconColors = [
    {
      id: 1,
      color: 'icon-glow-plasma',
      name: 'Plasma',
    },
    {
      id: 2,
      color: 'icon-glow-frost',
      name: 'Frost',
    },
    {
      id: 3,
      color: 'icon-glow-emerald',
      name: 'Emerald',
    },
    {
      id: 4,
      color: 'icon-glow-nebula',
      name: 'Nebula',
    },
    {
      id: 5,
      color: 'icon-glow-solar',
      name: 'Solar',
    },
    {
      id: 6,
      color: 'icon-glow-ocean',
      name: 'Ocean',
    },
    {
      id: 7,
      color: 'icon-glow-gold',
      name: 'Gold',
    },
  ];

  const res = () => {};

  return (
    <FadeIn>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen' : 'bg-black'
        } transition-all duration-500 w-screen h-screen flex items-center justify-center`}
      >
        <div
          className={`${
            currentTheme === 'light'
              ? 'bg-white text-golden'
              : `${settingsBtnStyle} text-white`
          } h-[50%] max-[480px]:h-[70%] w-[50%] min-w-[400px] max-[500px]:min-w-[200px] max-[500px]:w-[90%] rounded-md mx-auto`}
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 12,
              mass: 1.2,
              velocity: 2,
            }}
            className="ml-5 max-[400px]:ml-3 mt-4"
          >
            <Link href="/">
              <span>{<GoArrowLeft size={24} />} </span>
            </Link>
          </motion.div>
          <Bouncy
            delay={0.2}
            className="flex items-center justify-between space-x-2 w-[90%] mx-auto mt-[30px] "
          >
            <label
              htmlFor="settings"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use Sound
            </label>
            {track?.trackSound ? (
              <Checkbox onClick={handleSoundControl} id="stopSound" />
            ) : (
              <Checkbox
                onClick={handleSoundControl}
                className="text-white bg-white border border-white"
                id="applySound"
              />
            )}
          </Bouncy>

          <Bouncy
            delay={0.4}
            className="flex items-center justify-between space-x-2 w-[90%] mx-auto mt-[30px]"
          >
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
          </Bouncy>
          <Bouncy
            delay={0.6}
            className="flex justify-between items-center w-[90%] mx-auto mt-[30px]"
          >
            <p className="text-sm font-medium leading-6 peer-disabled:cursor-not-allowed peer-disabled">
              Change bg of notification bar
            </p>
            <div className="flex items-center gap-3">
              <span>{track?.notifBg ?? ''} </span>
              <input
                className=" cursor-pointer"
                onChange={handleNotifBgChange}
                type={'color'}
                value={track?.notifBg}
              />
            </div>
          </Bouncy>
          <Bouncy
            delay={0.8}
            className="min-[480px]:flex max-[480px]:flex-col justify-between max-[480px]:items-start min-[480px]:items-center w-[90%] mx-auto mt-[30px]"
          >
            <p className="text-sm font-medium leading-6 peer-disabled:cursor-not-allowed peer-disabled">
              Change notification icon color
            </p>
            <div className=" gap-3">
              <Select
                onValueChange={(value) => {
                  dispatch(changeIconColor(value));
                }}
              >
                <SelectTrigger
                  className={`w-[200px] max-[480px]:w-full bg-transparent rounded-none border-b-white text-white/60 border-b border outline-none border-x-0 border-t-0 text-[16px] focus:ring-offset-0 focus:ring-0`}
                >
                  <SelectValue
                    className="text-[14px] placeholder:text-white"
                    placeholder="Select your color"
                  />
                </SelectTrigger>
                <SelectContent className="flex w-full">
                  <SelectGroup className=" w-full">
                    <SelectLabel className="px-2 ">
                      Select your preferred icon color{' '}
                    </SelectLabel>
                    {iconColors.map((color) => (
                      <SelectItem
                        className="flex  px-2 py-2 w-full"
                        key={color?.id}
                        value={color.color}
                      >
                        <p className="min-w-full w-[230px] max-[480px]:w-[300px] flex items-center justify-between whitespace-nowrap">
                          {color.name}
                          <Bell className={`${color.color}`} size={14} />
                        </p>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </Bouncy>
        </div>
      </div>
    </FadeIn>
  );
};

export default Settings;
