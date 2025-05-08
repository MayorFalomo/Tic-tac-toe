import Link from 'next/link';
import React from 'react';
import { Home, Info, Settings } from 'lucide-react';
import clsx from 'clsx';
import { IoIosPeople } from 'react-icons/io';
import { FaEarthAfrica } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

interface IProps {
  navPresent?: boolean;
  navOpen?: boolean;
  className?: string;
}

const Nav: React.FC<IProps> = ({
  navOpen,
  navPresent = false,
  className = 'max-[920px]:hidden',
}) => {
  const navList = [
    {
      id: 1,
      page: 'Game menu',
      link: '/',
    },
    {
      id: 2,
      page: 'Players',
      link: '/players',
    },
    {
      id: 3,
      page: 'Global Chat',
      link: '/global-chat',
    },
    {
      id: 4,
      page: 'Game Info',
      link: '/info',
    },
    {
      id: 5,
      page: 'Settings',
      link: '/settings',
    },
  ];

  const route = usePathname();

  return (
    <div
      className={clsx(
        navOpen && navPresent && 'fixed right-0 top-[70px] z-10 w-[60%] bg-black ',
        !navOpen && navPresent && `max-[620px]:fixed right-[-100vw] top-[70px]`,
        !navPresent && !navOpen && 'w-full max-[620px]:hidden',
        'transition-all duration-500 ease-in-out'
      )}
    >
      <div className="flex flex-col gap-4 p-4 h-full w-full overflow-auto">
        <div className="flex flex-col w-full items-start gap-4 py-4 ">
          {navList.map((item) => (
            <Link
              className={`${
                item.link === route && 'opacity-70 cursor-not-allowed'
              } w-full flex items-center max-[920px]:justify-center gap-3 border-b border-white/40 py-2 `}
              key={item.id}
              href={item.link}
            >
              <span>
                {item?.link === '/' ? (
                  <Home className="icon-glow-frost" />
                ) : item?.link === '/info' ? (
                  <Info className="icon-glow-emerald" />
                ) : item?.link === '/players' ? (
                  <IoIosPeople className="icon-glow-ocean" size={24} />
                ) : item?.link === '/global-chat' ? (
                  <FaEarthAfrica className="icon-glow-gold" />
                ) : (
                  <Settings className="icon-glow-solar" />
                )}
              </span>
              {
                <span
                  className={clsx(
                    item?.id === 1 && 'text-gradient text-gradient-nebula',
                    item?.id === 2 && 'text-gradient text-gradient-ocean',
                    item?.id === 4 && 'text-gradient text-gradient-emerald',
                    item?.id === 5 && 'text-gradient text-gradient-solar',
                    item?.id === 3 && 'text-gradient text-gradient-cosmic-gold',
                    navOpen && navPresent && 'max-[920px]:flex',
                    !navOpen && navPresent && 'max-[920px]:hidden max-[620px]:flex',
                    !navOpen && !navPresent && { className }
                  )}
                >
                  {item?.page}{' '}
                </span>
              }
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Nav;
