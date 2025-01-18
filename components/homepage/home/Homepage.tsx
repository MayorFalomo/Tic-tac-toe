'use client';
import { Chat, GameSession, MovesObject } from '@/app/types/types';
import Possible from '@/components/possible/Possible';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  getDocs,
  addDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import {
  changeNotifBg,
  setTrackDisableRound,
  setTrackRounds,
  setTrackSound,
} from '@/lib/features/TrackerSlice';
import { toast, Toaster } from 'react-hot-toast';
import {
  Bell,
  CircleStop,
  MessagesSquare,
  MoonIcon,
  Music,
  Settings,
  StopCircle,
  SunIcon,
} from 'lucide-react';
// import ChatModal from '@/components/ChatModal';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { useTheme } from '@/app/ThemeContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAudio } from '@/app/AudioContext';
import { setAPlayerId } from '@/lib/features/userSlice';
import Tippy from '@tippyjs/react';

const ChatModal = React.lazy(() => import('@/components/ChatModal'));

const Homepage: React.FC = () => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);
  const playerId = useAppSelector((state: RootState) => state.user.playerId);
  const track = useAppSelector((state: RootState) => state.track);

  const dispatch = useAppDispatch();

  const [gameData, setGameData] = useState<GameSession | null>(null);
  const [movesData, setMovesData] = useState<MovesObject[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [playerChat, setPlayerChat] = useState<Chat[]>([]);
  const [getTheChatId, setTheChatId] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [firstPlayer, setFirstPlayer] = useState('');
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [ultimateWinner, setUltimateWinner] = useState<string | null>(null);

  const { width, height } = useWindowSize(); //For the Cofetti Animation
  const router = useRouter();
  const { play, stop } = useAudio();
  const { currentTheme, setCurrentTheme } = useTheme();

  //To get the combinedId
  const combinedId = useMemo(() => {
    const playerOneId = playersObject?.playerOne?.id;
    const playerTwoId = playersObject?.playerTwo?.id;
    return playerOneId > playerTwoId
      ? playerOneId + playerTwoId
      : playerTwoId + playerOneId;
  }, [playersObject]);

  useEffect(() => {
    if (combinedId) {
      const unsubscribeGame = onSnapshot(doc(db, 'gameSessions', combinedId), (doc) => {
        if (doc.exists()) {
          setGameData((doc.data() as GameSession) || []);
        }
      });

      const unsubscribeMoves = onSnapshot(doc(db, 'playersMoves', combinedId), (doc) => {
        if (doc.exists()) {
          setMovesData(doc.data()?.moves || []);
        }
      });

      return () => {
        unsubscribeGame();
        unsubscribeMoves();
      };
    }
  }, [combinedId]);

  useEffect(() => {
    if (combinedId) {
      const chatRef = collection(db, 'playersChats');
      const q = query(chatRef, where('combinedId', '==', combinedId));

      const unsubscribeChats = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            const messages = doc.data().messages || [];

            setPlayerChat(messages); // Update state with the latest messages
            console.log('Updated messages:', messages);
          }
        });
      });

      return () => {
        unsubscribeChats(); // Unsubscribe when component unmounts
      };
    }
  }, [combinedId]);

  useEffect(() => {
    if (!playerId) {
      router.push('/signup');
    } else {
      toast.success('Welcome to the game');
    }
  }, [playerId]);

  useEffect(() => {
    if (combinedId) {
      const fetchGameSession = async () => {
        //Get the doc then we specify the doc we want to get by using doc which takes in the db the key and the combinedId specifically we want to fetch
        const gameSessionDoc = await getDoc(doc(db, 'gameSessions', combinedId)); // Replace 'sessionId' with your actual session ID
        //Check if the doc exists
        if (gameSessionDoc.exists()) {
          //If it does, we get the data from the doc
          const gameSessionData = gameSessionDoc.data();
          //Then we get the currentTurn from the data
          const currentTurn = gameSessionData.currentTurn;
          const playedFirst = gameSessionData.firstPlayer;

          // Determine the player's name to display based on currentTurn
          setCurrentPlayer(currentTurn);
          setFirstPlayer(playedFirst);
        }
      };
      fetchGameSession();
    }
  }, [combinedId, playersObject]);

  const handleStartNewRound = useCallback(async () => {
    //Update the game sessions
    //First we update the rounds to 2.
    //Then we update the currentTurn to be the next person other than the first player
    //Problem now is we can't use the currentTurn field straight up since we want power to change hands to the other player in round 2 and the firstPlayer field would only be valid after like round 1
    //So now we can use a combination of both
    //I'd need to check if the round from gameData is 1, if it is, it means the next round is round 2 right? and in round 2 we want the other player to start first.
    //So if it's round 1, I check the id of the firstPlayer in gameData and whomever it matches, their opposite gets to play.
    //After each round of game whether winning or a draw, i'd need to update the field to the opposite players id

    const determineNextPlayer =
      gameData?.firstPlayer === gameData?.players?.playerOne?.id
        ? gameData?.players?.playerTwo?.id
        : gameData?.players?.playerOne?.id;

    await updateDoc(doc(db, 'gameSessions', combinedId), {
      rounds: gameData?.rounds === 5 ? 5 : gameData?.rounds! + 1,
      currentTurn: determineNextPlayer,
      goToNextRound: true,
      roundWinner: null,
      endOfRound: false,
      winningCombination: [],
      ultimateWinner: null,
      firstPlayer:
        gameData?.firstPlayer === gameData?.players?.playerOne?.id
          ? gameData?.players?.playerTwo?.id
          : gameData?.players?.playerOne?.id,
    });
    await updateDoc(doc(db, 'playersMoves', combinedId), {
      moves: [],
    });
    await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
      status: 'inGame',
    });
    setRoundWinner(null);
    dispatch(setTrackRounds(gameData?.rounds));
    dispatch(setTrackDisableRound(true));
    setMovesData([]);
  }, [
    gameData?.firstPlayer,
    gameData?.players?.playerOne?.id,
    gameData?.players?.playerTwo?.id,
    gameData?.rounds,
    combinedId,
    playersObject?.playerOne?.id,
    dispatch,
  ]);

  const restartGame = useCallback(async () => {
    await updateDoc(doc(db, 'gameSessions', combinedId), {
      rounds: 1,
      currentTurn: gameData?.unChangeableFirstPlayer,
      firstPlayer: gameData?.unChangeableFirstPlayer,
      scores: {
        playerOne: 0,
        playerTwo: 0,
      },
      winningCombination: [],
      roundWinner: null,
      endOfRound: false,
      ultimateWinner: null,
    });
    await updateDoc(doc(db, 'playersMoves', combinedId), {
      moves: [],
    });
    await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
      status: 'inGame',
    });
    setRoundWinner(null);
    // setUltimateWinner(null);
    toast.success('Game is restarted');
  }, [combinedId, gameData?.unChangeableFirstPlayer, playersObject?.playerOne?.id]);

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

  //useEffect to make sure it shows on both players interface
  useEffect(() => {
    if (gameData?.roundWinner === null || '') {
      setRoundWinner(null);
    } else {
      setRoundWinner(gameData?.roundWinner!);
    }
    //So the ultimate Winner reflects on both players interface
    if (gameData?.ultimateWinner !== null || '') {
      setUltimateWinner(gameData?.ultimateWinner!);
    } else {
      setUltimateWinner(null);
    }
  }, [gameData?.roundWinner, roundWinner, gameData, gameData?.ultimateWinner]);

  useEffect(() => {
    if (track?.trackSound) {
      play();
    } else {
      stop();
    }
  }, [track?.trackSound]);

  const handleSoundControl = useCallback(async () => {
    dispatch(setTrackSound(!track?.trackSound));
  }, [track?.trackSound]);

  const handleThemeChange = useCallback(async (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  }, []);

  const handleNotifBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeNotifBg(e.target.value));
    localStorage.setItem('notifBg', e.target.value);
  };

  const handleGameQuit = async () => {
    await updateDoc(doc(db, 'gameSessions', playersObject?.playerOne?.id), {
      quitGame: true,
    });
    await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
      status: 'online',
    });
    dispatch(setAPlayerId(''));
  };

  //
  useEffect(() => {
    if (gameData?.quitGame) {
      toast(`${playersObject?.playerTwo?.name} has left the game`);
      dispatch(setTrackDisableRound(true));
    }
  }, [gameData?.quitGame]);

  return (
    <div
      className={`${
        currentTheme === 'light' ? 'bg-royalGreen text-white ' : 'bg-black text-white'
      } transition-all duration-500 relative flex flex-col gap-[10px] items-center w-full h-[100vh] max-h-screen overflow-hidden overflow-x-hidden`}
    >
      <div className="flex items-center justify-between gap-4 px-2 pt-2 w-full">
        <h1 className="border w-[150px] text-center text-[18px] px-3 py-3">
          <span className="inline-block">Round: {gameData?.rounds} / 5</span>
        </h1>
        {ultimateWinner!?.length > 1 && <Confetti width={width} height={height} />}
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={handleModal}
            className=" relative cursor-pointer outline-none border-none"
          >
            {' '}
            {playersObject?.playerOne?.id === gameData?.players?.playerTwo?.id &&
            gameData?.unreadMessages?.playerTwo! > 0 ? (
              <Tippy content="See notification" placement="bottom">
                <Bell size={30} color="white" />
              </Tippy>
            ) : (
              <Tippy content="player chat" placement="bottom">
                <MessagesSquare color="white" size={30} />
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
                <Settings size={30} color="white" />
              </Tippy>
            </PopoverTrigger>
            <PopoverContent className="">
              <ul className="flex flex-col gap-4 items-start">
                <li className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto">
                  <span>Light mode</span>
                  <span
                    onClick={() =>
                      handleThemeChange(currentTheme === 'dark' ? 'light' : 'dark')
                    }
                    className=" cursor-pointer"
                  >
                    {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
                  </span>
                </li>
                <li className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto">
                  <span>Control sound</span>
                  <span onClick={handleSoundControl} className=" cursor-pointer">
                    {track?.trackSound ? <CircleStop /> : <Music />}
                  </span>
                </li>
                <li className="py-3 px-3 w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between gap-4 mx-auto">
                  <span>Change Notif bg</span>
                  <input onChange={handleNotifBgChange} type={'color'} />
                </li>
                <li
                  onClick={handleGameQuit}
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
      <div className="flex justify-center items-center mx-auto w-full h-[85%] max-[500px]:h-[100%]">
        <div className="flex flex-col w-full gap-[10px] items-center  justify-center">
          <div className="relative">
            <div className="flex items-center justify-between gap-2 w-[100%]">
              <div className="flex items-center w-full  max-w-[250px] justify-center gap-[10px]">
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
                      className="w-[80px] h-[80px] object-cover object-top"
                    />
                  )}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(3.6px)',
                    WebkitBackdropFilter: 'filter(5px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  }}
                  className="flex flex-col gap-2 p-3"
                >
                  <h1 className="text-white text-center text-[16px] ">
                    {currentPlayer === gameData?.players?.playerOne?.id
                      ? gameData?.players?.playerOne?.name.slice(0, 12)
                      : gameData?.players?.playerTwo?.name.slice(0, 12)}{' '}
                  </h1>
                  {
                    <Image
                      src="/SelectX.png"
                      className="m-auto"
                      width={30}
                      height={30}
                      alt="img"
                    />
                  }
                </div>
                <h1 className="text-white text-center text-[24px] ">
                  {currentPlayer === gameData?.players?.playerOne?.id
                    ? gameData?.scores?.playerOne!
                    : gameData?.scores?.playerTwo!}{' '}
                </h1>
              </div>
              <p className="text-white text-[24px]"> : </p>
              <div className="flex items-center w-full max-w-[250px] justify-center gap-[10px] ">
                <h1 className="text-white text-[24px]">
                  {currentPlayer === gameData?.players?.playerTwo?.id
                    ? gameData?.scores?.playerOne!
                    : gameData?.scores?.playerTwo!}{' '}
                </h1>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(3.6px)',
                    WebkitBackdropFilter: 'filter(5px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  }}
                  className="flex flex-col gap-2 p-3"
                >
                  <h1 className="text-white text-[16px] ">
                    {currentPlayer === gameData?.players?.playerOne?.id
                      ? gameData?.players?.playerTwo?.name.slice(0, 12)
                      : gameData?.players?.playerOne?.name.slice(0, 12)}
                  </h1>
                  <Image
                    src="/SelectO.png"
                    className="m-auto"
                    width={30}
                    height={30}
                    alt="img"
                  />
                </div>
                {gameData?.players?.playerOne?.avatar! &&
                  gameData?.players?.playerTwo?.avatar! && (
                    <Image
                      width={40}
                      height={40}
                      src={
                        currentPlayer !== gameData?.players?.playerTwo?.id
                          ? gameData?.players?.playerTwo?.avatar! ?? null
                          : gameData?.players?.playerOne?.avatar! ?? null
                      }
                      alt="img"
                      className="w-[80px] h-[80px] object-cover object-top"
                    />
                  )}
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
            <div
              className="relative items-center justify-content w-[400px] max-[500px]:w-[320px] h-[400px] max-[500px]:h-[350px] grid grid-cols-3 gap-2 m-auto mt-[20px]"
              style={{
                mixBlendMode: 'hard-light',
                border: '3px solid #fff',
                boxShadow:
                  'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                filter: 'blur(0.970982px)',
              }}
            >
              <span
                className="absolute right-[-70px] max-[500px]:right-[-70px] max-[500px]: top-[195px] max-[500px]:top-[170px] h-[2px] w-[100%] max-[500px]:w-[340px] rotate-[90deg]"
                style={{
                  mixBlendMode: 'hard-light',
                  border: '3px solid white',
                  boxShadow:
                    'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                  borderRadius: '   10.1429px',
                }}
              >
                {' '}
              </span>
              <span
                className="absolute left-[-70px] max-[500px]:left-[-70px] top-[195px] max-[500px]:top-[170px] h-[2px] w-[100%] max-[500px]:w-[340px] rotate-[90deg]"
                style={{
                  mixBlendMode: 'hard-light',
                  border: '3px solid #fff',
                  boxShadow:
                    'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                  borderRadius: '10.1429px',
                }}
              >
                {' '}
              </span>
              <span
                className="absolute left-[0px] top-[120px] max-[500px]:top-[100px] h-[2px] w-[100%]"
                style={{
                  mixBlendMode: 'hard-light',
                  border: '3px solid #fff',
                  boxShadow:
                    'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                  filter: 'blur(0.970982px)',
                  borderRadius: '10.1429px',
                }}
              >
                {' '}
              </span>
              <span
                className="absolute left-[0px] bottom-[120px] h-[3px] w-[100%]"
                style={{
                  mixBlendMode: 'hard-light',
                  border: '3px solid #fff',
                  boxShadow:
                    'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                  borderRadius: '10.1429px',
                }}
              >
                {' '}
              </span>
              {Array.from({ length: 9 }, (_val, index) => (
                <div key={index}>
                  <Possible
                    val={_val}
                    index={index + 1}
                    firstPlayer={firstPlayer}
                    gameData={gameData}
                    movesData={movesData}
                    setMovesData={setMovesData}
                    setGameData={setGameData}
                    combinedId={combinedId}
                    setRoundWinner={setRoundWinner}
                    setUltimateWinner={setUltimateWinner}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-center  w-full">
        <button
          className={`text-white border inline-block text-center text-[18px] px-3 py-2`}
        >
          {gameData?.currentTurn === playersObject?.playerOne?.id
            ? 'Your Turn'
            : `${playersObject?.playerTwo?.name} Turn`}
        </button>
        {gameData?.rounds === 5 ? (
          <button
            className={`text-white border-2 inline-block text-center text-[18px] px-3 py-2 ${
              gameData?.goToNextRound
                ? 'opacity-50 bg-brightGreen cursor-not-allowed'
                : ' opacity-100 cursor-pointer'
            }`}
            onClick={restartGame}
          >
            Restart Game
          </button>
        ) : (
          <button
            onClick={() => handleStartNewRound()}
            disabled={gameData?.goToNextRound}
            className={`text-white border inline-block text-center text-[18px] px-2 py-2 ${
              gameData?.goToNextRound
                ? 'opacity-30 cursor-not-allowed'
                : ' opacity-100 cursor-pointer'
            }`}
          >
            <span className="text-white border-solid inline-block">Begin round</span>
            <span>
              {' '}
              {gameData?.rounds === 5 ? gameData?.rounds ?? 0 : gameData?.rounds! + 1} / 5
            </span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {openModal && (
          <ChatModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            combinedId={combinedId}
            playersChat={playerChat}
            gameData={gameData}
            chatUniqueId={getTheChatId}
          />
        )}
      </AnimatePresence>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#313235',
            color: '#fff',
            width: '300px',
            height: '70px',
          },
        }}
      />
    </div>
  );
};

export default Homepage;

//For randomly selecting random players, I can Have a FirstPlayer field on the sessions
//That field would be determined randomly and it would be the same across both sessions
//We might need to get the opponent sessions too

//!Users would sign up using their name and can select an avatar.
//*Then the system begins searching for a player after sign up is done.
//?The searching is done by players with status of looking.
//*todo It looks for users with Id's that isn't the current user as an opponent.
// Once a player is found, it logs them into the game page.
//!On the game page, the game announces who plays first based on a boolean state that tracks it.
//*The way that would work is, I need a way to track which player has played from the backend right. so I can tell who's playing next.
//? Now When the user clicks a box, Multiple things happens: First, It has to track what box was selected and which player selected it.
// So what I basically need to send as an object would be the selectedIndex, And The player ThatSelected Id I could also add the currentlyPlaying boolean
//*todo The game then checks if the box was already selected by the other player. If it was, nothing happens but if not.
//The game sends the move played and the person who played to an array of all the moves being played.
//!The move array can be an array holding every move.
//?At every click, those moves would Filter all the moves (In the moves field) for each player into an array.
//*Then we compare the moves combination to something in our possibility array of array of numbers

//!Note I think I should make it such that the backend and frontend are in sync right? So I should probably send the object of moves to a moves array in firebase
//?So once the backend has been updated the frontend should be too huh - Lets see what we can do!

//#Things to Note from RTD
//? On every angle, everyone is playerOne, your opponent found is player 2, but you're also player one.
//! What this then means is, a Game sessions is opened for both players containing the same data, but the structure is different
//* If I'm using my game session to to keep track of players moves, it also means that two different game sessions are created for both players.
// Hence, To get the moves of the other opponent i'd need their sessionId to access their moves array

//Steps to take now would be
// When a player selects a box, I need to access the opponents array of moves while keeping track of mine.
//! A strong option would be for me to merge whatever moves exists from firebase on a local state array or maybe run the check from firebase
//? Then I need to check if the choice I selected or the opponents has selected is in their moves array
//* If it isn't, then I push the move object to firebase

//! Since i'm adding Firebase firestore to the flow, The flow would change a bit.
//? I'd need to create a function that would create a game session for both players and return the sessionId
//* Then I'd need to use that sessionId to create a document that would hold the moves of both players.
//# Now when the game loads after  signup, I need to use the sessionId to get the details of the players especially who plays first from the sessionId.
//*Note Then once a player selects a box, I'd need to update the moves document with the move of the players and the playerId.
//! I first need to check if the move has been played by both players.
//? Then I'd need to check if the current player has won by comparing the moves to the possibility array.

//world trigger
//talentless nana
//seraph of the end
//violet evergarden
//akadama drive
