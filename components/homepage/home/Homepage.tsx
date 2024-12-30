'use client';
import { Chat, GameSession, MovesObject } from '@/app/types/types';
import Possible from '@/components/possible/Possible';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector, useAppDispatch, useAppStore } from '@/lib/hooks';
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
import { setTrackDisableRound, setTrackRounds } from '@/lib/features/TrackerSlice';
import { toast } from 'react-hot-toast';
// import Lottie from 'lottie-react';
// import animationData from '@/public/fireworks.json';
import { Bell, EllipsisVertical } from 'lucide-react';
import ChatModal from '@/components/ChatModal';

type Props = {};

const Homepage = (props: Props) => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);

  const playerId = useAppSelector((state: RootState) => state.user.playerId);

  const dispatch = useAppDispatch();

  const [gameData, setGameData] = useState<GameSession | null>(null);
  const [movesData, setMovesData] = useState<MovesObject[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [playerChat, setPlayerChat] = useState<Chat[]>([]);
  const [getTheChatId, setTheChatId] = useState<any>(null);
  const router = useRouter();

  const combinedId = useMemo(() => {
    const playerOneId = playersObject?.playerOne?.id;
    const playerTwoId = playersObject?.playerTwo?.id;
    return playerOneId > playerTwoId
      ? playerOneId + playerTwoId
      : playerTwoId + playerOneId;
  }, [playersObject]);

  // const combinedId = useMemo(() => {
  //   playersObject?.playerOne?.id > playersObject?.playerTwo?.id
  //     ? playersObject?.playerOne?.id + playersObject?.playerTwo?.id
  //     : playersObject?.playerTwo?.id + playersObject?.playerOne?.id;
  // }, [playersObject]);

  useEffect(() => {
    if (combinedId) {
      const unsubscribeGame = onSnapshot(doc(db, 'gameSessions', combinedId), (doc) => {
        if (doc.exists()) {
          setGameData(doc.data() as GameSession);
        }
      });

      const unsubscribeMoves = onSnapshot(doc(db, 'playersMoves', combinedId), (doc) => {
        if (doc.exists()) {
          setMovesData(doc.data()?.moves || []);
        }
      });

      // const unSubscribeChats = onSnapshot(doc(db, 'playersChats', combinedId), (doc) => {
      //   if (doc.exists()) {
      //     console.log(doc.data().messages, 'doc data messages');
      //     setPlayerChat(doc.data()?.messages || []);
      //   }
      // });

      return () => {
        unsubscribeGame();
        unsubscribeMoves();
        // unSubscribeChats();
      };
    }
  }, [combinedId]);

  useEffect(() => {
    const chatRef = collection(db, 'playersChats');
    const q = query(chatRef, where('combinedId', '==', combinedId));
    // const gotten = getId(q);
    // setTheChatId(gotten);

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const messages = doc.data().messages || [];
          // console.log();

          setPlayerChat(messages); // Update state with the latest messages
          console.log('Updated messages:', messages);
        }
      });
    });

    return () => {
      unsubscribeChats(); // Unsubscribe when component unmounts
    };
  }, [combinedId]);

  // const getId = async (q: any) => {
  //   const chatDoc = await getDocs(q);
  //   console.log(chatDoc, 'chatDoc');

  //   const chatId = chatDoc.docs[0].id;
  //   return chatId;
  // };

  useEffect(() => {
    if (!playerId) {
      router.push('/signup');
    } else {
      toast.success('Welcome to the game', {
        style: {
          background: '#333',
          color: '#fff',
        },
        position: 'top-right',
      });
    }
  }, [playerId]);

  const [currentPlayer, setCurrentPlayer] = useState('');
  const [firstPlayer, setFirstPlayer] = useState('');

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
  }, [db, playersObject]);

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
      roundWinner: '',
      endOfRound: false,
      winningCombination: [],
      firstPlayer:
        gameData?.firstPlayer === gameData?.players?.playerOne?.id
          ? gameData?.players?.playerTwo?.id
          : gameData?.players?.playerOne?.id,
    });
    await updateDoc(doc(db, 'playersMoves', combinedId), {
      moves: [],
    });
    dispatch(setTrackRounds(gameData?.rounds));
    dispatch(setTrackDisableRound(true));
    setMovesData([]);
  }, [gameData, combinedId]);

  // const handleStartNewRound = async () => {
  // };

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
      roundWinner: '',
      endOfRound: false,
    });
    await updateDoc(doc(db, 'playersMoves', combinedId), {
      moves: [],
    });
    toast.success('Game is restarted');
  }, [gameData, combinedId]);

  // const defaultOptions = {
  //   loop: false,
  //   autoplay: true,
  //   animationData: animationData,
  //   rendererSettings: {
  //     preserveAspectRatio: 'xMidYMid slice',
  //   },
  //   initialSegment: [3, 50],
  // };

  const handleModal = async () => {
    setOpenModal(true);
    await loadChat();
    //After the modal opens then I need to...
    //First I need to check if a player chat already exist between the two players using the combinedId as a check
    //If I find it, I load the chats between the two players and if not I create a new chat session for the players using their combinedId
    //Meanwhile in my chat modal, when a player sends a message it sends an object containing
    //senderId, message, timestamp, Reaction
    //Then just the way we did the instant update with local state , we do the same thing here with the chat messages
    //So whatever messages we send appears instantly then we can sort it by the id so it shows who is in sender and receiver based on the id for each player.
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

  // useEffect(() => {
  //   //If the player logs in first while the other couldn't cos the status has changed
  //   // We want to pull the person into the game
  //   //So even if their status has changed before the other person we drag them into the game.
  //   //First we check for their id from fireStore then once gotten we get the id from the gameSession.
  //   //We can then check that if the other player with this id gotten from the gameSession having a specificId from firestore database and having a status of inGame from firestore database is true
  //   //Then we route them into the game.
  // }, []);

  return (
    <div className=" relative flex flex-col gap-[10px] items-center w-full h-[100vh] overflow-x-hidden">
      <div className="flex items-center justify-between gap-4 p-4 w-full">
        <h1 className="text-white border w-[150px] text-center text-[18px] px-3 py-3">
          <span className="text-white inline-block">Round: {gameData?.rounds} / 5</span>
        </h1>
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={handleModal}
            className="cursor-pointer outline-none border-none"
          >
            {' '}
            <Bell size={30} color="white" />
          </button>
          <button className="cursor-pointer outline-none border-none">
            <EllipsisVertical size={30} color="white" />{' '}
          </button>
        </div>
      </div>
      <div className=" flex justify-center items-center m-auto  w-full h-[85%] max-[500px]:h-[100%]">
        <div className="flex flex-col w-full gap-[10px] items-center  justify-center">
          <div className="relative">
            <div className="flex items-center justify-between w-[100%] ">
              <div className="flex items-center w-full justify-center gap-[20px]  ">
                <Image
                  width={40}
                  height={40}
                  src={
                    currentPlayer === gameData?.players?.playerOne?.id
                      ? gameData?.players?.playerOne?.avatar! ?? null
                      : gameData?.players?.playerTwo?.avatar! ?? null
                  }
                  alt="img"
                />
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
                      ? gameData?.players?.playerOne?.name
                      : gameData?.players?.playerTwo?.name}{' '}
                  </h1>
                  <Image
                    src="/SelectX.png"
                    className="m-auto"
                    width={30}
                    height={30}
                    alt="img"
                  />
                </div>
                <h1 className="text-white text-[24px] ">
                  {currentPlayer === gameData?.players?.playerOne?.id
                    ? gameData?.scores?.playerOne!
                    : gameData?.scores?.playerTwo!}{' '}
                </h1>
              </div>
              <h1 className="text-white text-[24px] "> : </h1>
              <div className="flex items-center w-full justify-center   gap-[20px]">
                <h1 className="text-white text-[24px] ">
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
                      ? gameData?.players?.playerTwo?.name
                      : gameData?.players?.playerOne?.name}
                  </h1>
                  <Image
                    src="/SelectO.png"
                    className="m-auto"
                    width={30}
                    height={30}
                    alt="img"
                  />
                </div>
                <Image
                  width={40}
                  height={40}
                  src={
                    currentPlayer !== gameData?.players?.playerTwo?.id
                      ? gameData?.players?.playerTwo?.avatar! ?? null
                      : gameData?.players?.playerOne?.avatar! ?? null
                  }
                  alt="img"
                />
              </div>
              {gameData?.roundWinner!?.length > 0 && (
                <AnimatePresence>
                  <motion.div
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(3.6px)',
                      WebkitBackdropFilter: 'filter(5px',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    }}
                    className="absolute z-20 left-0 right-0 top-[50%] w-full p-3"
                  >
                    {' '}
                    <h1
                      style={{
                        color: 'transparent',
                        // color: "#ffffff",
                        // textShadow:
                        //   '0 -1px 4px #fff, 0 -2px 10px #ff0, 0 -10px 20px #ff8000, 0 -18px 40px #f00',
                      }}
                      className="text-[24px] text-center m-auto "
                    >
                      {gameData?.roundWinner} wins{' '}
                    </h1>
                  </motion.div>
                </AnimatePresence>
              )}
              {/* <button>Start Round 2 </button> */}
            </div>
            {/* <div className=" relative w-[500px] h-[500px] grid grid-cols-3 gap-2  m-auto border-2 border-blue-500 "> */}
            <div
              className="relative items-center justify-content w-[400px] max-[500px]:w-[320px] h-[400px] max-[500px]:h-[350px] grid grid-cols-3 gap-2 m-auto mt-[20px]"
              style={{
                mixBlendMode: 'hard-light',
                border: '3px solid #fff',
                boxShadow:
                  'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                filter: 'blur(0.970982px)',
                // borderRadius: '32.1429px',
                // border: "12.6228px solid rgba(255, 201, 64, 0.2)",
                //   filter:
                //   "drop-shadow(0px 19.4196px 25.2455px #8F7000) drop-shadow(0px 12.6228px 9.70982px rgba(57, 38, 0, 0.7))",
              }}
            >
              <span
                className="absolute right-[-70px] max-[500px]:right-[-70px] max-[500px]: top-[195px] max-[500px]:top-[170px] h-[2px] w-[100%] max-[500px]:w-[340px] rotate-[90deg]"
                style={{
                  mixBlendMode: 'hard-light',
                  border: '3px solid white',
                  boxShadow:
                    'inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)',
                  // filter: 'blur(0.970982px)',
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
                  // filter: 'blur(0.970982px)',
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
                  // filter: 'blur(0.970982px)',
                  borderRadius: '10.1429px',
                }}
              >
                {' '}
              </span>
              {/* <div className="absolute left-0 right-0 top-0 bottom-0 z-[999] w-[100%] m-auto border border-red-500">
                <Lottie
                  animationData={animationData}
                  width={'100%'}
                  height={'100%'}
                  autoPlay
                  loop={true}
                />
              </div> */}
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
          onClick={restartGame}
        >
          Restart Game
        </button>
        {gameData?.rounds === 5 ? (
          <button
            className={`text-white border-2 inline-block text-center text-[18px] px-3 py-2 ${
              gameData?.goToNextRound
                ? 'opacity-50 cursor-not-allowed'
                : ' opacity-100 cursor-pointer'
            }`}
            onClick={() => handleStartNewRound()}
          >
            Restart Game
          </button>
        ) : (
          <button
            onClick={() => handleStartNewRound()}
            disabled={gameData?.goToNextRound}
            className={`text-white border inline-block text-center text-[20px]  p-2${
              gameData?.goToNextRound
                ? 'opacity-50 cursor-not-allowed'
                : ' opacity-100 cursor-pointer'
            }`}
          >
            <span className="text-white border-solid inline-block">Begin round</span>
            <span>
              {' '}
              {gameData?.rounds === 5 ? gameData?.rounds : gameData?.rounds! + 1} / 5
            </span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {openModal && (
          <ChatModal
            setOpenModal={setOpenModal}
            combinedId={combinedId}
            playersChat={playerChat}
            gameData={gameData}
            chatUniqueId={getTheChatId}
            // setChatId={setChatId}
          />
        )}
      </AnimatePresence>
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
