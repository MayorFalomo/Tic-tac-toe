'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingSpinner } from './Loader';
import { get, onValue, push, ref, runTransaction, set, update } from 'firebase/database';
import { database, db } from '@/firebase-config/firebase';
import { useAppDispatch } from '@/lib/hooks';
import { setAPlayerId } from '@/lib/features/userSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import {
  setCombinedGameSessionId,
  setPlayersSessionId,
  setSessionId,
} from '@/lib/features/TrackerSlice';
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
import { AvatarTheme, GameSession, PlayerDetails } from '@/app/types/types';
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
import toast from 'react-hot-toast';
import { AnimeAvatars, SuperHeroes } from '../PictureStore';
import { AnimatePresence, motion } from 'framer-motion';

interface playerDetails {
  id: string;
  name: string;
  avatar: string;
}

export interface AvatarType {
  avatarType: string;
  avatarUrl: string;
  avatarName?: string;
}

const AvatarComp = React.lazy(() => import('@/components/AvatarComp'));

const SignUp: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [Avatar, setAvatar] = useState<string>(
    'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg'
  );
  const [avatarType, setAvatarType] = useState<AvatarType | null>(null);
  const [AnimePictures, setAnimePictures] = useState<AvatarTheme[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const [showPlayerName, setShowPlayerName] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const router = useRouter();

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
      setShowPlayerName(true);
      //create a separate db instance in the database named activePlayers
      const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
      const playerId = playerRef?.key ?? ''; // Get the unique key

      //Create a new player Object by referencing the database ref and setting the object we want inside the db reference
      await set(playerRef, {
        name: playerNameSelect,
        status: 'online',
      });

      localStorage.setItem('playerKey', playerId); // Save the id key in localstorage as a key named 'playerKey'

      //create a players field on firestore using the returned playerId from firestore db
      await setDoc(doc(db, 'players', playerId), {
        id: playerId,
        name: playerNameSelect,
        avatar: Avatar,
        createdAt: new Date().toISOString(),
        status: 'looking',
      });

      //Then it changes the players status to looking instead of online
      await handleUserPresence(playerId, playerNameSelect);

      //Since we've handled changing a users status we can now search for other players with a status of looking too
      await searchForOpponent(playerId);
    } catch (error) {
      toast.error('Error while trying to create a player');
      console.log(error, 'An error has occurred while trying to create player');
      setLoading(false);
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

  const opponentSearch = async (playerId: string) => {
    try {
      const playersRef = ref(database, 'activePlayers');

      // Listen for changes in the activePlayers
      onValue(playersRef, async (snapshot) => {
        const players = snapshot.val();
        console.log(players, 'players');

        const opponentId = Object.keys(players).find(
          (id: string) => players[id].status === 'looking' && id !== playerId
        );
        console.log(opponentId, 'opponentId');

        if (opponentId) {
          const opponentData = players[opponentId];

          // Prepare player details
          const playerOneDetails = {
            id: playerId,
            name: playerName,
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

          // Set both players to a 'pending' status first
          await Promise.all([
            runTransaction(
              ref(database, `activePlayers/${playerId}/status`),
              (currentStatus) => {
                if (currentStatus === 'looking') {
                  return 'pending'; // Set to pending
                }
                return; // Abort if status has changed
              }
            ),
            runTransaction(
              ref(database, `activePlayers/${opponentId}/status`),
              (currentStatus) => {
                if (currentStatus === 'looking') {
                  return 'pending'; // Set to pending
                }
                return; // Abort if status has changed
              }
            ),
          ]);
          // Check if both players are now 'pending'
          const updatedPlayersSnapshot = await get(playersRef);
          const updatedPlayers = updatedPlayersSnapshot.val();

          const playerOneStatus = updatedPlayers[playerId]?.status;
          const playerTwoStatus = updatedPlayers[opponentId]?.status;

          if (playerOneStatus === 'pending' && playerTwoStatus === 'pending') {
            const bothReady = await confirmBothPlayersReady();

            if (bothReady) {
              // Only now update both players to 'inGame'
              await Promise.all([
                runTransaction(
                  ref(database, `activePlayers/${playerId}/status`),
                  (currentStatus) => {
                    if (currentStatus === 'pending') {
                      return 'inGame'; // Finalize to inGame
                    }
                    return; // Abort if status has changed
                  }
                ),
                runTransaction(
                  ref(database, `activePlayers/${opponentId}/status`),
                  (currentStatus) => {
                    if (currentStatus === 'pending') {
                      return 'inGame'; // Finalize to inGame
                    }
                    return; // Abort if status has changed
                  }
                ),
              ]);

              const getSessionId = await createGameSession(
                playerId,
                opponentId,
                randomControl
              );
              const getGameSession = await handleGameSession(
                playerOneDetails,
                playerTwoDetails
              );

              console.log('Game session created:', getSessionId);
              console.log(getGameSession, 'getGameSession');

              dispatch(setAPlayerId(playerId)); //Store the currentPlayersId

              dispatch(
                setPlayersSessionId({
                  playerOneSessionId: getSessionId,
                })
              );
              dispatch(setSessionId(getSessionId)); //Store the currentGameSessionId
              setLoading(false);
              setTimeout(() => {
                router.push('/');
              }, 2000);
            } else {
              console.log('Both players did not confirm readiness.');
            }
          } else {
            console.log(
              'One of the players is not in pending status. Cannot create game session.'
            );
          }
        }
      });
    } catch (error) {
      console.log('Error has occurred');
    }
  };

  const search = async (playerId: string) => {
    try {
      //This function will search for an opponent in the activePlayers db
      //If an opponent is found, it will update the status of the player to "inGame"
      const playersRef = ref(database, 'activePlayers'); //First, reference the db we want to search through
      // console.log('I ran to here');

      //Listen for changes in the activePlayers
      onValue(
        playersRef,
        async (snapshot) => {
          const players = snapshot.val(); //Returns an object of all the players name and status
          console.log(players, 'players');

          //Search for a player by mapping over the players array and find the first player with an id that isn't the same with the currentPlayer but also with a status of "looking"
          const opponentId = Object?.keys(players).find(
            (id: string) => players[id].status === 'looking' && id !== playerId
          );
          console.log(opponentId, 'opponentId');

          //returns a string id of the opponent
          if (opponentId) {
            const opponentData = players[opponentId]; // finds and provides the object of the person with that opponentId

            //!I've created a session immediately after finding an opponent
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
            // //Since an opponent has been found, I ref the database I defined in database and pass in the "activePlayers" collection  / the exact opponentId then i update
            await update(ref(database, `activePlayers/${opponentId}`), {
              //Before the player can update he's opponents status the opponent also has to have found player1, if they have found each other then the opponent would need to check if the id is the same with the opponentData
              playerName: opponentData.playerName,
              status: 'inGame',
              gameId: opponentId,
            });

            // //Update Current players status
            await update(ref(database, `activePlayers/${playerId}`), {
              playerName: playerName!,
              status: 'inGame',
              gameId: playerId,
            });

            //Create Game Session
            const getSessionId = await createGameSession(
              playerId,
              opponentId,
              randomControl
            );
            //Creates Game session on realtime db
            const getGameSession = await handleGameSession(
              //Creates Game session on firestore db
              playerOneDetails,
              playerTwoDetails
            );

            await update(ref(database, `activePlayers/${playerId}`), {
              status: 'inGame',
              sessionId: getSessionId,
            });

            await update(ref(database, `activePlayers/${opponentId}`), {
              status: 'inGame',
              sessionId: getSessionId,
            });

            dispatch(setAPlayerId(playerId)); //Store the currentPlayersId

            dispatch(setSessionId(getSessionId)); //Store the currentGameSessionId

            // Update both players' records with the session ID
            await update(ref(database, `activePlayers/${playerId}`), {
              status: 'inGame',
              sessionId: getSessionId,
            });

            await update(ref(database, `activePlayers/${opponentId}`), {
              status: 'inGame',
              sessionId: getSessionId,
            });

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
    } catch (error) {
      console.log(error, 'error occurred in searchOpponent');
    }
  };

  //Handle Game Session in the firestore db
  const handleGameSession = async (
    playerOneDetails: playerDetails,
    opponent: PlayerDetails
  ) => {
    //Compare the Id then combine The Id to create something unique from both players
    const combinedId =
      playerOneDetails?.id > opponent?.id
        ? playerOneDetails?.id + opponent?.id
        : opponent?.id + playerOneDetails?.id;

    try {
      //Get the the current game session using the combinedId
      const sessionDoc = await getDoc(doc(db, 'gameSessions', combinedId));
      //If it exists
      if (sessionDoc.exists()) {
        //get the data and return the session
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
        //Thi runs if the combinedId doesn't exist previously
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
        await saveAvatar(playerOneDetails?.id, opponent?.id, combinedId);

        setPlayersSessionId(doc(db, 'gameSessions', combinedId));
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
        return newGameSession; //Return the created gameSession
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Function to get the avatar from one doc and save the avatar in the gamesessions document.
  //I'm not saving directly to the gameSessions doc because I need to have a combinedId already
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

  return (
    <div onClick={() => setAvatarType(null)} className="bg-[#000] w-[100vw] h-[100vh]">
      <div className="text-brightGreen">
        <div className="flex justify-center items-center h-screen">
          <form
            onSubmit={createPlayer}
            className="border border-white/40 bg-black rounded-lg py-8 px-8 min-w-[250px] w-[400px] max-[550px]:w-[80%] max-[550px]:px-3 "
          >
            <h1 className="flex flex-nowrap items-start gap-2 text-[22px] max-[550px]:text-[20px] font-bold mb-2 overflow-hidden">
              <span>Welcome Player</span>
              <AnimatePresence>
                {showPlayerName && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    - {playerName}{' '}
                  </motion.span>
                )}
              </AnimatePresence>
            </h1>
            <p className="text-white text-[14px]">
              Please Sign up and search for a player{' '}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Input
                className="text-white text-[16px] bg-transparent rounded-none my-2 placeholder:text-white/60 border-b border outline-none border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                type="text"
                placeholder="Enter your Player name"
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
              <Select
                onValueChange={(value) => {
                  if (value === 'Anime') {
                    setAnimePictures(AnimeAvatars);
                  } else if (value === 'heroes') {
                    setAnimePictures(SuperHeroes);
                  } else if (value === 'Avatar') {
                    setAvatarType({
                      avatarType: 'Avatar',
                      avatarUrl: 'https://last-airbender-api.fly.dev/api/v1/characters',
                    });
                  } else {
                    setAvatarType({
                      avatarType: 'initials',
                      avatarName: playerName ?? 'Hero Arlen',
                      avatarUrl: ``,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-[100%] bg-transparent rounded-none border-b-white text-white/60 border-b border outline-none border-x-0 border-t-0 text-[16px] focus:ring-offset-0 focus:ring-0">
                  <SelectValue
                    className=" placeholder:text-white"
                    placeholder="Select your Avatar"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select your Avatar </SelectLabel>
                    <SelectItem value="Anime">Anime style</SelectItem>
                    <SelectItem value="heroes">Superheroes and Villains</SelectItem>
                    <SelectItem value="Avatar">Avatar last-bender</SelectItem>
                    <SelectItem value="initials">Initials style</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                disabled={loading}
                type="submit"
                className={`${
                  loading ? 'cursor-not-allowed' : 'cursor-pointer'
                } text-[16px] bg-[#2CBF93] hover:bg-white hover:text-black transition-all duration-500 text-white my-3`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    {searchingActive ? 'Found a player!' : `Searching for player`}
                    <LoadingSpinner
                      style={{
                        marginLeft: '3px',
                      }}
                    />{' '}
                  </span>
                ) : (
                  <span>Enter Game </span>
                )}{' '}
              </Button>
            </div>
            <Link href="/login" className="flex justify-center text-[14px]">
              Login instead?{' '}
            </Link>
          </form>
        </div>
      </div>
      {avatarType || AnimePictures?.length > 1 ? (
        <AvatarComp
          avatarType={avatarType}
          setAvatarType={setAvatarType}
          setAvatar={setAvatar}
          animePictures={AnimePictures}
          setAnimePictures={setAnimePictures}
        />
      ) : (
        ''
      )}
    </div>
  );
};

export default SignUp;

//If I'm going to be using the two for this
//The player status and matching would still be handled as

//!The Problem
//First player to click the search button gets to find an opoonentId and change the found opponents status before the opponent can pair with the person since their own code running first already changed the status of the person to inGame
//So basically player1 finds player2 first and he's status changes to inGame first while also changing player2 status, meanwhile player2 cannot find playerOne since player1 status is now inGame instead of looking.

//*My Options
// Find a way for playerOne to find player2 and vice versa at the same time so that both players status change at the same time
// If player1 is looking but finds player 2 and updates player 2 to inGame before player 2 can find player 1, then player 2 should get the details of the player 1 that was paired with him update the statuf of playerOne to Looking then pair with them.
// Next option is to maybe use a validation check so that

//on the frontend having a state in a useEffect to store players like for gameSessions dunno how that would be useful yet sha
//Chage it on the player1 side by having a field in GameSessions that would reflect ready when both have actually found people

//Ensuring the other player also has the details before updating anything is actually critical

//!New Solution
//Since we need to immediately react to if a new person joins the "looking status pool"
//*I'd continue to use firestore/database so I get the opponent to pair
//!Differrence now is I won't update anything like status yet at all on firestore
//Note Instead after opponentId, I then immediately create a game session on firebase/firestore.
//? After creation the players would both have their own sessions right?
//Now I'd need to combine the Id's of the gameSessions wHich is how my sessions would be created Normally
//# Now If I can I'd also need to save maybe a reference from firestore rtdb to firestore gameSession i just created
//With the power of my combinedId I can compare from which player side i'm viewing it.
//When creating the sessions, I can have an object field in the session object just like scores but with status that would update to maybe 'inGame' when both are ready.
//That process would determine whether a player gets logged in or not he's status on rtdb would have to update too at some point maybe after firestore has registered both are ready
//So immediately after I get the opponent Id I don't u
