import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { EarthIcon, Gamepad2, Info, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch } from '@/lib/hooks';
import { changeNotifBg } from '@/lib/features/TrackerSlice';
import FadeIn from '@/app/animation/FadeIn';
import Bouncy from '@/app/animation/Bouncy';
import ProfileHeader from '../Profile/ProfileHeader';
import {
  gameInfoStyle,
  globalChatStyle,
  playGameStyle,
  settingsBtnStyle,
  viewPlayersStyle,
} from '@/app/animation/constants';
import { IoIosPeople } from 'react-icons/io';
import { FaEarthAfrica } from 'react-icons/fa6';

type Props = {};

const GameMenu = (props: Props) => {
  const { currentTheme } = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const retrievedNotifBg = localStorage.getItem('notifBg');
    if (retrievedNotifBg) {
      dispatch(changeNotifBg(retrievedNotifBg));
    }
  }, []);

  return (
    <FadeIn>
      <div
        className={`relative h-screen w-screen ${
          currentTheme === 'light' ? 'bg-[#0A4834] text-[#9F8151]' : 'bg-black'
        } `}
      >
        {/* <div className="absolute rounded-full w-[30%] h-[30%] -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 blur-xl"></div> */}
        <div className="w-[90%] mx-auto flex items-center justify-end py-2 text-brightGreen">
          <ProfileHeader />
        </div>
        <div className="h-[80%] flex items-center justify-center ">
          <div className="flex flex-col justify-between items-center gap-[30px] w-full ">
            <div className=" flex items-center gap-[40px] text-white">
              <Image
                src="/SelectX.png"
                className="m-auto w-[70px] h-[70px]"
                width={70}
                height={70}
                alt="img"
              />
              <span
                className={`${
                  currentTheme === 'light' ? 'text-brightGreen' : 'text-brightGreen'
                } text-[30px]`}
              >
                &{' '}
              </span>
              <Image
                src="/SelectO.png"
                className="m-auto w-[70px] h-[70px] "
                width={70}
                height={70}
                alt="img"
              />
            </div>
            <Bouncy delay={0.2} className="w-[40%] max-[600px]:w-[70%] mt-[40px]">
              <Link href="/signup">
                <Button
                  className={`w-[100%] flex items-center gap-4 cursor-pointer text-[16px] ${
                    currentTheme === 'light'
                      ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                      : `${playGameStyle} pulse-animation`
                  } `}
                >
                  <span>
                    <Gamepad2 />{' '}
                  </span>
                  <span>Play Game</span>
                </Button>
              </Link>
            </Bouncy>
            <Bouncy delay={0.4} className="w-[40%]  max-[600px]:w-[70%]">
              <Link href="/players">
                <Button
                  className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                    currentTheme === 'light'
                      ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                      : gameInfoStyle
                  } hover:border-white`}
                >
                  <span>
                    <IoIosPeople size={24} />{' '}
                  </span>
                  <span>View Players </span>
                </Button>
              </Link>
            </Bouncy>

            <Bouncy delay={0.6} className="w-[40%] max-[600px]:w-[70%]">
              <Link href="/global-chat">
                <Button
                  className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                    currentTheme === 'light'
                      ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                      : globalChatStyle
                  } hover:border-white`}
                >
                  <FaEarthAfrica className="icon-glow-nebula" />{' '}
                  <span className="text-gradient text-gradient-nebula">Global Chat </span>
                </Button>
              </Link>
            </Bouncy>
            <Bouncy delay={0.8} className="w-[40%]  max-[600px]:w-[70%]">
              <Link href="/settings">
                <Button
                  className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                    currentTheme === 'light'
                      ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                      : settingsBtnStyle
                  } hover:border-white`}
                >
                  <span>
                    <Settings />{' '}
                  </span>
                  <span>Settings </span>
                </Button>
              </Link>
            </Bouncy>

            <Bouncy delay={1} className="w-[40%]  max-[600px]:w-[70%]">
              <Link href="/info">
                <Button
                  className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                    currentTheme === 'light'
                      ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                      : viewPlayersStyle
                  } hover:border-white`}
                >
                  <span>
                    <Info />{' '}
                  </span>
                  <span className=""> Game Info </span>
                </Button>
              </Link>
            </Bouncy>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default GameMenu;
