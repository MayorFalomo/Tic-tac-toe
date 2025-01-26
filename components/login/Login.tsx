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
import { database, db } from '@/firebase-config/firebase';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import { useAppDispatch } from '@/lib/hooks';
import { createGameSession, handleUserPresence } from '../funcs/HandleAuth';
import { push, ref } from '@firebase/database';

import { GameSession, PlayerDetails } from '@/app/types/types';
import { setAPlayerId } from '@/lib/features/userSlice';
import { setCombinedGameSessionId, setSessionId } from '@/lib/features/TrackerSlice';
import FadeIn from '@/app/animation/FadeIn';
import { useTheme } from '@/app/ThemeContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [Avatar, setAvatar] = useState<string>('');
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { currentTheme } = useTheme();

  const router = useRouter();

  useEffect(() => {
    const randomNumber = Math.random();
    const getBoolean = randomNumber > 0.5 ? true : false;
    setRandomControl(getBoolean);
  }, []);

  const loginPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const playerKey = localStorage.getItem('playerKey');
      if (!playerKey) {
        router.push('/signup');
        return;
      } else {
        //Search for the playerkey in the firestore db
        const playerDoc = await getDoc(doc(db, 'players', playerKey));
        //If the player exists
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();

          //set the player to the local playerOne state using dispatch
          dispatch(givePlayerNames({ playerOne: playerData }));
          setAvatar(playerData?.avatar);
          //create a separate db instance in the database named activePlayers
          const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
          const playerId = playerRef.key || ''; // Get the unique key
          console.log(playerId, 'playerId');

          //Then it changes the players status to looking instead of online
          handleUserPresence(playerId, playerData?.name);

          //Since we've handled changing a users status we can now search for other players with a status of looking too
          searchForOpponent(playerId);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchForOpponent = async (playerId: string) => {
    try {
      const playersRef = collection(db, 'players'); //Create a reference to players collection on firestore

      const q = query(playersRef, where('status', '==', 'looking')); //Query our reference for status 'looking'

      //Our Listener for available opponents
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        snapshot.forEach(async (doc: any) => {
          const opponentId = doc.id; //The id of the opponent

          // Ensure the opponent is not the same as the current player
          if (opponentId !== playerId) {
            setSearchingActive(true); //State to show an opponent has been found

            //Only Set your opponents status to 'pending'
            await Promise.all([
              // updateDoc(playerRef, { status: 'pending' }),
              updateDoc(doc.ref, { status: 'pending' }),
            ]);

            // Confirm both players are ready
            const bothReady = await confirmBothPlayersReady(); //A setTimeOut for 3s, th returns true

            if (bothReady) {
              //Only Update the opponents players status to 'inGame'
              await Promise.all([
                // updateDoc(playerRef, { status: 'inGame' }),
                updateDoc(doc.ref, { status: 'inGame' }),
              ]);

              //Define the object for playerOne
              const playerOneDetails = {
                id: playerId,
                name: playerName,
                avatar: Avatar,
              };
              //Define the object for playerOne
              const playerTwoDetails = {
                id: opponentId,
                name: doc.data().name,
                avatar: doc.data().avatar,
              };

              // Create a gameSession on firestore db, It would return  the id of the gameSession on firestore
              const getSessionId = await createGameSession(
                playerId,
                opponentId,
                randomControl
              );

              //Pass our players object details to the handleGameSession to create a gameSession on firestore,The function would return the gameSession Data
              await handleGameSession(playerOneDetails, playerTwoDetails);

              dispatch(setAPlayerId(playerId)); //Store the currentPlayersId
              dispatch(setSessionId(getSessionId)); //Store the currentGameSessionId
              setLoading(false); //Stop the Loading spinner
              setTimeout(() => {
                router.push('/');
                // unsubscribe();
              }, 2000);
            } else {
              console.log('Player is not ready.');
            }
          }
        });
      });
    } catch (error) {
      console.error('Error has occurred:', error);
    }
  };

  const confirmBothPlayersReady = async () => {
    // Implement your logic to confirm both players are ready
    // For example, you could use a UI prompt or a timeout
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

    try {
      const sessionDoc = await getDoc(doc(db, 'gameSessions', combinedId));
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const playerOneDets = {
          id: playerOneDetails?.id,
          name: playerOneDetails?.name,
          avatar: playerOneDetails?.avatar,
        };

        const playerTwoDets = {
          id: opponent?.id,
          name: opponent?.name,
          avatar: opponent?.avatar,
        };

        //Set state on redux to store the playersDetails
        dispatch(
          givePlayerNames({
            playerOne: playerOneDets,
            playerTwo: playerTwoDets,
          })
        );

        dispatch(setCombinedGameSessionId(combinedId)); //State to store the combinedId
        return sessionData;
      } else {
        const newGameSession: GameSession = {
          sessionId: combinedId,
          currentTurn: randomControl ? playerOneDetails?.id : opponent?.id,
          firstPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          rounds: 1,
          createdAt: new Date().toISOString(),
          scores: {
            playerOne: 0,
            playerTwo: 0,
          },
          roundWinner: '',
          trackRoundPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          endOfRound: false,
          winningCombination: [],
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
              avatar: opponent?.avatar ?? null,
            },
          },
          gameOver: false,
          playersGameStatus: {
            playerOne: 'ready',
            playerTwo: 'ready',
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
      <div
        className={`${
          currentTheme === 'light'
            ? 'bg-royalGreen text-white'
            : 'bg-black text-brightGreen'
        } bg-[#000] w-[100vw] h-[100vh] `}
      >
        <div className="">
          <div className="flex justify-center items-center h-screen">
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
                      : 'Enter game'}{' '}
                  </span>
                  <span>{loading && <LoadingSpinner />}</span>
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
