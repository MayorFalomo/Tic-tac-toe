'use client';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/signup/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { database, db } from '@/firebase-config/firebase';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import { useAppDispatch } from '@/lib/hooks';
import { createGameSession, handleUserPresence } from '../funcs/HandleAuth';
import { onValue, push, ref, set, update } from '@firebase/database';
import { GameSession, PlayerDetails } from '@/app/types/types';
import { setAPlayerId } from '@/lib/features/userSlice';
import { setPlayersSessionId, setSessionId } from '@/lib/features/TrackerSlice';

type Props = {};

const Login = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [Avatar, setAvatar] = useState<string>('');
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();

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
      console.log(playerKey, 'playerKey');
      if (!playerKey) {
        router.push('/signup');
        return;
      } else {
        //Search for the playerkey in the firestore db
        const playerDoc = await getDoc(doc(db, 'players', playerKey));
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();

          //set the player to the local playerOne state using dispatch
          dispatch(givePlayerNames({ playerOne: playerData }));
          setAvatar(playerData?.avatar);
          //create a separate db instance in the database named activePlayers
          const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
          const playerId = playerRef.key || ''; // Get the unique key
          //Create a new player Object by referencing the database ref and setting the object we want inside the db reference
          await set(playerRef, {
            player: playerData?.player,
            status: 'online',
          });

          //Then it changes the players status to looking instead of online
          handleUserPresence(playerId, playerData?.player);

          //Since we've handled changing a users status we can now search for other players with a status of looking too
          searchForOpponent(playerId);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchForOpponent = (playerId: string) => {
    //This function will search for an opponent in the activePlayers db
    //If an opponent is found, it will update the status of the player to "inGame"
    const playersRef = ref(database, 'activePlayers'); //First, reference the db we want to search through

    //Listen for changes in the activePlayers
    onValue(
      playersRef,
      async (snapshot) => {
        const players = snapshot.val(); //Returns an object of all the players name and status
        // console.log(players, 'players');

        //Search for a player by mapping over the players array and find the first player with an id that isn't the same with the currentPlayer but also with a status of "looking"
        const opponentId = Object?.keys(players).find(
          (id: string) => id !== playerId && players[id].status === 'looking'
        );
        // console.log(opponentId, 'opponentId');

        if (opponentId) {
          const opponentData = players[opponentId];

          setSearchingActive(true); //Changes the button to "Found a player"

          //Since an opponent has been found, I ref the database I defined in database and pass in the "activePlayers" collection  / the exact opponentId then i update
          await update(ref(database, `activePlayers/${opponentId}`), {
            playerName: opponentData.playerName,
            status: 'inGame',
            gameId: opponentId,
            // currentPlayerControl: !randomControl,
          });

          //Update Current players status
          await update(ref(database, `activePlayers/${playerId}`), {
            playerName: playerName ? playerName : 'PlayerTwo',
            status: 'inGame',
            gameId: playerId,
          });

          const playerOneDetails = {
            id: playerId,
            name: playerName ? playerName : 'PlayerTwo',
            avatar: Avatar ?? '',
          };

          const playerTwoDetails = {
            id: opponentId,
            name: opponentData.playerName,
            avatar: opponentData?.avatar ?? '',
          };

          //Create Game Session
          const getSessionId = await createGameSession(playerId, opponentId); //Creates Game session on realtime db
          const getGameSession = await handleGameSession(
            //Creates Game session on firestore db
            playerOneDetails,
            playerTwoDetails
          );

          // Update both players' records with the session ID
          await update(ref(database, `activePlayers/${playerId}`), {
            status: 'inGame',
            sessionId: getSessionId,
          });

          await update(ref(database, `activePlayers/${opponentId}`), {
            status: 'inGame',
            sessionId: getSessionId,
          });

          dispatch(
            givePlayerNames({
              playerOne: playerOneDetails,
              playerTwo: playerTwoDetails,
            })
          );

          dispatch(setAPlayerId(playerId)); //Store the currentPlayersId

          dispatch(
            setPlayersSessionId({
              playerOneSessionId: getSessionId,
            })
          );
          dispatch(setSessionId(getSessionId)); //Store the currentGameSessionId
          setLoading(false); //stopLoadingSpinner after searching for opponent
          setSearchingActive(false);
          setTimeout(() => {
            //Route to Homepage
            router.push('/');
          }, 2000);
        } else {
          console.log('Could not find you an opponent at this time');
        }
      },
      (error) => {
        console.error(error, 'An error has occurred onValue');
      }
    );
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
          winner: null,
          roundWinner: '',
          trackRoundPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          endOfRound: false,
          winningCombination: [],
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
        };
        await setDoc(doc(db, 'gameSessions', combinedId), newGameSession);
        return newGameSession;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="text-white">
        <div className="flex justify-center items-center h-screen">
          <form
            onSubmit={loginPlayer}
            className="bg-gray-800 rounded-lg p-8 shadow-lg w-96"
          >
            <h1 className="text-3xl font-bold mb-4">Login to your account</h1>
            <div className="flex flex-col gap-2">
              {/* <h2>Player Name </h2>
              <Input
                className="text-black text-[17px] my-2 border-none outline-none"
                type="text"
                placeholder="Pick a name"
                onChange={(e) => setPlayerName(e.target.value)}
              /> */}

              <Button
                type="submit"
                className="flex gap-2 items-center text-[16px] my-3"
                // onClick={createPlayer}
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
            <Link href="/signup" className="flex justify-center text-[14px]">
              Create new profile instead?{' '}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
