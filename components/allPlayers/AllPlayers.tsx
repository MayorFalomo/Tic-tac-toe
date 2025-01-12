'use client';
import React, { useEffect, useState } from 'react';
import { getAllPlayers, handlePlayersStatus } from '../funcs/HandleAuth';
import { SessionPlayerDetails } from '@/app/types/types';
import Image from 'next/image';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '../signup/Loader';
import { useTheme } from '@/app/ThemeContext';

interface IPlayers extends SessionPlayerDetails {
  status: string;
  createdAt: string;
}

const AllPlayers = () => {
  const [getPlayers, seGetPlayers] = useState<IPlayers[]>([]);
  const [singlePlayer, setSinglePlayer] = useState<IPlayers | null>(null);

  useEffect(() => {
    const retrievedKey = localStorage.getItem('playerKey');
    if (retrievedKey) {
      //Set a players status to active first on realtime db
      handlePlayersStatus(retrievedKey, 'online');
    }
    const gotten = getAllPlayers();
    if (gotten) {
      gotten.then((res: any) => {
        console.log(res, 'results');
        if (retrievedKey) {
          console.log(retrievedKey, 'retrived');
          const filtered = res.filter((player: any) => player.id === retrievedKey);
          setSinglePlayer(filtered);
        }
        seGetPlayers(res);
      });
    }
    // seGetPlayers(gotten);
  }, []);

  function formatDateToDMY(isoDate: string) {
    const date = new Date(isoDate);

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    // Return the formatted date
    return `${day}/${month}/${year}`;
  }

  // getPlayers.map((res) => console.log(res, 'results'));
  console.log(singlePlayer, 'singlePlayer');

  const { currentTheme } = useTheme();

  return (
    <div
      className={`${
        currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
      } grid grid-cols-[300px_auto_300px] max-[950px]:grid-cols-[270px_auto_250px] max-[900px]:grid-cols-[270px_auto_0] max-[600px]:grid-cols-[230px_auto_0] max-[550px]:flex max-[550px]:flex-col-reverse h-screen overflow-hidden w-full text-white`}
    >
      <div className="h-full w-full border-r border-white/40 p-4 overflow-auto">
        <h1
          className={`${
            currentTheme === 'light' ? 'text-golden' : 'text-white'
          } pt-1 mb-3 px-3 text-[24px]`}
        >
          Tic-Tac-Toe
        </h1>
        <div className="flex flex-col gap-4 items-start">
          {getPlayers ? (
            getPlayers?.map((res: IPlayers) => (
              <ul
                onClick={() => setSinglePlayer(res)}
                className="w-full cursor-pointer"
                key={res?.id}
              >
                <li className="flex items-center justify-between w-full">
                  <div className="flex items-start gap-3 ">
                    {res.avatar && (
                      <Image
                        src={res?.avatar}
                        width={40}
                        height={40}
                        className="w-[40px] h-[40px] object-cover object-top rounded-full border border-white/60"
                        alt="avatar"
                      />
                    )}
                    <p className="flex flex-col items-start ">
                      <span className="">{res?.name}</span>
                      <span className="text-[12px]">
                        {formatDateToDMY(res?.createdAt)}{' '}
                      </span>
                    </p>
                  </div>
                  <span
                    className={clsx(
                      `h-3 w-3 rounded-full`,
                      res?.status === 'inGame' && 'bg-blue-500',
                      res?.status === 'looking' && 'bg-white/40',
                      res?.status === 'online' && 'bg-green-500',
                      res?.status === 'offline' && 'bg-red-500'
                    )}
                  >
                    {' '}
                  </span>
                </li>
              </ul>
            ))
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      <div className=" border-r border-white/40">
        <div className="w-full p-4 bg-white/20">
          <Link href="/">
            <span className="cursor-pointer text-white">{<ArrowLeft />} </span>
          </Link>
        </div>
        {singlePlayer ? (
          <div className="h-full">
            <div
              style={{
                backgroundImage: `url(${singlePlayer?.avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
              }}
              className="h-[70vh] max-[550px]:h-[40vh] w-full"
            >
              {singlePlayer?.avatar && (
                <p className="w-full h-full hover:bg-transparent bg-black/30 transition-all duration-500 "></p>
              )}
            </div>
            <div className="text-[20px] max-[600px]:text-[17px]">
              <h2 className="flex items-center gap-3 mt-[30px]  px-3 ">
                <span>Players Name:</span>
                <span>{singlePlayer?.name}</span>
              </h2>
              <p className="flex items-center gap-3 mt-[5px] px-3 pb-2 ">
                <span>Date Created:</span>
                <span>{formatDateToDMY(singlePlayer?.createdAt)}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="">
              <h2 className="text-center">Select a player to view their profile </h2>
              <p className="text-white/50 mx-auto text-center w-[90%]">
                The indicators on the right bar shows the status of the players
              </p>
            </div>
          </div>
        )}
      </div>
      <ul className="max-[900px]:hidden bg-[#0F172A] h-fit w-[95%] mx-auto flex flex-col gap-2 mt-[30px] py-[30px] px-4 text-[16px] rounded-[20px]">
        <li className="flex items-center justify-between gap-[30px]">
          <span>Playing</span>
          <span className="bg-blue-500 h-5 w-5 rounded-full"></span>
        </li>
        <li className="flex items-center justify-between gap-[30px]">
          <span>Looking</span>
          <span className="bg-white/40 h-5 w-5 rounded-full"></span>
        </li>
        <li className="flex items-center justify-between gap-[30px]">
          <span>Online</span>
          <span className="bg-green-500 h-5 w-5 rounded-full"></span>
        </li>
        <li className="flex items-center justify-between gap-[30px]">
          <span>Offline</span>
          <span className="bg-red-500 h-5 w-5 rounded-full"></span>
        </li>
      </ul>
    </div>
  );
};

export default AllPlayers;
