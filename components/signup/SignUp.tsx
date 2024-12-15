'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingSpinner } from './Loader';
import { get, onDisconnect, onValue, push, ref, set, update } from 'firebase/database';
import { database, db } from '@/firebase-config/firebase';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setAPlayerId } from '@/lib/features/userSlice';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import {
  setCombinedGameSessionId,
  setPlayersSessionId,
  setSessionId,
  setTrackWhoPlays,
} from '@/lib/features/TrackerSlice';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { GameSession, PlayerDetails } from '@/app/types/types';
import { createGameSession, handleUserPresence } from '../funcs/HandleAuth';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
type Props = {};

interface playerDetails {
  id: string;
  name: string;
  avatar: string;
}

export interface AvatarType {
  avatarType: string;
  avatarUrl: string;
}

const AvatarComp = React.lazy(() => import('@/components/AvatarComp'));

const SignUp = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [Avatar, setAvatar] = useState<string>('');
  const [avatarType, setAvatarType] = useState<AvatarType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const [combinedId, setCombinedId] = useState<string>('');
  const dispatch = useAppDispatch();

  const router = useRouter();

  // console.log(Avatar, 'avatar');

  useEffect(() => {
    const randomNumber = Math.random();
    const getBoolean = randomNumber > 0.5 ? true : false;
    setRandomControl(getBoolean);
  }, []);

  //Function to create a player
  const createPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true); //SetThe loading spinner to be true
      const playerNameSelect = playerName.length > 1 ? playerName : 'PlayerOne';

      //create a separate db instance in the database named activePlayers
      const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
      const playerId = playerRef.key || ''; // Get the unique key
      //Create a new player Object by referencing the database ref and setting the object we want inside the db reference
      await set(playerRef, {
        player: playerNameSelect,
        status: 'online',
      });
      localStorage.setItem('playerKey', playerId);

      //add a players field to firestore db
      await setDoc(doc(db, 'players', playerId), {
        id: playerId,
        player: playerNameSelect,
        avatar: Avatar,
        createdAt: new Date().toISOString(),
      });

      //Then it changes the players status to looking instead of online
      await handleUserPresence(playerId, playerNameSelect);
      console.log('Ran after handleUserPresence');

      //Since we've handled changing a users status we can now search for other players with a status of looking too
      await searchForOpponent(playerId);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  //Function to
  // const handleUserPresence = async (userId: string) => {
  //   // console.log(userId, "Hello world");

  //   const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId

  //   //Set the users status to online when they connect
  //   set(userRef, {
  //     playerName: playerName.length > 0 ? playerName : 'PlayerOne',
  //     status: 'looking',
  //   }); //This object shows first on console

  //   //Using firebase onDisconnect functionality to detect when a user goes offline
  //   onDisconnect(userRef).set({ status: 'offline' });
  // };

  const searchForOpponent = async (playerId: string) => {
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
          });

          //Update Current players status
          await update(ref(database, `activePlayers/${playerId}`), {
            playerName: playerName!,
            status: 'inGame',
            gameId: playerId,
          });

          const playerOneDetails = {
            id: playerId,
            name: playerName!,
            avatar:
              Avatar ??
              'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg',
          };

          const playerTwoDetails = {
            id: opponentId,
            name: opponentData.playerName,
            avatar:
              opponentData?.avatar ??
              'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg',
          };

          //Create Game Session
          const getSessionId = await createGameSession(playerId, opponentId); //Creates Game session on realtime db
          const getGameSession = await handleGameSession(
            //Creates Game session on firestore db
            playerOneDetails,
            playerTwoDetails
          );

          console.log(getGameSession, 'getGameSession');

          // Update both players' records with the session ID
          await update(ref(database, `activePlayers/${playerId}`), {
            status: 'inGame',
            sessionId: getSessionId,
          });

          await update(ref(database, `activePlayers/${opponentId}`), {
            status: 'inGame',
            sessionId: getSessionId,
          });

          dispatch(setAPlayerId(playerId)); //Store the currentPlayersId

          dispatch(
            setPlayersSessionId({
              playerOneSessionId: getSessionId,
            })
          );
          dispatch(setSessionId(getSessionId)); //Store the currentGameSessionId
          setLoading(false); //stopLoadingSpinner after searching for opponent

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

  //Handle Game Session in the firestore db
  const handleGameSession = async (
    playerOneDetails: playerDetails,
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
        console.log(sessionData, 'sessionData');
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
          endOfRound: false,
          trackRoundPlayer: randomControl ? playerOneDetails?.id : opponent?.id,
          winner: null,
          winningCombination: [],
          goToNextRound: true,
          players: {
            playerOne: {
              id: playerOneDetails?.id,
              name: playerOneDetails?.name,
              avatar: playerOneDetails?.avatar,
            },
            playerTwo: {
              id: opponent?.id,
              name: opponent?.name,
              avatar:
                opponent?.avatar! ??
                'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg',
            },
          },
        };
        await setDoc(doc(db, 'gameSessions', combinedId), newGameSession);
        await saveAvatar(playerOneDetails?.id, opponent?.id, combinedId);

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
        dispatch(
          givePlayerNames({
            playerOne: playerOneDets,
            playerTwo: playerTwoDets,
          })
        );
        dispatch(setCombinedGameSessionId(combinedId));
        return newGameSession;
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Function to get the avatar from one doc and save the avatar in the gamesessions document.
  //I'm not saving directly to the gameSessions doc because i need to have a combinedId already
  const saveAvatar = async (playerId: string, opponentId: string, combinedId: string) => {
    //get each players details
    const playerOneDetails = await getDoc(doc(db, 'players', playerId));
    const playerTwoDetails = await getDoc(doc(db, 'players', opponentId));

    if (playerOneDetails.exists() && playerTwoDetails.exists()) {
      const playerOneData = playerOneDetails.data();
      const playerTwoData = playerTwoDetails.data();

      //save the avatar from players in the gamesessions document
      await updateDoc(doc(db, 'gameSessions', combinedId), {
        'players.playerOne.avatar': playerOneData?.avatar,
        'players.playerTwo.avatar': playerTwoData?.avatar,
      });
    }
  };

  //Logic to create a game session
  // A function that takes in two params which are playerId and opponentId
  // const createGameSession = async (playerId: string, opponentId: string) => {
  //   //might return the sessionId,
  //   const sessionRef = push(ref(database, 'gameSessions')); //creates a ref to our database and name it "gameSessions"

  //   //Our session ref would create/set a new object in a sessionRef
  //   await set(sessionRef, {
  //     playerOneId: playerId,
  //     playerTwoId: opponentId,
  //     status: 'active',
  //     createdAt: new Date().toISOString(),
  //   });

  //   return sessionRef.key;
  // };

  return (
    <div>
      <div className="text-white">
        <div className="flex justify-center items-center h-screen">
          <form
            onSubmit={createPlayer}
            className="bg-gray-800 rounded-lg p-8 shadow-lg w-96"
          >
            <h1 className="text-3xl font-bold mb-4">Sign up PlayerName</h1>
            <div className="flex flex-col gap-2">
              <h2>Player Name </h2>
              <Input
                className="text-black text-[17px] my-2 border-none outline-none"
                type="text"
                placeholder="Pick a name"
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Select
                onValueChange={(value) => {
                  if (value === 'Naruto') {
                    setAvatarType({
                      avatarType: 'Naruto',
                      avatarUrl: 'https://narutodb.xyz/api/character',
                    });
                  } else if (value === 'Avatar') {
                    setAvatarType({
                      avatarType: 'Avatar',
                      avatarUrl: 'https://last-airbender-api.fly.dev/api/v1/characters',
                    });
                  } else {
                    setAvatarType({
                      avatarType: 'Random',
                      avatarUrl: `https://avatar.iran.liara.run/public`,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-[100%] text-[16px] text-black">
                  <SelectValue placeholder="Select an Avatar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select your Avatar </SelectLabel>
                    <SelectItem value="Naruto">Naruto style</SelectItem>
                    <SelectItem value="Avatar">Avatar last-bender</SelectItem>
                    <SelectItem value="Random">Random</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button disabled={loading} type="submit" className="text-[16px] my-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    {searchingActive ? 'Found a player!' : `Searching for player`}
                    <LoadingSpinner />{' '}
                  </span>
                ) : (
                  <span>Creating Profile </span>
                )}{' '}
              </Button>
            </div>
            <Link href="/login" className="flex justify-center text-[14px]">
              Login instead?{' '}
            </Link>
          </form>
        </div>
      </div>
      {avatarType && (
        <AvatarComp
          avatarType={avatarType}
          setAvatarType={setAvatarType}
          setAvatar={setAvatar}
        />
      )}
    </div>
  );
};

export default SignUp;

//If I'm going to be using the two for this
//The player status and matching would still be handled as
