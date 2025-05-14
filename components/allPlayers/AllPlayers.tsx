'use client';
import React, { useEffect, useState } from 'react';
import { getAllPlayers, handlePlayersStatus } from '../funcs/HandleAuth';
import { LoadingState, PlayerStatus, SessionPlayerDetails } from '@/app/types/types';
import Image from 'next/image';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import FadeIn from '@/app/animation/FadeIn';
import { Button } from '../ui/button';
import { db as database } from '@/firebase-config/firebase';
import { useAppDispatch } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import {
  setCombinedChattingId,
  setSelectedPlayer,
} from '@/lib/features/ChatAPlayerSlice';
import { formatDateToDMY } from '@/app/utils/date';
import {
  childVariants,
  staggerContainer,
  viewPlayersStyle,
} from '@/app/animation/constants';
import { Skeleton } from '../ui/skeleton';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { usePlayer } from '@/contexts/UserContext';

interface IPlayers extends SessionPlayerDetails {
  status: string;
  createdAt: string;
}

const AllPlayers = () => {
  const [getPlayers, seGetPlayers] = useState<IPlayers[]>([]);
  const [singlePlayer, setSinglePlayer] = useState<IPlayers | null>(null);
  const [loading, setLoading] = useState<string>(LoadingState.LOADING);

  const dispatch = useAppDispatch();
  const navigate = useRouter();
  const { currentTheme } = useTheme();
  const { currentUser } = usePlayer();

  //React to changes for players as they happen
  useEffect(() => {
    const getAllPlayersRef = collection(database, 'players');
    const allPlayersQuery = query(getAllPlayersRef);

    const unsubscribePlayers = onSnapshot(allPlayersQuery, (snapshot) => {
      const updatedPlayers: IPlayers[] = [];

      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const playersArr = doc.data() as IPlayers;
          updatedPlayers.push(playersArr);
        }
      });

      seGetPlayers(updatedPlayers);
    });

    return () => {
      unsubscribePlayers();
    };
  }, []);

  // Function to fetch player data from IndexedDB
  // const fetchPlayerData = async () => {
  //   const data = await getData();
  //   if (data) {
  //     dispatch(setAPlayer(data));
  //     setLoading(LoadingState.SUCCESS);
  //   }
  // };

  //UseEffect to get data from db
  // useEffect(() => {
  //   setLoading(LoadingState.LOADING);
  //   if (db) {
  //     fetchPlayerData();
  //   }
  // }, [db]);

  useEffect(() => {
    const retrievedKey = currentUser?.userId;
    if (retrievedKey) {
      //Set a players status to active first on realtime db
      handlePlayersStatus(retrievedKey, PlayerStatus.ONLINE);
    }
    const gotten = getAllPlayers();
    if (gotten) {
      gotten.then((res: any) => {
        if (retrievedKey) {
          const filtered = res.filter((player: any) => player.id === retrievedKey);
          setSinglePlayer(filtered);
          setLoading(LoadingState.SUCCESS);
        }
        seGetPlayers(res);
      });
    }
  }, []);

  const handleChats = async () => {
    dispatch(setCombinedChattingId(''));
    dispatch(
      setSelectedPlayer({
        name: singlePlayer?.name,
        avatar: singlePlayer?.avatar,
        id: singlePlayer?.id,
        networkState: singlePlayer?.status,
      })
    );

    navigate.push('/chats');
  };

  return (
    <FadeIn>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        } min-h-full grid grid-cols-[300px_auto_300px] max-[950px]:grid-cols-[270px_auto_250px] max-[900px]:grid-cols-[270px_auto_0] max-[600px]:grid-cols-[230px_auto_0] max-[550px]:flex max-[550px]:flex-col-reverse h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto">
          <h1
            className={`${
              currentTheme === 'light' ? 'text-golden' : 'text-white'
            }  pt-1 mb-4 text-[24px]`}
          >
            <Link className="flex items-center gap-3" href="/">
              <FaArrowLeftLong className="icon-glow-frost" size={18} />
              <span className="text-gradient text-gradient-ocean">Tic-Tac-Toe</span>
            </Link>
          </h1>
          <div>
            {loading === LoadingState?.SUCCESS ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-4 items-start"
              >
                {getPlayers?.map((res: IPlayers, index: number) => (
                  <motion.ul
                    variants={childVariants}
                    key={index}
                    onClick={() => setSinglePlayer(res)}
                    className="w-full cursor-pointer"
                    initial="hidden"
                    animate="show"
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
                            {res?.createdAt && formatDateToDMY(res?.createdAt)}{' '}
                          </span>
                        </p>
                      </div>
                      <span
                        className={clsx(
                          `h-3 w-3 rounded-full`,
                          res?.status === PlayerStatus.INGAME &&
                            res?.name &&
                            'bg-blue-500',
                          res?.status === PlayerStatus.LOOKING &&
                            res?.name &&
                            'bg-white/40',
                          res?.status === PlayerStatus.ONLINE &&
                            res?.name &&
                            'bg-green-500',
                          res?.status === PlayerStatus.OFFLINE &&
                            res?.name &&
                            'bg-red-500',
                          res?.status === '' && 'bg-transparent'
                        )}
                      >
                        {' '}
                      </span>
                    </li>
                  </motion.ul>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-6 space-x-4">
                <div className="flex flex-col gap-4 mt-3 space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-[40px] w-[40px]  rounded-full bg-white" />
                      <Skeleton className="h-[50px] w-[190px] max-w-full bg-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-full overflow-auto">
          <div className="w-full flex items-center justify-between bg-white py-4 px-2">
            <Link className="w-fit mt-3" href="/">
              <span className="cursor-pointer w-fit text-black">{<ArrowLeft />} </span>
            </Link>
            <div>
              <Button
                onClick={handleChats}
                disabled={
                  currentUser?.userId === singlePlayer?.id
                    ? true
                    : currentUser?.userId && singlePlayer?.id
                    ? false
                    : true
                }
                className={clsx(
                  currentUser?.userId === singlePlayer?.id && 'cursor-not-allowed',
                  currentUser?.userId!?.length < 1 && 'cursor-not-allowed',
                  !singlePlayer?.id && 'cursor-not-allowed',
                  `cursor-pointer bg-black`
                )}
              >
                Message {singlePlayer?.name}{' '}
              </Button>
            </div>
          </div>
          {singlePlayer ? (
            <div
              className={`${viewPlayersStyle} relative h-full pb-[30px] max-[550px]:pb-0`}
            >
              {singlePlayer?.avatar ? (
                <div
                  style={{
                    backgroundImage: `url(${singlePlayer?.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top',
                  }}
                  className={`h-[100vh] ${viewPlayersStyle} max-[550px]:h-full w-full`}
                >
                  {singlePlayer?.avatar && (
                    <p className="w-full h-full hover:bg-transparent bg-black/30 transition-all duration-500 "></p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Select a players profile</p>
                </div>
              )}
              <div className="absolute bottom-[5%] text-white left-[30px] z-10 text-[20px] max-[600px]:text-[17px] mb-[10px]">
                <h2 className="flex items-center gap-3 mt-[30px]  px-3 ">
                  <span>Players Name:</span>
                  <span>{singlePlayer?.name}</span>
                </h2>
                <p className="flex items-center gap-3 mt-[5px] px-3 pb-2 ">
                  <span>Player Status:</span>
                  <span>
                    {singlePlayer?.status ? singlePlayer?.status : ''}
                    {singlePlayer?.status && (
                      <span
                        className={clsx(
                          singlePlayer?.status === PlayerStatus.ONLINE &&
                            'w-5 h-5 bg-brightGreen',
                          singlePlayer?.status === PlayerStatus.OFFLINE && '',
                          singlePlayer?.status === PlayerStatus.INGAME
                        )}
                      ></span>
                    )}
                  </span>
                </p>
                <p className="flex items-center gap-3 px-3 pb-2 ">
                  <span>Date Joined:</span>
                  <span>
                    {singlePlayer?.createdAt
                      ? formatDateToDMY(singlePlayer?.createdAt)
                      : ''}
                  </span>
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
        <div
          className={`max-[900px]:hidden ${viewPlayersStyle} h-fit w-[95%] mx-auto flex flex-col gap-4 mt-[30px] py-[30px] px-4 text-[16px] rounded-[20px]`}
        >
          <p className="relative">
            Players Statuses
            <motion.span
              initial={{ width: 0 }}
              animate={{
                width: '120px',
                transition: {
                  duration: 0.7,
                },
              }}
              className={`${
                currentTheme === 'light' ? 'bg-brightGreen' : 'bg-white/30'
              } absolute left-0 -bottom-1 h-0.5 w-full`}
            ></motion.span>
          </p>
          <ul className="w-[95%] mx-auto flex flex-col gap-4 py-[10px]">
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
      </div>
    </FadeIn>
  );
};

export default AllPlayers;
