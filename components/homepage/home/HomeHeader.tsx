import Tippy from '@tippyjs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CircleStop,
  MessageCircle,
  Music,
  SunIcon,
  MoonIcon,
  Settings,
  StopCircle,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Chat, GameSession } from '@/app/types/types';
import { useWindowSize } from 'react-use';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/app/AudioContext';
import { useTheme } from '@/app/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { changeNotifBg, setTrackSound } from '@/lib/features/TrackerSlice';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { setAPlayerId } from '@/lib/features/userSlice';

type Props = {
  gameData: GameSession | null;
  combinedId: string;
  currentPlayer: string;
  roundWinner: string | null;
  ultimateWinner: string | null;
  setTriggerQuit: (arg: string) => void;
  openModal: boolean;
  setTheChatId: (arg: any) => void;
  setOpenModal: (arg: boolean) => void;
  setPlayerChat: (arg: Chat[]) => void;
};

const HomeHeader: React.FC<Props> = ({
  gameData,
  combinedId,
  currentPlayer,
  roundWinner,
  ultimateWinner,
  setTriggerQuit,
  openModal,
  setTheChatId,
  setOpenModal,
  setPlayerChat,
}) => {
  const { width, height } = useWindowSize(); //For the Cofetti Animation
  const { play, stop } = useAudio();
  const { currentTheme, setCurrentTheme } = useTheme();
  const playersObject = useAppSelector((state: RootState) => state.players.players);
  const track = useAppSelector((state: RootState) => state.track);
  const dispatch = useAppDispatch();
  const router = useRouter();

  //useEffect to control sound state
  useEffect(() => {
    if (track?.trackSound) {
      play();
    } else {
      stop();
    }
  }, [track?.trackSound]);

  //Function to update the theme background
  const handleThemeChange = useCallback(async (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  }, []);

  //Function to update sound state
  const handleSoundControl = useCallback(async () => {
    dispatch(setTrackSound(!track?.trackSound));
  }, [track?.trackSound]);

  //Function to handle notification background change
  const handleNotifBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeNotifBg(e.target.value));
    localStorage.setItem('notifBg', e.target.value);
  };

  //Function to handle when the game is quited
  const handleGameQuit = async (playersName: string) => {
    setTriggerQuit(playersName);
    await updateDoc(doc(db, 'gameSessions', combinedId), {
      quitGame: true,
    });
    await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
      status: 'online',
    });

    dispatch(setAPlayerId(''));
    router.push('/');
  };

  const handleModal = useCallback(async () => {
    //!After the modal opens then I need to...
    //*First I need to check if a player chat already exist between the two players using the combinedId as a check
    //?If I find it, I load the chats between the two players and if not I create a new chat session for the players using their combinedId
    //Meanwhile in my chat modal, when a player sends a message it sends an object containing
    //*Note senderId, message, timestamp, Reaction
    //Then just the way we did the instant update with local state , we do the same thing here with the chat messages
    //So whatever messages we send appears instantly then we can sort it by the id so it shows who is in sender and receiver based on the id for each player.
    setOpenModal(true);
    await loadChat();
  }, [openModal]);

  const createChatSession = async () => {
    const chatRef = collection(db, 'playersChats');
    await addDoc(chatRef, {
      combinedId,
      messages: [],
      unreadMessages: {
        playerOne: 0,
        playerTwo: 0,
      },
      timestamp: new Date(),
    });
  };

  const loadChat = async () => {
    const chatRef = collection(db, 'playersChats');
    const q = query(chatRef, where('combinedId', '==', combinedId));

    // Check if the chat session already exists
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const chatId = querySnapshot.docs[0].id;

      setTheChatId(chatId);
      if (!querySnapshot.empty) {
        // console.log('Chat session found, loading messages.');
        const chats: any = [];
        querySnapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() });
        });
        setPlayerChat(chats[0].messages);
      }
    } else {
      await createChatSession(); // Create new chat session if it doesn't exist
    }
  };

  return (
    <div className="flex max-[650px]:flex-col items-center justify-between min-[650px]:gap-4 px-2 max-[650px]:pt-2 w-full">
      <div className="flex items-center justify-between gap-2 min-[750px]:max-w-[50%] max-[750px]:max-w-[100%] max-[480px]:max-w-[100%] ">
        <div className="flex items-center gap-4">
          <div className="flex items-center w-full max-w-[250px] justify-center gap-[10px]">
            <div className="flex items-start">
              {gameData?.players?.playerOne?.avatar &&
                gameData?.players?.playerTwo?.avatar && (
                  <Image
                    width={40}
                    height={40}
                    src={
                      currentPlayer === gameData?.players?.playerOne?.id
                        ? gameData?.players?.playerOne?.avatar ?? null
                        : gameData?.players?.playerTwo?.avatar ?? null
                    }
                    alt="img"
                    className="w-[50px] h-[50px] min-w-[30px] min-h-[30px] object-cover object-top"
                  />
                )}
            </div>
            <div className="flex flex-col gap-2  border-r border-white/40">
              <h1 className="text-white text-[16px] max-[850px]:text-[14px] max-[350px]:text-[12px] px-2 min-w-[100px] max-[340px]:min-w-[80px] border-b border-white/40 ">
                {currentPlayer === gameData?.players?.playerOne?.id
                  ? gameData?.players?.playerOne?.name.slice(0, 16)
                  : gameData?.players?.playerTwo?.name.slice(0, 12) ?? 'HeavenLy'}
              </h1>

              {
                <Image
                  src="/SelectX.png"
                  className=" w-[30px] h-[30px] m-auto"
                  width={30}
                  height={30}
                  alt="img"
                />
              }
            </div>
          </div>
          <h1 className="text-white text-center font-bold text-[28px] max-[650px]:text-[24px] ">
            {currentPlayer === gameData?.players?.playerOne?.id
              ? gameData?.scores?.playerOne! ?? '0'
              : gameData?.scores?.playerTwo! ?? '0'}{' '}
          </h1>
        </div>
        <p className="text-white text-[24px]"> : </p>
        <div className="flex items-center gap-3 h-full">
          <h1 className="text-white font-bold text-end text-[28px] max-[650px]:text-[24px] ">
            {currentPlayer === gameData?.players?.playerTwo?.id
              ? gameData?.scores?.playerOne! ?? 0
              : gameData?.scores?.playerTwo! ?? 0}{' '}
          </h1>

          <div className="flex flex-col border-l border-white/40 gap-2">
            <h1 className="text-white text-[16px] max-[850px]:text-[14px] max-[350px]:text-[12px] px-2 min-w-[100px] border-b border-white/40 text-end">
              {currentPlayer === gameData?.players?.playerOne?.id
                ? gameData?.players?.playerTwo?.name.slice(0, 16)
                : gameData?.players?.playerOne?.name.slice(0, 16) ?? 'Destroyer'}
            </h1>
            <div className="flex items-start gap-2">
              <Image
                src="/SelectO.png"
                className="m-auto"
                width={30}
                height={30}
                alt="img"
              />
            </div>
          </div>
          <div className=" ">
            {gameData?.players?.playerOne?.avatar! &&
              gameData?.players?.playerTwo?.avatar! && (
                <Image
                  width={40}
                  height={40}
                  src={
                    currentPlayer !== gameData?.players?.playerTwo?.id
                      ? gameData?.players?.playerTwo?.avatar!
                      : gameData?.players?.playerOne?.avatar!
                  }
                  alt="img"
                  className="w-[50px] h-[50px] min-w-[30px] min-h-[30px] object-cover object-top"
                />
              )}
          </div>
        </div>
        <AnimatePresence>
          {ultimateWinner !== null ||
          (roundWinner !== null && roundWinner!?.length > 1) ? (
            <motion.div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(3.6px)',
                WebkitBackdropFilter: 'filter(5px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              }}
              className="absolute z-20 left-0 right-0 top-[50%] w-full p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1
                className={`${
                  ultimateWinner !== null || '' ? 'text-golden' : 'text-white'
                } text-[24px] text-center m-auto`}
              >
                {ultimateWinner !== null
                  ? 'Congrats!' + ' ' + ultimateWinner
                  : roundWinner !== null || ''
                  ? roundWinner + ' ' + 'wins'
                  : null}
              </h1>
            </motion.div>
          ) : (
            ''
          )}
        </AnimatePresence>
      </div>
      {ultimateWinner!?.length > 1 && <ReactConfetti width={width} height={height} />}
      <div className="flex items-center gap-3 max-[650px]:w-[95%] max-[650px]:mt-3 ">
        <div className="flex items-center justify-between w-full gap-4 p-2 min-[650px]:p-4">
          <h1 className="border w-fit text-center text-[16px] min-w-[120px] rounded-lg px-3 py-2">
            <span className="inline-block">Round: {gameData?.rounds} / 5</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleModal}
              className=" relative cursor-pointer outline-none border-none"
            >
              {' '}
              {playersObject?.playerOne?.id === gameData?.players?.playerTwo?.id &&
              gameData?.unreadMessages?.playerTwo! > 0 ? (
                <Tippy className="z-[1]" content="See notification" placement="bottom">
                  <Bell size={20} color="white" />
                </Tippy>
              ) : (
                <Tippy className="z-[1]" content="player chat" placement="bottom">
                  <MessageCircle color="white" size={20} />
                </Tippy>
              )}
              {playersObject?.playerOne?.id === gameData?.players?.playerTwo?.id && (
                <span
                  className={`z-[4] absolute bottom-1/2 left-[20px] transform -translate-x-1/2 -translate-y-1/2  min-w-[20px] min-h-[20px] place-content-center grid text-[14px] rounded-full`}
                  style={{ backgroundColor: track?.notifBg || 'red' }}
                >
                  {gameData?.unreadMessages?.playerTwo ?? 0}
                </span>
              )}
              {playersObject?.playerTwo?.id === gameData?.players?.playerTwo?.id && (
                <span
                  className={`z-[4] absolute bottom-1/2 left-[20px] transform -translate-x-1/2 -translate-y-1/2  min-w-[20px] min-h-[20px] place-content-center grid text-[14px] text-center align-middle rounded-full`}
                  style={{ backgroundColor: track?.notifBg || 'red' }}
                >
                  {gameData?.unreadMessages?.playerOne ?? 0}
                </span>
              )}
            </button>
            <Popover>
              <PopoverTrigger>
                <Tippy content="Game settings" placement="bottom">
                  <Settings size={20} color="white" />
                </Tippy>
              </PopoverTrigger>
              <PopoverContent className="">
                <ul className="flex flex-col gap-4 items-start">
                  <li
                    onClick={() =>
                      handleThemeChange(currentTheme === 'dark' ? 'light' : 'dark')
                    }
                    className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto"
                  >
                    <span>Light mode</span>
                    <span className=" cursor-pointer">
                      {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </span>
                  </li>
                  <li
                    onClick={handleSoundControl}
                    className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto"
                  >
                    <span>Control sound</span>
                    <span className=" cursor-pointer">
                      {track?.trackSound ? <CircleStop /> : <Music />}
                    </span>
                  </li>
                  <li
                    onClick={() => handleNotifBgChange}
                    className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto"
                  >
                    <span>Change Notif bg</span>
                    <input onChange={handleNotifBgChange} type={'color'} />
                  </li>
                  <li
                    onClick={() => handleGameQuit(playersObject?.playerOne?.name)}
                    className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto"
                  >
                    <span>Quit Game</span>
                    <span>
                      <StopCircle color="red" />{' '}
                    </span>
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
