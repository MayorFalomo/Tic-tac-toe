import { GameSession, MovesObject } from '@/app/types/types';
import {
  SessionId,
  setPlayersSessionId,
  setTrackDisableRound,
  setTrackScores,
  setTrackWinner,
} from '@/lib/features/TrackerSlice';
import { database, db } from '@/firebase-config/firebase';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { get, onValue, push, ref, update } from '@firebase/database';
import toast from 'react-hot-toast';
import DrawLine from '@/app/animation/DrawLine';
import { AnimatePresence } from 'framer-motion';

type MappedOver = {
  val: any;
  index: number;
  firstPlayer: string;
  gameData: GameSession | null;
  movesData: MovesObject[];
  setMovesData: React.Dispatch<React.SetStateAction<MovesObject[]>>;
  setGameData: React.Dispatch<React.SetStateAction<GameSession | null>>;
  combinedId: string;
};

const Possible: React.FC<MappedOver> = ({
  val,
  index,
  firstPlayer,
  gameData,
  movesData,
  setMovesData,
  setGameData,
  combinedId,
}) => {
  const [storedCurrentPlayerChoices, setStoredCurrentPlayerChoices] = useState<number[]>(
    []
  );
  const possibility = useAppSelector((state) => state.possible.possibility); //State to hold all the possible combinations

  const playersChoice = useAppSelector((state: RootState) => state.players); //All the index chosen are pushed inside the playerOneChoice Array

  const track = useAppSelector((state: RootState) => state.track); //State to track rounds

  const disableDoubleClick = useAppSelector(
    (state: RootState) => state.track.disabledClick
  ); // State to try and control double clicking

  const playersObject = useAppSelector((state: RootState) => state.players.players);
  // const gameId = useAppSelector((state: RootState) => state.user.gameId);
  const movesPlayed = useAppSelector((state: RootState) => state.players?.moves);

  const dispatch = useAppDispatch();

  //Function to handle what happens when a user clicks on a box
  // const handleSelections = async (
  //   selected: number,
  //   currPlayerControl: boolean
  // ) => {
  //   // console.log(currPlayerControl, "curr");

  //   if (disableDoubleClick) return; // Prevent further clicks if loading

  //   dispatch(setDisabledClick(true)); // Set loading state to true

  //   // If currPlayerControl is false then playerOne is the one playing
  //   if (!currPlayerControl) {
  //     const playerObj: Selected = {
  //       player: "PlayerOne",
  //       choice: selected,
  //     };

  //     dispatch(addPlayerOne(playerObj));

  //     dispatch(changeCurrentPlayerControl(true));

  //     // setPlayerOnesChoice((prev) => {
  //     //   return [...prev, playerObj];
  //     // });
  //   } else if (
  //     currPlayerControl
  //     // &&
  //     // playerOnesChoice &&
  //     // playerOnesChoice.length > 0
  //   ) {
  //     const playerObj: Selected = {
  //       player: "PlayerTwo",
  //       choice: selected,
  //     };

  //     dispatch(addPlayerTwo(playerObj));
  //     dispatch(changeCurrentPlayerControl(false));

  //     // setPlayerTwosChoice((prev) => {
  //     //   return [...prev, playerObj];
  //     // });

  //     // Simulate some delay for processing (optional)
  //     await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust time as needed
  //   }
  //   dispatch(setDisabledClick(false)); // Reset loading state
  // };
  // console.log(playersObject, 'playersObj');

  const handleSelections = async (selected: number, sessionId: SessionId) => {
    //# First I reference both the documents which would be called playerMoves based on the combined sessionId of both players.
    //! Then I also need to check who plays first by checking the currentlyPlaying field in the players object.
    //* Before I play, I need to determine whose turn it is first by checking the currentTurn field in the gameSession object.
    //? If the currentTurn is equal to the playerId of the current player, then it is their turn.
    //? If it isn't, then I throw an error saying it is not their turn.
    // When I know whose turn it is, The Id of the current players turn must match what is being sent from the move object, If they aren't a match Then I throw an error saying it is not their turn.
    //? If it is their turn, then I check on firebase, if the choice has been played before in the player moves ...If it has, then I throw an error saying box has been selected previously.
    //# If it hasn't been selected before, then I go on and push the object to firebase playerMoves based on the sessionId and whoever's turn it is.
    //? After that I update the currentTurn field to the next player's id, so that I can determine whose turn is next
    // //Reference the playerMoves database
    // const playerOneMovesRef = ref(
    //   database,
    //   `playersMoves/${sessionId.playerOneSessionId}`
    // );
    // const playerTwoMovesRef = ref(
    //   database,
    //   `playersMoves/${sessionId.playerTwoSessionId}`
    // );
    // //?Getting the playerObject details
    // const playerOne = playersObject?.playerOne;
    // const playerTwo = playersObject?.playerTwo;
    // // Determine which player's id is used based on currentlyPlaying, If currentlyPlaying for playerOne is true, then we know we're using playerOneId else we're gonna use playerTwoId
    // const currentPlayerId = playerOne?.currentlyPlaying
    //   ? playerOne?.id
    //   : playerTwo?.currentlyPlaying
    //   ? playerTwo?.id
    //   : '';
    // if (playerOne.currentlyPlaying && currentPlayerId === trackCurrentPlayerId) {
    //   //# Check for if the selected box is already taken
    //   //# i'm getting the two playerMoves so I can check through them if the move has been picked
    //   const existingPlayerOneMoves = await get(playerOneMovesRef);
    //   const existingPlayerTwoMoves = await get(playerTwoMovesRef);
    //   const movesOneData = existingPlayerOneMoves.val() || {};
    //   const movesTwoData = existingPlayerTwoMoves.val() || {};
    //   // Check if the box is already taken
    //   const isBoxTaken =
    //     Object.values(movesOneData).some((move) => move?.choice === selected) &&
    //     Object.values(movesTwoData).some((move) => move?.choice === selected);
    //   if (isBoxTaken) {
    //     console.error('This box is already taken!');
    //     return;
    //   }
    //   // Prepare the move data
    //   const singleMove = {
    //     choice: selected,
    //     playerId: currentPlayerId,
    //     timeStamp: new Date().toISOString(),
    //   };
    //   // console.log('singleMove playerOne');
    //   // Push the move to Firebase
    //   const res = await push(playerOneMovesRef, singleMove);
    //   // fetchGameMoves(gameSessionId?.playerOneSessionId);
    //   // console.log(res, 'move result');
    //   if (res) {
    //     // Fetch moves from both players
    //     const playerOneMoves = await get(playerOneMovesRef);
    //     const playerTwoMoves = await get(playerTwoMovesRef);
    //     const movesOneData = playerOneMoves.val() || {};
    //     const movesTwoData = playerTwoMoves.val() || {};
    //     // Dispatch or store the combined moves
    //     dispatch(setMoves(movesPlayed)); // Assuming setMoves updates the game state
    //     dispatch(updateCurrentlyPlaying(playerOne?.id)); // Update the local state to reflect the next player's turn
    //   }
    // }
  };

  const handleMoves = async () => {
    try {
      const movesDoc = await getDoc(doc(db, 'playersMoves', combinedId));
      if (movesDoc.exists()) {
        const movesData = movesDoc.data();
        // console.log(movesData, 'movesData');
      } else {
        const moveObject = {
          moves: [],
        };
        await setDoc(doc(db, 'playersMoves', combinedId), moveObject);

        // Create or update user chats for player one
        const playerOneChatDoc = doc(db, 'playerChats', playersObject?.playerOne?.id);
        const playerTwoChatDoc = doc(db, 'playerChats', playersObject?.playerTwo?.id);

        // Check if player one chat document exists
        const playerOneChatDocSnap = await getDoc(playerOneChatDoc);
        if (!playerOneChatDocSnap.exists()) {
          await setDoc(playerOneChatDoc, {}); // Create an empty document if it doesn't exist
        }

        // Update player one chat document
        await updateDoc(playerOneChatDoc, {
          [combinedId + '.userInfo']: {
            uid: playersObject?.playerTwo?.id,
            username: playersObject?.playerTwo?.name,
            avatar: playersObject?.playerTwo?.avatar,
          },
          [combinedId + '.date']: serverTimestamp(),
        });

        // Check if player two chat document exists
        const playerTwoChatDocSnap = await getDoc(playerTwoChatDoc);
        if (!playerTwoChatDocSnap.exists()) {
          await setDoc(playerTwoChatDoc, {}); // Create an empty document if it doesn't exist
        }

        // Update player two chat document
        await updateDoc(playerTwoChatDoc, {
          [combinedId + '.userInfo']: {
            uid: playersObject?.playerOne?.id,
            username: playersObject?.playerOne?.name,
            avatar: playersObject?.playerOne?.avatar,
          },
          [combinedId + '.date']: serverTimestamp(),
        });
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const updateGameState = async (selected: number) => {
    try {
      const gameDoc = await getDoc(doc(db, 'gameSessions', combinedId));
      const movesDocu = await getDoc(doc(db, 'playersMoves', combinedId));
      if (movesDocu.exists()) {
        const movesData = movesDocu.data();
        // console.log(movesData, 'movesData');
      } else {
        const moveObject = {
          moves: [],
        };
        await setDoc(doc(db, 'playersMoves', combinedId), moveObject);
      }

      if (gameDoc.exists()) {
        if (!gameData?.endOfRound) {
          const getGameData = gameDoc.data();
          const currentTurn = getGameData.currentTurn;
          const movesDoc = await getDoc(doc(db, 'playersMoves', combinedId));

          // console.log(movesDoc.data(), 'movesDoc');

          const moves = movesDoc.data()?.moves || [];

          // Check if it's the player's turn
          if (currentTurn !== playersObject?.playerOne?.id) {
            toast.error('It is not your turn!', {
              style: {
                background: '#333',
                color: '#fff',
              },
              position: 'top-right',
            });
            return;
          }

          // console.log(moves, 'moves');

          // Check if the choice field in the moves array matches the selected choice
          const isChoiceTaken = moves.some((move: any) => move.choice === selected);

          if (isChoiceTaken) {
            toast.error('This move has already been played!', {
              style: {
                background: '#333',
                color: '#fff',
              },
              position: 'top-right',
            });
            return;
          }

          // Make the move an object
          const move = {
            choice: selected,
            playerId: playersObject?.playerOne?.id,
            timeStamp: new Date().toISOString(),
          };

          // Determine the next turn using the players id
          const nextTurn =
            currentTurn === playersObject?.playerOne?.id
              ? playersObject?.playerTwo?.id
              : playersObject?.playerOne?.id;

          // Check if the playersMoves document exists before updating
          if (movesDoc.exists()) {
            // Update the playersMoves document with the new moves
            const updatedMoves = [...moves, move];

            //Check if the current player has won based on what was just played
            const winning = checkForWinningCombination(currentTurn, updatedMoves);
            const draw = checkForDraw(updatedMoves); //Check if the game is a draw

            if (winning) {
              await updateDoc(doc(db, 'playersMoves', combinedId), {
                moves: updatedMoves,
              });
              const determineWinnerName =
                gameData?.currentTurn === playersObject?.playerOne?.id
                  ? playersObject?.playerOne?.name
                  : playersObject?.playerTwo?.name;

              //Get me the Id of the player in respect to them being the winner
              const getWinnersId =
                determineWinnerName === gameData?.players?.playerOne?.name
                  ? gameData?.players?.playerOne?.id
                  : gameData?.players?.playerTwo?.id;

              const determineNextPlayer =
                gameData?.firstPlayer === gameData?.players?.playerOne?.id
                  ? gameData?.players?.playerTwo?.id
                  : gameData?.players?.playerOne?.id;

              // const playerTwoScore =
              //   determineWinnerName === playersObject?.playerTwo?.name
              //     ? gameData?.scores?.playerTwo! + 1
              //     : gameData?.scores?.playerTwo!;

              await updateDoc(doc(db, 'gameSessions', combinedId), {
                scores: {
                  playerOne:
                    getWinnersId === gameData?.players?.playerOne?.id
                      ? gameData?.scores?.playerOne! + 1
                      : gameData?.scores?.playerOne!,
                  playerTwo:
                    getWinnersId === gameData?.players?.playerTwo?.id
                      ? gameData?.scores?.playerTwo! + 1
                      : gameData?.scores?.playerTwo!,
                },
                // firstPlayer: determineNextPlayer,
                roundWinner: determineWinnerName,
                goToNextRound: false, //For the round button
                endOfRound: true,
              });

              if (gameData?.rounds! === 5) {
                const determineFinalWinner =
                  getGameData?.scores?.playerOne > getGameData?.scores?.playerTwo;
                await updateDoc(doc(db, 'gameSessions', combinedId), {
                  roundWinner: determineWinnerName,
                  endOfRound: true,
                });
                toast.success(`Player ${determineWinnerName} is the ultimate winner!`, {
                  position: 'top-center',
                  style: {
                    background: '#333', // Dark background
                    color: '#fff', // White text
                    width: '250px',
                  },
                });
                setTimeout(async () => {
                  await updateDoc(doc(db, 'gameSessions', combinedId), {
                    ultimateWinner: determineWinnerName,
                  });
                  toast.success(
                    `Player ${determineFinalWinner} is the ultimate winner!`,
                    {
                      style: {
                        background: '#333', // Dark background
                        color: '#fff', // White text
                        width: '250px',
                      },
                      position: 'top-right',
                    }
                  );
                }, 5000);
                return;
              }
              dispatch(setTrackWinner(determineWinnerName));
              dispatch(setTrackDisableRound(false));
            } else if (draw) {
              await updateDoc(doc(db, 'playersMoves', combinedId), {
                moves: updatedMoves,
              });

              toast.success('Game is a draw!', {
                position: 'top-right',
                style: {
                  background: '#333',
                  color: '#fff',
                },
              });

              await updateDoc(doc(db, 'gameSessions', combinedId), {
                goToNextRound: false,
                endOfRound: true,
              });
              dispatch(setTrackDisableRound(false));

              if (gameData?.rounds! === 5) {
                const checkForDrawInGame =
                  getGameData?.scores?.playerOne === getGameData?.scores?.playerTwo;

                setTimeout(async () => {
                  toast.success(`${checkForDrawInGame && 'Game has ended in a draw!'}`, {
                    style: {
                      background: '#333', // Dark background
                      color: '#fff', // White text
                      width: '250px',
                    },
                    position: 'top-right',
                  });
                }, 5000);
                dispatch(setTrackDisableRound(false));
              }
            } else {
              // console.log('something must have gone terribly wrong');

              await updateDoc(doc(db, 'playersMoves', combinedId), {
                moves: updatedMoves, // Now we can safely use the updated array
              });
              await updateDoc(doc(db, 'gameSessions', combinedId), {
                currentTurn: nextTurn,
              });

              // await updateDoc(doc(db, 'playersMoves', combinedId), {
              //   moves: updatedMoves, // Now we can safely use the updated array
              // });
            }
            //Then Update the currentTurn field in the gameSession document
          }
        } else {
          toast.success('This round has ended!', {
            position: 'top-right',
            style: {
              background: '#333', // Dark background
              color: '#fff', // White text
            },
          });
        }
      } else {
        console.log('Game document does not exist.');
      }
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };
  // console.log(storedCurrentPlayerChoices, 'stored win');

  //Function to check if the player that just played got the correct combination
  const checkForWinningCombination = (currentTurn: string, moves: MovesObject[]) => {
    //First using the currentTurn, I get the playerId of the player that just played
    //Then I retrieve the moves of the player that just played from the moves array
    //Then I check if the moves of the player that just played matches any of the combinations in the possibility array
    //If it does, then I update the gameState to reflect the win
    //If it doesn't, then I check if the moves of the other player matches any of the combinations in the possibility array
    //If it does, then I update the gameState to reflect the win
    //If no one has won, then I check if the game is a draw by checking if the moves array length is 9
    //If it is a draw, then I update the gameState to reflect a draw

    //Get the currentTurn ID
    const currentPlayerId = currentTurn;
    //Filter through the moves for moves having an id similar to the currentTurn, this returns an array of object of moves data
    const currentPlayerMoves = moves.filter(
      (move: MovesObject) => move.playerId === currentPlayerId
    );

    //Now I check if the filtered currentPlayerMoves matches any of the combinations in the possibility array
    const isWinningCombination = possibility.some((combination) =>
      combination.every((choice) =>
        currentPlayerMoves.some((move) => move.choice === choice)
      )
    );
    return isWinningCombination;
  };

  const checkForDraw = (moves: MovesObject[]) => {
    if (moves.length === 9) {
      return true;
    }
  };

  useEffect(() => {
    if (checkForWinningCombination(gameData?.currentTurn!, movesData)) {
      filterMovesData(movesData);
    }
  }, [movesData]);

  //!Function to get the opponents data using their playerId
  const getOpponentSessionId = async (playerId: string) => {
    const playersRef = ref(database, 'activePlayers');

    const snapshot = await get(playersRef);
    const players = snapshot.val();

    const opponentId = Object.keys(players).find(
      (id) => id !== playerId && players[id].status === 'inGame'
    );

    if (opponentId) {
      const opponentData = players[opponentId];
      // console.log(opponentData, 'opponentDATA'); //current user Object containing my opponent data like their id, sessionId, currentlyPlaying, status

      dispatch(
        setPlayersSessionId({
          playerTwoSessionId: opponentData.sessionId, //Gives me the opponents sessionId
        })
      );
      return opponentData.sessionId; // Return the opponent's session ID
    }

    return null; // Return null if no opponent found
  };

  //Filter through the movesData by their id and get the corresponding choices of each players and push it to an array
  //Once the array is created, I check if it matches any of the combinations in the possibility array
  const filterMovesData = async (movesData: MovesObject[]) => {
    //get the choices of the currentPlayer
    const currentPlayerChoices = movesData
      .filter((move) => move.playerId === gameData?.currentTurn)
      .map((res) => res.choice);
    // console.log(currentPlayerChoices, 'To get the exact winning combination');
    await updateDoc(doc(db, 'gameSessions', combinedId), {
      winningCombination: currentPlayerChoices,
    });
    setStoredCurrentPlayerChoices(currentPlayerChoices);

    // console.log(currentPlayerChoices, 'currentPlayerChoices');
  };

  const movesDataStringer = movesData.map((res) => res.choice);
  // console.log(storedCurrentPlayerChoices, 'CHOICES');

  // console.log(movesDataStringer.includes(possibility[5].join(',')), 'movesData string');
  // console.log([movesDataStringer].includes(possibility[4]), 'movesDatastringer');
  //Get the combination that matches the movesData
  // const matchingCombination = possibility.find(
  //   (combination) => combination.join(',') === movesData.toString()
  // );
  // console.log(
  //   possibility[2].every((res) => storedCurrentPlayerChoices.includes(res)),
  //   'matchingCombination'
  // );
  // console.log(possibility[2], '4th possibility');
  // console.log(gameData, 'val');
  // console.log(possibility[2], 'possibility 2');

  // console.log(
  //   possibility[7].every((res) => gameData?.winningCombination!.includes(res)),
  //   'winner combo'
  // );

  return (
    <div>
      <div
        onClick={() => updateGameState(index)}
        className={`relative w-[95%] h-full min-h-[90px] m-auto bg-red cursor-pointer `}
        style={{
          mixBlendMode: 'hard-light',
        }}
      >
        {movesData?.some(
          (res: MovesObject) => res.playerId === firstPlayer && res.choice === index
        ) ? (
          <Image
            src="/SelectX.png"
            className="flex justify-center w-[70px] max-[500px]:!w-[50px] h-[70px] max-[500px]:h-[50px] items-center mt-3 mx-auto"
            width={50}
            height={50}
            alt="img"
          />
        ) : (
          ''
        )}
        {movesData.some(
          (res: MovesObject) => res.playerId !== firstPlayer && res.choice === index
        ) ? (
          <Image
            src="/SelectO.png"
            className="flex justify-center w-[70px] max-[500px]:!w-[50px] h-[70px] max-[500px]:h-[50px] items-center mt-3 mx-auto"
            width={50}
            height={50}
            alt="img"
          />
        ) : (
          ''
        )}
      </div>
      <div className="w-full h-full">
        <AnimatePresence>
          {possibility[0].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine width="90%" height="5px" top="60px" left="20px" rotate="0" />
          )}
          {possibility[1].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top="20px"
              left="60px"
              style="bg-blue-500"
              rotate={90}
            />
          )}
          {possibility[2].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="110%"
              height="5px"
              top="45px"
              left="53px"
              rotate="45"
              transformOrigin="top left"
            />
          )}
          {possibility[3].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine width="90%" height="5px" top="20px" left="50%" rotate={90} />
          )}
          {possibility[4].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="110%"
              height="5px"
              top="40px"
              left="340px"
              rotate="-224"
              transformOrigin="bottom left"
            />
          )}
          {possibility[5].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine width="90%" height="5px" top="20px" left="330px" rotate="90" />
          )}
          {possibility[6].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine width="90%" height="5px" top="190px" left="20px" rotate="0" />
          )}
          {possibility[7].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine width="90%" height="5px" bottom="60px" left="20px" rotate="0" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Possible;

//! Since i'm adding Firebase firestore to the flow, The flow would change a bit.
//? I'd need to create a function that would create a game session for both players and return the sessionId
//* Then I'd need to use that sessionId to create a document that would hold the moves of both players.
//# Now when the game loads after  signup, I need to use the sessionId to get the details of the players especially who plays first from the sessionId.
//*Note Then once a player selects a box, I'd need to update the moves document with the move of the players and the playerId.
//! I first need to check if the move has been played by both players.
//? Then I'd need to check if the current player has won by comparing the moves to the possibility array.
