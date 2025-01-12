import React from 'react';
import { Button } from '../ui/button';
import { EarthIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/ThemeContext';

type Props = {};

const GameMenu = (props: Props) => {
  const { currentTheme } = useTheme();
  return (
    <div
      className={`h-screen w-screen ${
        currentTheme === 'light' ? 'bg-[#0A4834] text-[#9F8151]' : 'bg-black'
      } `}
    >
      <div className="h-full flex items-center justify-center ">
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
          <Link className="w-[40%] max-[540px]:w-[70%] mt-[40px]" href="/signup">
            <Button
              className={`w-[100%]  cursor-pointer text-[16px] ${
                currentTheme === 'light'
                  ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                  : 'text-white hover:border hover:border-white'
              } `}
            >
              <span> Play Game</span>
            </Button>
          </Link>
          <Link className="w-[40%]  max-[540px]:w-[70%]" href="/players">
            <Button
              className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                currentTheme === 'light'
                  ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                  : 'text-white hover:border hover:border-white'
              } hover:border-white`}
            >
              <span>
                <EarthIcon />{' '}
              </span>
              <span>View Players </span>
            </Button>
          </Link>
          <Link className="w-[40%]  max-[540px]:w-[70%]" href="/settings">
            <Button
              className={`w-[100%] flex items-center gap-4 py-3 cursor-pointer text-[16px] ${
                currentTheme === 'light'
                  ? 'bg-transparent text-[#9F8151] border hover:bg-white'
                  : 'text-white hover:border hover:border-white'
              } hover:border-white`}
            >
              <span>
                <Settings />{' '}
              </span>
              <span>Settings </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
