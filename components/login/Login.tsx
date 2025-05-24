'use client';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/signup/Loader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import { useAppDispatch } from '@/lib/hooks';
import { createGameSession, handleUserPresence } from '../funcs/HandleAuth';
// import { push, ref } from '@firebase/database';
import {
  GameSession,
  PlayerDetails,
  PlayerStatus,
  ProfileStatus,
} from '@/app/types/types';
import { setCombinedGameSessionId, setSessionId } from '@/lib/features/TrackerSlice';
import FadeIn from '@/app/animation/FadeIn';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import useOnlineStatus from '@/hooks/useOnlinePresence';
import toast, { Toaster } from 'react-hot-toast';
import ProfileHeader from '../Profile/ProfileHeader';
import { usePlayer } from '@/contexts/UserContext';

const Login = () => {
  // const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  // const [Avatar, setAvatar] = useState<string>('');
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  // const currentUser = useAppSelector((state: RootState) => state.user as userDetails);
  const { currentUser } = usePlayer();

  const { currentTheme } = useTheme();

  const router = useRouter();

  const checkNetwork = useOnlineStatus();

  useEffect(() => {
    const randomNumber = Math.random();
    const getBoolean = randomNumber > 0.5 ? true : false;
    setRandomControl(getBoolean);
  }, []);

  const loginPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(ProfileStatus.SEARCH);
      const playerKey = currentUser?.userId;
      // const playerKey = localStorage.getItem('playerKey');
      if (!playerKey) {
        toast.error('No previous account, Sign-up first', {
          position: 'top-right',
          duration: 5000,
        });

        setTimeout(() => {
          router.push('/signup');
        }, 4000);
        setLoading(null);
        return;
      } else {
        //Search for the playerkey in the firestore db
        const playerDoc = await getDoc(doc(db, 'players', playerKey));
        //If the player exists
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();

          //set the player to the local playerOne state using dispatch
          // dispatch(givePlayerNames({ playerOne: playerData }));
          // setAvatar(playerData?.avatar);
          //create a separate db instance in the database named activePlayers
          // const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
          // const playerId = playerRef.key || ''; // Get the unique key
          // console.log(playerId, 'playerId');

          await updateDoc(doc(db, 'players', playerData?.id), {
            status: PlayerStatus?.LOOKING,
            networkState: checkNetwork ? PlayerStatus.ONLINE : PlayerStatus?.OFFLINE,
            updatedAt: new Date().toISOString(),
          });

          //Then it changes the players status to looking instead of online on firestore/database
          handleUserPresence(playerData?.id, playerData?.name);

          //Since we've handled changing a users status we can now search for other players with a status of looking too
          searchForOpponent(playerData?.id, playerData?.name, playerData?.avatar);
        } else {
          toast.error('No previous account found, please sign up first', {
            style: {
              textAlign: 'center',
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchForOpponent = async (
    playerId: string,
    playerName: string,
    playerAvatar: string
  ) => {
    try {
      const playersRef = collection(db, 'players'); // Create a reference to players collection on Firestore

      const q = query(
        playersRef,
        where('status', '==', PlayerStatus.LOOKING),
        where('networkState', '==', PlayerStatus.ONLINE)
      ); // Query for players who are looking

      // Set a timeout to stop searching after 60 seconds
      const timeoutId = setTimeout(() => {
        setLoading(null);
        setSearchingActive(false);
        toast.error('No opponent found');
        updateDoc(doc(db, 'players', playerId), {
          status: PlayerStatus.ONLINE,
          networkState: checkNetwork,
        });

        unsubscribe(); // Unsubscribe from the listener
        return;
      }, 60 * 1000); // 60 seconds

      // Our Listener for available opponents
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const currentTime = new Date(); // Get the current time
        const filteredOpponents: any = [];

        snapshot.forEach((doc) => {
          const opponentId = doc.id; // The id of the opponent

          // Ensure the opponent is not the same as the current player
          if (opponentId !== playerId) {
            const updatedAt = doc.data()?.updatedAt; // Get the updatedAt field
            // console.log(updatedAt, 'updatedAt');

            // Check if updatedAt is defined
            if (updatedAt) {
              const opponentUpdatedAt = new Date(updatedAt); // Convert updatedAt to Date object
              // console.log(opponentUpdatedAt, 'oppoenntUpdated');

              const timeDifference =
                (currentTime.getTime() - opponentUpdatedAt.getTime()) / 1000; // Calculate difference in seconds
              // console.log(timeDifference, 'timeDifference');

              // Check if the opponent was updated within the last 3 minutes (180 seconds)
              if (timeDifference <= 180) {
                filteredOpponents.push({ id: opponentId, data: doc.data() });
              }
            }
          }
        });

        // If we have filtered opponents, proceed with the first one
        if (filteredOpponents.length > 0) {
          const opponent = filteredOpponents[0]; // Get the first valid opponent

          // console.log(opponent, 'opponent');

          setLoading(ProfileStatus.FOUND);
          setSearchingActive(true); // State to show an opponent has been found

          // Only set your opponent's status to 'pending'
          await updateDoc(doc(playersRef, opponent.id), { status: PlayerStatus.PENDING });

          // Confirm both players are ready
          const bothReady = await confirmBothPlayersReady(); // A setTimeout for 3s, this returns true

          if (bothReady) {
            // Only update the opponent's player status to 'inGame'
            await updateDoc(doc(playersRef, opponent.id), {
              status: PlayerStatus.INGAME,
            });

            // Define the object for playerOne
            const playerOneDetails = {
              id: playerId,
              name: playerName,
              avatar: playerAvatar,
              networkState: checkNetwork ? PlayerStatus.ONLINE : PlayerStatus.OFFLINE,
              wins: currentUser?.wins ?? 0,
              loss: currentUser?.loss ?? 0,
              level: currentUser?.level ?? 0,
            };

            // Define the object for playerTwo
            const playerTwoDetails = {
              id: opponent.data.id,
              name: opponent.data.name,
              avatar: opponent.data.avatar,
              networkState: opponent.data.networkState,
              wins: opponent?.data?.wins ?? 0,
              loss: opponent.data?.loss ?? 0,
              level: opponent?.data?.level ?? 0,
            };

            dispatch(
              givePlayerNames({
                playerOne: playerOneDetails,
                playerTwo: playerTwoDetails,
              })
            );

            // Proceed with your game logic using playerOneDetails and playerTwoDetails
            // console.log('Both players are ready:', playerOneDetails, playerTwoDetails);

            // console.log(playerOneDetails, playerTwoDetails, 'details');

            // Create a gameSession on Firestore DB, It would return the id of the gameSession on Firestore
            const getSessionId = await createGameSession(
              playerId,
              opponent.data.id,
              randomControl
            );

            // console.log(getSessionId, 'getSessionId');
            // console.log(handleGameSession(playerOneDetails, playerTwoDetails));

            await handleGameSession(playerOneDetails, playerTwoDetails);
            dispatch(setSessionId(getSessionId)); // Store the current game session ID
            setLoading(null); // Stop the loading spinner
            clearTimeout(timeoutId); // Clear the timeout
            setTimeout(() => {
              router.push('/battle-area'); // Redirect after 2 seconds
            }, 2000);
          } else {
            console.log('Player is not ready.');
          }
        }
      });

      return () => {
        clearTimeout(timeoutId); // Clear the timeout when the component unmounts
        unsubscribe(); // Unsubscribe from the listener
      };
    } catch (error) {
      console.error('Error has occurred:', error);
    }
  };

  const confirmBothPlayersReady = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 3000); // Simulate a 3-second wait for confirmation
    });
  };

  const handleGameSession = async (
    playerOneDetails: PlayerDetails,
    opponent: PlayerDetails
  ) => {
    const combinedId =
      playerOneDetails?.id > opponent?.id
        ? playerOneDetails?.id + opponent?.id
        : opponent?.id + playerOneDetails?.id;
    // console.log(combinedId, 'combinedId');

    try {
      const sessionDoc = await getDoc(doc(db, 'gameSessions', combinedId));
      if (sessionDoc.exists()) {
        const newGameSession: GameSession = {
          sessionId: combinedId,
          currentTurn: randomControl ? playerOneDetails?.id : opponent?.id,
          firstPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          unChangeableFirstPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          rounds: 1,
          createdAt: new Date().toISOString(),
          scores: {
            playerOne: 0,
            playerTwo: 0,
          },
          roundWinner: null,
          endOfRound: false,
          trackRoundPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          ultimateWinner: null,
          winningCombination: [],
          goToNextRound: true,
          draw: false,
          quitGame: false,
          players: {
            playerOne: {
              id: playerOneDetails?.id,
              name: playerOneDetails?.name,
              avatar: playerOneDetails?.avatar!,
            },
            playerTwo: {
              id: opponent?.id,
              name: opponent?.name,
              avatar: opponent?.avatar!,
            },
          },
          unreadMessages: {
            playerOne: 0,
            playerTwo: 0,
          },
          trackPlayersOnlineStatus: {
            playerOne: playerOneDetails?.networkState,
            playerTwo: opponent?.networkState,
          },
        };

        await updateDoc(doc(db, 'gameSessions', combinedId), newGameSession);
        const moveObject = {
          moves: [],
        };
        await updateDoc(doc(db, 'playersMoves', combinedId), moveObject);
        dispatch(setCombinedGameSessionId(combinedId));
        return newGameSession;
      } else {
        const newGameSession: GameSession = {
          sessionId: combinedId,
          currentTurn: randomControl ? playerOneDetails?.id : opponent?.id,
          firstPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          unChangeableFirstPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          rounds: 1,
          createdAt: new Date().toISOString(),
          scores: {
            playerOne: 0,
            playerTwo: 0,
          },
          roundWinner: '',
          endOfRound: false,
          trackRoundPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          ultimateWinner: null,
          winningCombination: [],
          goToNextRound: true,
          draw: false,
          quitGame: false,
          players: {
            playerOne: {
              id: playerOneDetails?.id,
              name: playerOneDetails?.name,
              avatar: playerOneDetails?.avatar!,
            },
            playerTwo: {
              id: opponent?.id,
              name: opponent?.name,
              avatar: opponent?.avatar!,
            },
          },
          unreadMessages: {
            playerOne: 0,
            playerTwo: 0,
          },
        };
        await setDoc(doc(db, 'gameSessions', combinedId), newGameSession);
        return newGameSession;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FadeIn>
      <Toaster />
      <div
        className={`${
          currentTheme === 'light'
            ? 'bg-royalGreen text-white'
            : 'bg-black text-brightGreen'
        } bg-[#000] w-[100vw] h-[100vh] overflow-hidden `}
      >
        <div className="h-full">
          <div className="w-[95%] mx-auto flex items-center justify-end py-2 text-brightGreen">
            <ProfileHeader />
          </div>
          <div className="flex justify-center items-center h-[80%]">
            <form
              onSubmit={loginPlayer}
              className="border border-white/40 rounded-lg py-8 px-8 min-w-[250px] w-[400px] max-[550px]:w-[95%] max-[550px]:px-3"
            >
              <h1 className="text-2xl text-center font-bold mb-4">
                Login to your account
              </h1>
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="text-[16px] bg-[#2CBF93] hover:bg-white text-black my-3 mr-2"
                >
                  {' '}
                  <span>
                    {searchingActive && loading
                      ? 'Found a player!'
                      : !searchingActive && loading
                      ? 'Searching for a player'
                      : loading === 'none'
                      ? 'Sorry, No opponent found'
                      : 'Enter game'}{' '}
                  </span>
                  <span className="ml-2">{loading && <LoadingSpinner />}</span>
                </Button>
              </div>
              <div className=" flex flex-col items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="flex justify-center text-[14px] text-white"
                >
                  Create new profile instead?{' '}
                </Link>
                <motion.p
                  initial={{ width: 0 }}
                  animate={{
                    width: '100%',
                    transition: {
                      duration: 0.7,
                    },
                  }}
                  className={`${
                    currentTheme === 'light' ? 'bg-brightGreen' : 'bg-white/30'
                  } h-0.5 w-full`}
                ></motion.p>
                <Link
                  href="/"
                  className={`${
                    currentTheme === 'light' ? 'text-white' : 'text-white'
                  } flex justify-center text-[14px]`}
                >
                  Game Menu{' '}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default Login;
