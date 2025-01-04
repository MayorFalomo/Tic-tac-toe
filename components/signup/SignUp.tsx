'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingSpinner } from './Loader';
import {
  get,
  onDisconnect,
  onValue,
  push,
  // query,
  ref,
  runTransaction,
  set,
  update,
} from 'firebase/database';
import { database, db, firestore } from '@/firebase-config/firebase';
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
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
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
// Define a type for your player data
interface Player {
  status: string;
  name: string;
  avatar: string;
}

const AvatarComp = React.lazy(() => import('@/components/AvatarComp'));

const SignUp = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [Avatar, setAvatar] = useState<string>(
    'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg'
  );
  const [avatarType, setAvatarType] = useState<AvatarType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [randomControl, setRandomControl] = useState<boolean>(false); //To pick the random player
  const [searchingActive, setSearchingActive] = useState<boolean>(false);
  const [confirmReady, setConFirmReady] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerDetails, setPlayerDetails] = useState<playerDetails | null>(null);
  const [opponentDetails, setOpponentDetails] = useState<playerDetails | null>(null);

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

      //create a separate db instance in the database named activePlayers
      const playerRef = push(ref(database, 'activePlayers')); //Create a new child reference
      const playerId = playerRef?.key ?? ''; // Get the unique key
      setPlayerId(playerId);
      //Create a new player Object by referencing the database ref and setting the object we want inside the db reference
      await set(playerRef, {
        name: playerNameSelect,
        status: 'online',
      });
      localStorage.setItem('playerKey', playerId);

      //add a players field to firestore db
      await setDoc(doc(db, 'players', playerId), {
        id: playerId,
        name: playerNameSelect,
        avatar: Avatar,
        createdAt: new Date().toISOString(),
        status: 'looking',
      });

      //Then it changes the players status to looking instead of online
      await handleUserPresence(playerId, playerNameSelect);
      console.log('Ran after handleUserPresence');

      //Since we've handled changing a users status we can now search for other players with a status of looking too
      await search(playerId);
      // await searchForOpponent(playerId);
    } catch (error) {
      console.log(error, 'error is from me');
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

  const search = async (playerId: string) => {
    try {
      const playerRef = doc(db, 'players', playerId);

      // Create a query to find players who are 'looking'
      const playersRef = collection(db, 'players');
      const q = query(playersRef, where('status', '==', 'looking'));
      const retrieved = localStorage.getItem('playerKey');

      // Listen for available opponents
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        snapshot.forEach(async (doc: any) => {
          const opponentId = doc.id;
          console.log(doc.id, 'doc');

          // Ensure the opponent is not the same as the current player
          if (opponentId !== playerId) {
            // Set both players to 'pending'
            await Promise.all([
              // updateDoc(playerRef, { status: 'pending' }),
              updateDoc(doc.ref, { status: 'pending' }),
            ]);

            // Confirm both players are ready
            const bothReady = await confirmBothPlayersReady();

            if (bothReady) {
              // Update both players to 'inGame'
              await Promise.all([
                // updateDoc(playerRef, { status: 'inGame' }),
                updateDoc(doc.ref, { status: 'inGame' }),
              ]);

              const playerOneDetails = {
                id: playerId,
                name: playerName,
                avatar: Avatar,
              };

              const playerTwoDetails = {
                id: opponentId,
                name: doc.data().name,
                avatar: doc.data().avatar,
              };
              setPlayerDetails(playerOneDetails);
              setOpponentDetails(playerTwoDetails);

              // Navigate to game page or perform other actions
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
                // unsubscribe();
              }, 2000);
            } else {
              console.log('Both players did not confirm readiness.');
            }
          }
        });
      });
    } catch (error) {
      console.error('Error has occurred:', error);
    }
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

  // Simulated confirmation function (replace with actual confirmation logic)
  const confirmBothPlayersReady = async () => {
    // Implement your logic to confirm both players are ready
    // For example, you could use a UI prompt or a timeout
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 6000); // Simulate a 3-second wait for confirmation
    });
  };

  const searchForOpponent = async (playerId: string) => {
    try {
      //This function will search for an opponent in the activePlayers db
      //If an opponent is found, it will update the status of the player to "inGame"
      const playersRef = ref(database, 'activePlayers'); //First, reference the db we want to search through
      console.log('I ran to here');

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

            //Returns the combinedSessionId of both players
            const getSessionId = await createGameSession(
              playerId,
              opponentId,
              randomControl
            ); //Creates Game session on realtime db
            const getGameSession = await handleGameSession(
              //Creates Game session on firestore db
              playerOneDetails,
              playerTwoDetails
            );

            // const retrieved = localStorage.getItem('playerKey');
            // if (retrieved === getGameSession?.players?.playerOne?.id) {
            //   await updateDoc(doc(db, 'gameSessions', combinedId), {
            //     [retrieved]: 'ready',
            //   });
            // }

            // const opponentData = players[opponentId]; // finds and provides the object of the person with that opponentId
            console.log(opponentData, 'opponentData');

            setSearchingActive(true); //Changes the button to "Found a player"

            // Use a transaction to safely update the opponent's status
            // Update Opponent's Status
            // const opponentTransaction = await runTransaction(
            //   ref(database, `activePlayers/${opponentId}`),
            //   (currentData) => {
            //     if (currentData && currentData.status === 'looking') {
            //       currentData.status = 'pending';
            //       return currentData;
            //     }
            //     return; // Abort if the status is not 'looking'
            //   }
            // );

            // Update Current Player's Status
            // const playerTransaction = await runTransaction(
            //   ref(database, `activePlayers/${playerId}`),
            //   (currentData) => {
            //     if (currentData && currentData.status === 'looking') {
            //       currentData.status = 'pending';
            //       return currentData;
            //     }
            //     return; // Abort if the status is not 'looking'
            //   }
            // );

            // Check if both players are in the "pending" state
            // if (opponentTransaction && playerTransaction) {
            //   // Fetch the opponent's data
            //   const opponentDataSnapshot = await get(
            //     ref(database, `activePlayers/${opponentId}`)
            //   );
            //   const currentPlayerDataSnapshot = await get(
            //     ref(database, `activePlayers/${playerId}`)
            //   );

            //   // Check if the opponent's status is pending
            //   if (opponentDataSnapshot.exists() && currentPlayerDataSnapshot.exists()) {
            //     const opponentData = opponentDataSnapshot.val();
            //     const currentPlayerData = currentPlayerDataSnapshot.val();

            //     if (
            //       opponentData.status === 'pending' &&
            //       currentPlayerData.status === 'pending'
            //     ) {
            //       // Update both players' statuses to "inGame"
            //       await update(ref(database, `activePlayers/${opponentId}`), {
            //         status: 'inGame',
            //         gameId: playerId, // Assuming the gameId should point to the current player
            //       });
            //       await update(ref(database, `activePlayers/${playerId}`), {
            //         status: 'inGame',
            //         gameId: opponentId,
            //       });
            //     }
            //   }
            // }
            // //Since an opponent has been found, I ref the database I defined in database and pass in the "activePlayers" collection  / the exact opponentId then i update
            // await update(ref(database, `activePlayers/${opponentId}`), {
            //   //Before the player can update he's opponents status the opponent also has to have found player1, if they have found each other then the opponent would need to check if the id is the same with the opponentData
            //   playerName: opponentData.playerName,
            //   status: 'inGame',
            //   gameId: opponentId,
            // });
            // // console.log('update to here');

            // //Update Current players status
            // await update(ref(database, `activePlayers/${playerId}`), {
            //   playerName: playerName!,
            //   status: 'inGame',
            //   gameId: playerId,
            // });

            // const playerOneDetails = {
            //   id: playerId,
            //   name: playerName!,
            //   avatar:
            //     Avatar ??
            //     'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg',
            // };

            // const playerTwoDetails = {
            //   id: opponentId,
            //   name: opponentData.playerName,
            //   avatar:
            //     opponentData?.avatar ??
            //     'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg',
            // };
            console.log(playerOneDetails, playerTwoDetails);

            //Create Game Session
            //Note const getSessionId = await createGameSession(playerId, opponentId); //Creates Game session on realtime db
            // const getGameSession = await handleGameSession(
            //   //Creates Game session on firestore db
            //   playerOneDetails,
            //   playerTwoDetails
            // );

            // Assuming combinedId is available
            const gameSessionDoc = await getDoc(
              doc(db, 'gameSessions', getGameSession?.sessionId!)
            ); // Replace 'sessionId' with your actual session ID
            console.log(gameSessionDoc, 'gameSessionDoc');

            if (gameSessionDoc.exists()) {
              const gameSessionData = gameSessionDoc.data();

              // Check if both players are ready
              if (
                gameSessionData.playersGameStatus.playerOne === 'ready' &&
                gameSessionData.playersGameStatus.playerTwo === 'ready'
              ) {
                // Proceed to update players' statuses in Realtime Database
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

                // Redirect to home page
                // For React Router v5
                // history.push('/home');

                // For React Router v6
                // navigate('/home');
              } else {
                console.log('Players are not ready yet.');
                // Handle the case where players are not ready
              }
            } else {
              console.log('Game session does not exist.');
              // Handle the case where the game session is not found
            }
            console.log(getGameSession, 'getGameSession');

            // Update both players' records with the session ID
            // await update(ref(database, `activePlayers/${playerId}`), {
            //   status: 'inGame',
            //   sessionId: getSessionId,
            // });

            // await update(ref(database, `activePlayers/${opponentId}`), {
            //   status: 'inGame',
            //   sessionId: getSessionId,
            // });
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

  useEffect(() => {
    if (playerId && playerDetails && opponentDetails) {
      // Create a combined ID based on player IDs
      const combinedId =
        playerDetails?.id! > opponentDetails?.id!
          ? playerDetails?.id + opponentDetails?.id!
          : opponentDetails?.id! + playerDetails?.id!;
      // const combine = playerDetails?.id + opponentDetails?.id!;
      // const combined = opponentDetails?.id! + playerDetails?.id!;
      // Create a query to find the game session
      const sessionsRef = collection(db, 'gameSessions');
      const q = query(sessionsRef, where('id', '==', combinedId));
      console.log(q, 'qquttee');

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            console.log(doc, 'docusaurus');

            const gameSession = { id: doc.id, ...doc.data() };
            dispatch(givePlayerNames(gameSession));
            console.log(gameSession, 'gameSession line 643');

            router.push('/'); // Redirect to homepage
          });
        }
      });

      // Cleanup function to unsubscribe from the listener
      return () => unsubscribe();
    }
  }, [playerDetails, opponentDetails, playerId, router]);

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
        console.log(sessionData, 'sessionData loaded');
        return sessionData;
      } else {
        // const retrieved = localStorage.getItem('playerKey');
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
          winner: null,
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
          // playersGameStatus: {
          //   playerOne: 'ready',
          //   playerTwo: 'ready',
          // },
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
                  <span>Create Profile </span>
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
