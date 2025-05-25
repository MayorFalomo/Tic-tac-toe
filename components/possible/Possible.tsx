import { GameSession, MovesObject } from '@/app/types/types';
import { setTrackDisableRound, setTrackWinner } from '@/lib/features/TrackerSlice';
import { db } from '@/firebase-config/firebase';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DrawLine from '@/app/animation/DrawLine';
import { AnimatePresence, motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/screenSize';
import { scaleAndPopVariants } from '@/app/animation/constants';
import useIndexedDB from '@/hooks/useIndexDb';
import { playSound } from '@/app/utils/soundFunc';

type MappedOver = {
  val: any;
  index: number;
  firstPlayer: string;
  gameData: GameSession | null;
  movesData: MovesObject[];
  setMovesData: React.Dispatch<React.SetStateAction<MovesObject[]>>;
  setGameData: React.Dispatch<React.SetStateAction<GameSession | null>>;
  combinedId: string;
  setRoundWinner: React.Dispatch<React.SetStateAction<string | null>>;
  setUltimateWinner: React.Dispatch<React.SetStateAction<string | null>>;
  resetTimer: () => void;
  stopTimer: () => void;
};

const Possible: React.FC<MappedOver> = ({
  index,
  firstPlayer,
  gameData,
  movesData,
  combinedId,
  setUltimateWinner,
  resetTimer,
  stopTimer,
}) => {
  const isBiggerScreen = useScreenSize(500);

  const possibility = useAppSelector((state) => state.possible.possibility); //State to hold all the possible combinations

  const playersObject = useAppSelector((state: RootState) => state.players.players);

  const dispatch = useAppDispatch();
  const { updateData, getData } = useIndexedDB();
  const [toastStyle, setToastStyle] = useState({
    background: '#333',
    color: '#fff',
    width: 'auto',
    minWidth: '250px',
  });

  const updateGameState = async (selected: number) => {
    try {
      const gameDoc = await getDoc(doc(db, 'gameSessions', combinedId));
      const movesDocu = await getDoc(doc(db, 'playersMoves', combinedId));
      if (movesDocu.exists()) {
        const movesData = movesDocu.data();
        //Need to decide what to do here
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

          const moves = movesDoc.data()?.moves || [];

          // Check if it's the player's turn
          if (currentTurn !== playersObject?.playerOne?.id) {
            toast.error('It is not your turn!', {
              style: toastStyle,
              position: 'top-right',
            });
            return;
          }

          // Check if the choice field in the moves array matches the selected choice
          const isChoiceTaken = moves.some((move: any) => move.choice === selected);

          if (isChoiceTaken) {
            toast.error('This move has already been played!', {
              style: toastStyle,
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
                roundWinner: determineWinnerName,
                goToNextRound: false, //For the round button
                endOfRound: true,
              });
              //!Stop The Timer
              stopTimer();
              if (
                gameData?.rounds === 5 &&
                gameData?.scores?.playerOne !== gameData?.scores?.playerTwo
              ) {
                console.log('I RAN');
                ultimateWinnerSequence(gameData, determineWinnerName);
              }
              if (
                gameData?.rounds === 5 &&
                gameData?.scores?.playerOne === gameData?.scores?.playerTwo
              ) {
                await updateDoc(doc(db, 'gameSessions', combinedId), {
                  draw: true,
                  goToNextRound: false,
                  endOfRound: true,
                });
                //# ResetTimer
                resetTimer();
                dispatch(setTrackDisableRound(false));
                //So it reflects offline after since most players go off here
                await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
                  status: 'offline',
                });
              } else if (gameData?.rounds === 5 && !draw) {
                ultimateWinnerSequence(gameData, determineWinnerName);
              }
              dispatch(setTrackWinner(determineWinnerName));
              dispatch(setTrackDisableRound(false));
            } else if (draw) {
              //Update the move on firebase
              await updateDoc(doc(db, 'playersMoves', combinedId), {
                moves: updatedMoves,
              });

              await updateDoc(doc(db, 'gameSessions', combinedId), {
                draw: true,
                goToNextRound: false,
                endOfRound: true,
              });
              //? Stop The Timer
              stopTimer();
              dispatch(setTrackDisableRound(false));

              if (gameData?.rounds === 5) {
                //Check for ultimate Winner if that round ended in a draw but the scores are different
                if (gameData?.scores?.playerOne !== gameData?.scores?.playerTwo) {
                  const determineFinalWinner =
                    gameData?.scores?.playerOne > gameData?.scores?.playerTwo;

                  const getFinalWinnerName = determineFinalWinner
                    ? gameData?.players?.playerOne?.name
                    : gameData?.players?.playerTwo?.name;

                  await updateDoc(doc(db, 'gameSessions', combinedId), {
                    roundWinner: '',
                    ultimateWinner: getFinalWinnerName,
                    endOfRound: true,
                  });
                  toast.success(`Player ${getFinalWinnerName} is the ultimate winner!`, {
                    style: toastStyle,
                    position: 'top-right',
                  });

                  //!Stop the Timer
                  stopTimer();
                  setUltimateWinner(getFinalWinnerName);
                  await countAndUpdateTotalPlayerWins(getFinalWinnerName);
                  //update to offline after since most players go off here
                  await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
                    status: 'offline',
                  });
                  dispatch(setTrackDisableRound(false));
                }
                dispatch(setTrackDisableRound(false));
              }
            } else {
              await updateDoc(doc(db, 'playersMoves', combinedId), {
                moves: updatedMoves, // Now we can safely use the updated array
              });
              await updateDoc(doc(db, 'gameSessions', combinedId), {
                currentTurn: nextTurn,
              });
              playSound('/tape-measure.wav');
              resetTimer();
            }
            //Then Update the currentTurn field in the gameSession document
          }
        } else {
          toast.success('This round has ended!', {
            position: 'top-right',
            style: toastStyle,
          });
        }
      } else {
        console.log('Game document does not exist.');
      }
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  const ultimateWinnerSequence = async (
    gameData: GameSession,
    determineWinnerName: string
  ) => {
    const determineFinalWinner =
      gameData?.scores?.playerOne > gameData?.scores?.playerTwo;
    const getPlayerWinnerName = determineFinalWinner
      ? gameData?.players?.playerOne?.name
      : gameData?.players?.playerTwo?.name;

    await updateDoc(doc(db, 'gameSessions', combinedId), {
      roundWinner: determineWinnerName,
      endOfRound: true,
    });

    toast.success(`Player ${determineWinnerName} wins this round!`, {
      position: 'top-center',
      style: toastStyle,
    });

    setTimeout(async () => {
      await updateDoc(doc(db, 'gameSessions', combinedId), {
        roundWinner: '',
        ultimateWinner: getPlayerWinnerName,
      });
      toast.success(`Player ${getPlayerWinnerName} is the ultimate winner!`, {
        style: toastStyle,
        position: 'top-right',
      });
      stopTimer();
      setUltimateWinner(getPlayerWinnerName);
      await countAndUpdateTotalPlayerWins(getPlayerWinnerName);
    }, 4000);

    //So it reflects offline after since most players go off here
    await updateDoc(doc(db, 'players', playersObject?.playerOne?.id), {
      status: 'offline',
    });
    return;
  };

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

  //Function to Check for a draw
  const checkForDraw = (moves: MovesObject[]) => {
    const result =
      moves.length === 9 &&
      !checkForWinningCombination(gameData?.currentTurn!, movesData);
    if (result) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (checkForWinningCombination(gameData?.currentTurn!, movesData)) {
      filterMovesData(movesData);
    }
  }, [movesData]);

  //Filter through the movesData by their id and get the corresponding choices of each players and push it to an array
  //Once the array is created, I check if it matches any of the combinations in the possibility array
  const filterMovesData = async (movesData: MovesObject[]) => {
    //get the choices of the currentPlayer
    const currentPlayerChoices = movesData
      .filter((move) => move.playerId === gameData?.currentTurn)
      .map((res) => res.choice);
    await updateDoc(doc(db, 'gameSessions', combinedId), {
      winningCombination: currentPlayerChoices,
    });
  };

  const countAndUpdateTotalPlayerWins = async (getPlayerWinnerName: string) => {
    const res = await getData();
    const checkForFinalWinnerId =
      getPlayerWinnerName !== playersObject?.playerOne?.name
        ? playersObject?.playerTwo?.id
        : playersObject?.playerOne?.id;
    //For Updating Wins
    if (res?.wins && checkForFinalWinnerId) {
      await updateDoc(doc(db, 'players', checkForFinalWinnerId), {
        wins: Number(res?.wins) + 1,
      });
      if (checkForFinalWinnerId === playersObject?.playerOne?.id) {
        await updateData({
          wins: Number(res?.wins) + 1,
        });
      }
    }

    //For getting Loss Id
    const checkForLosserId =
      getPlayerWinnerName !== playersObject?.playerOne?.name
        ? playersObject?.playerTwo?.id
        : playersObject?.playerOne?.id;

    if (res?.loss && checkForLosserId) {
      await updateDoc(doc(db, 'players', checkForLosserId), {
        loss: Number(res?.loss) + 1,
      });
      if (checkForFinalWinnerId === playersObject?.playerOne?.id) {
        await updateData({
          loss: Number(res?.loss) + 1,
        });
      }
    }
  };

  return (
    <div>
      <div
        onClick={() => updateGameState(index)}
        className={`relative w-[95%] h-full min-h-[90px] m-auto bg-red cursor-pointer `}
        style={{
          mixBlendMode: 'hard-light',
        }}
      >
        <AnimatePresence mode="wait">
          {movesData?.some(
            (res: MovesObject) => res.playerId === firstPlayer && res.choice === index
          ) ? (
            <motion.img
              src="/SelectX.png"
              className="flex justify-center w-[70px] max-[500px]:!w-[50px] h-[70px] max-[500px]:h-[50px] items-center mt-3 mx-auto"
              width={50}
              height={50}
              alt="X"
              initial="hidden"
              animate="visible"
              variants={scaleAndPopVariants}
            />
          ) : (
            ''
          )}
          {movesData.some(
            (res: MovesObject) => res.playerId !== firstPlayer && res.choice === index
          ) ? (
            <motion.img
              src="/SelectO.png"
              className="flex justify-center w-[70px] max-[500px]:!w-[50px] h-[70px] max-[500px]:h-[50px] items-center mt-3 mx-auto"
              width={50}
              height={50}
              alt="O"
              initial="hidden"
              animate="visible"
              variants={scaleAndPopVariants}
            />
          ) : (
            ''
          )}
        </AnimatePresence>
      </div>
      <div className="w-full h-full">
        <AnimatePresence>
          {possibility[0].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top={isBiggerScreen ? '60px' : '45px'}
              left="20px"
              rotate="0"
            />
          )}
          {possibility[1].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top="20px"
              left={isBiggerScreen ? '65px' : '55px'}
              style="bg-blue-500"
              rotate={90}
            />
          )}
          {possibility[2].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="110%"
              height="5px"
              top={isBiggerScreen ? '45px' : '40px'}
              left="53px"
              rotate={isBiggerScreen ? '45' : '48'}
              transformOrigin="top left"
            />
          )}
          {possibility[3].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top="20px"
              left={isBiggerScreen ? '50%' : '51%'}
              rotate={90}
            />
          )}
          {possibility[4].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="110%"
              height="5px"
              top="40px"
              left={isBiggerScreen ? '340px' : '270px'}
              rotate="-226"
              transformOrigin="bottom left"
            />
          )}
          {possibility[5].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top="20px"
              left={isBiggerScreen ? '340px' : '270px'}
              rotate="90"
            />
          )}
          {possibility[6].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              top={isBiggerScreen ? '190px' : '160px'}
              left="20px"
              rotate="0"
            />
          )}
          {possibility[7].every((res) => gameData?.winningCombination!.includes(res)) && (
            <DrawLine
              width="90%"
              height="5px"
              bottom={isBiggerScreen ? '60px' : '65px'}
              left="20px"
              rotate="0"
            />
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
