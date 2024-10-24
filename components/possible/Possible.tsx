import { MappedOver, Selected } from "@/app/types/types";
import {
  addPlayerOne,
  addPlayerTwo,
  changeCurrentPlayerControl,
  changeIndexSelected,
  emptyPlayer,
  setGetSelected,
} from "@/lib/features/PlayerSlice";
import {
  emptyScore,
  setDisabledClick,
  setTrackPlayerOneScore,
  setTrackPlayerTwoScore,
  setTrackRounds,
  setTrackWhoPlays,
  setTrackWinner,
} from "@/lib/features/TrackerSlice";
import { database } from "@/firebase-config/firebase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { get, onValue, ref, update } from "@firebase/database";

const Possible: React.FC<MappedOver> = ({ val, index }) => {
  const possibilty = useAppSelector((state) => state.possible.possibility); //State to hold all the possible combinations

  const playerOnesChoice = useAppSelector(
    (state: RootState) => state.players.playerOne
  ); //All the index chosen are pushed inside the playerOneChoice Array

  const playerTwosChoice = useAppSelector(
    (state: RootState) => state.players.playerTwo
  ); //All the index chosen are pushed inside the playerTwoChoice Array

  const currentPlayerControl = useAppSelector(
    (state) => state.players.currentplayerControl
  ); //State to control the current player to either playerOne or playerTwo depending on what boolean it currently is

  const getSelected = useAppSelector(
    (state: RootState) => state.players.getSelected
  ); //Array to store the values filtered from possibility and what the player picked

  const trackRounds = useAppSelector(
    (state: RootState) => state.track.trackRounds
  ); //State to track rounds

  const disableDoubleClick = useAppSelector(
    (state: RootState) => state.track.disabledClick
  ); // State to try and control double clicking

  const trackTheWinner = useAppSelector((state) => state.track.trackTheWinnner); //State that collects a string

  const playerOneScore = useAppSelector(
    (state: RootState) => state.track.playerOneScore
  ); //PlayerOneScore state is a state for keeping track of playerOneScore if it has beeen added

  const playerTwoScore = useAppSelector(
    (state: RootState) => state.track.playerTwoScore
  ); // PlayerTwoScore is a state to keep track of playerTwosScore

  const gameSessionId = useAppSelector(
    (state: RootState) => state.track.gameSessionId
  );

  const gameSessionValue = useAppSelector(
    (state: RootState) => state.players.gameSession
  );
  const trackCurrentPlayer = useAppSelector((state: RootState) => state.track.trackWhoPlays);
  const playersObject = useAppSelector((state: RootState) => state.players.players)
  // const gameId = useAppSelector((state: RootState) => state.user.gameId);

  const dispatch = useAppDispatch();

  // N:B: If you ever face an issue where whatever you push in an array that you need to track and you can't find it updating on time, you need to place it in a useEffect to properly track it if there's any change to it's value
  useEffect(() => {
    if (playerOnesChoice && playerOnesChoice?.length > 0) {
      if (currentPlayerControl) {
        // console.log(playerOnesChoice, "i am true");

        // First i get all the choice player one has selected in an array
        const playerOneSelectedArray = playerOnesChoice
          ? playerOnesChoice?.map((prev) => prev.choice)
          : [];

        // Next I need a way to compare the selected values and the possibleCombinations
        if (playerOnesChoice && playerOnesChoice?.length > 2) {
          //*since the combinations can be in any format right? I need a way to check if the values in the combinations are in the playOneSelectedArray

          //This function runs a check using a filter method, for if playerOne's selectedChoices are included in the mapped over possibility array the the filtered result is then compared with the selectedAray using the some method
          const storedAnswer = val.filter((resVal) => {
            const check = playerOneSelectedArray.some((e) => e === resVal);
            return check;
          });

          //Function checks if th storedAnswer is greater than 2 before it would run
          if (storedAnswer.length > 2) {
            dispatch(setGetSelected(storedAnswer));
            // dispatch(changeIndexSelected(storedAnswer));
            dispatch(setTrackWinner("PLAYER 1 WINS"));
            dispatch(setTrackPlayerOneScore(playerOneScore));
            dispatch(changeCurrentPlayerControl(true));
          }
        }
      }
    }
  }, [currentPlayerControl, playerOnesChoice, val, dispatch]);

  //useEffect to track playerTwosChoices and selectedAbswers and also to score playerTwo if their selected answers matches the possible val values
  useEffect(() => {
    if (playerTwosChoice && playerTwosChoice?.length > 0) {
      if (!currentPlayerControl) {
        const playerTwoSelectedArray = playerTwosChoice?.map(
          (prev) => prev.choice
        );

        // Next I need a way to compare the selected values and the possibleCombinations
        if (playerTwosChoice && playerTwosChoice?.length > 2) {
          //*since the combinations can be in any format right? I need a way to check if the values in the combinations are in the playOneSelectedArray

          //storedAnswer gets all the numbers In the selectedArray to that of the mapped over possibility array
          const storedAnswer = val.filter(
            (resVal) =>
              playerTwoSelectedArray && playerTwoSelectedArray.includes(resVal)
          );

          if (storedAnswer && storedAnswer.length > 2) {
            dispatch(setGetSelected(storedAnswer));
            // dispatch(changeIndexSelected(storedAnswer));
            dispatch(setTrackWinner("PLAYER 2 WINS"));
            dispatch(setTrackPlayerTwoScore(playerTwoScore));
            dispatch(changeCurrentPlayerControl(false));
          }
        }
      }
    }
  }, [
    currentPlayerControl,
    playerTwosChoice,
    dispatch,
    // val,
    // disableDoubleClick,
  ]);

  //Useeffect to reset the game for the next round
  useEffect(() => {
    if (trackTheWinner.length > 1) {
      if (trackTheWinner.length > 1 && !disableDoubleClick) {
        // dispatch(setDisabledClick(true));
        const timed = setTimeout(() => {
          // dispatch(setDisabledClick(false));

          dispatch(setTrackWinner(""));
          dispatch(emptyPlayer([]));

          dispatch(setGetSelected([]));

          // dispatch(changeCurrentPlayerControl(true));
          dispatch(changeIndexSelected(0));
          dispatch(setTrackRounds(trackRounds));
        }, 2000);

        return () => {
          clearTimeout(timed);
          // console.log(getSelected, "getSelected");
        };
      }
    }
  }, [
    trackTheWinner,
    playerOnesChoice,
    playerTwosChoice,
    disableDoubleClick,
    currentPlayerControl,
    getSelected,
    trackRounds,
    dispatch,
  ]);

  //useEffect to track if there is no winner and therefore ends in a Tie
  useEffect(() => {
    if (
      (playerOnesChoice?.length == 5 &&
        playerTwosChoice?.length == 4 &&
        getSelected.length < 1) ||
      (playerOnesChoice?.length == 4 &&
        playerTwosChoice?.length == 5 &&
        getSelected.length < 1)
    ) {
      dispatch(setTrackWinner("IT IS A TIE"));
    }
  }, [getSelected, playerOnesChoice, playerTwosChoice, dispatch]);

  //UseEffect to handle if the round is above 5
  useEffect(() => {
    if (trackRounds > 5) {
      if (playerOneScore > playerTwoScore) {
        dispatch(setTrackWinner("Player One has won"));
        setTimeout(() => {
          dispatch(changeCurrentPlayerControl(false));
          dispatch(emptyPlayer([]));
          dispatch(setTrackRounds(0));
          dispatch(setTrackWinner(""));
          dispatch(emptyScore(0));
          dispatch(changeIndexSelected(0));
        }, 3000);
      } else if (playerTwoScore > playerOneScore) {
        dispatch(setTrackWinner("Player Two has won"));
        setTimeout(() => {
          dispatch(changeCurrentPlayerControl(false));
          dispatch(emptyPlayer([]));
          dispatch(setTrackRounds(0));
          dispatch(setTrackWinner(""));
          dispatch(emptyScore(0));
          dispatch(changeIndexSelected(0));
        }, 3000);
      } else {
        dispatch(setTrackWinner("It is a Tie"));
        setTimeout(() => {
          dispatch(changeCurrentPlayerControl(false));
          dispatch(emptyPlayer([]));
          dispatch(setTrackRounds(0));
          dispatch(setTrackWinner(""));
          dispatch(emptyScore(0));
          dispatch(changeIndexSelected(0));
        }, 3000);
      }
    }
  }, [trackRounds, playerOneScore, playerTwoScore, dispatch]);

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

  //Function to handle what happens when a user clicks on a box
  const handleSelections = async (
    selected: number,
    // playerId: string,
    currPlayerControl: boolean,
    sessionId: string,
  ) => {
    const sessionRef = ref(database, `gameSessions/${sessionId}`);

    // If currPlayerControl is false then playerOne is the one playing
    const newMove = {
      playerId: currPlayerControl ? playersObject.playerTwo?.id : playersObject.playerOne?.id ,
      choice: selected,
      timeStamp: new Date().toISOString(),
    };

    const snapShot = await get(sessionRef);
    const currentMoves = snapShot.val().moves || [];

    if (!currPlayerControl) {
      await update(ref(database, `gameSessions/${gameSessionId}`), newMove);
      // dispatch(addPlayerOne(playerObj));
      dispatch(changeCurrentPlayerControl(true));
      dispatch(setTrackWhoPlays(!currPlayerControl))
    } else {
      // dispatch(addPlayerTwo(playerObj));
      dispatch(changeCurrentPlayerControl(false));
      await update(ref(database, `gameSessions/${gameSessionId}`), newMove);
      dispatch(setTrackWhoPlays(!currPlayerControl))
    }
    // Save the move to Firestore: pass the currentPlayer, the gameSession Id and what a player selected
    // await makeMove(playerObj.player, gameId, selected);
  };

  const [fetchPlayers, setFetchPlayers] = useState([]);

  const fetchGameSession = async (sessionId: string) => {
    const sessionRef = ref(database, `gameSessions/${sessionId}`);
    console.log(sessionRef, "sessionREF");

    //Listen for real-time updates
    const unsusbcribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data, "data");
    });
    return () => unsusbcribe();
  };

  useEffect(() => {
    fetchGameSession(gameSessionId);
    console.log(fetchGameSession(gameSessionId), "fetchGame");
  }, [gameSessionId]);

  // useEffect(() => {
  //   const sessionRef = ref(database, `gameSessions${gameSessionId}`);

  //   const snapshot = get(sessionRef);
  //   console.log(snapshot, "snapshot");
  //   snapshot.then((prev) => setFetchPlayers(prev.val().players));
  // }, [fetchPlayers]);

  // console.log(fetchPlayers, "fetchplayers");

  const makeMove = async () => {};
  //I'd need a function that would take in arguments like playerId, movePlayed and a boolean to control the turn
  return (
    <div>
      <div
        onClick={() => handleSelections(index,trackCurrentPlayer.playerOne, gameSessionId)}
        className={`relative w-[80px] h-[80px] m-auto bg-red cursor-pointer ${
          disableDoubleClick ? "cursor-not-allowed" : ""
        }`}
        style={{
          mixBlendMode: "hard-light",
          // border: "5.41667px solid #00A8A8",
          //   filter: "blur(0.5px)",
          borderRadius: "26.3891px",
        }}
      >
        {playerOnesChoice?.some((res) => res.choice == index) ? (
          <Image src="/SelectX.png" width={150} height={150} alt="img" />
        ) : (
          ""
        )}

        {playerTwosChoice?.some((res) => res.choice == index) ? (
          <Image src="/SelectO.png" width={150} height={150} alt="img" />
        ) : (
          ""
        )}
        {/* <span className="text-[24px]  flex justify-center items-center w-full h-full">
          {playerOnesChoice?.length}
        </span> */}
      </div>

      {/* {getSelected?.length > 1 &&
      getSelected.toString() == possibilty[0].join(",") ? (
        <span className="absolute left-[0] right-[0] top-[80px] m-auto z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected?.length > 1 &&
      getSelected.toString() == possibilty[1].join(",") ? (
        <span className="absolute left-[-140px] top-[230px] rotate-90 z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[2].join(",") ? (
        <span className="absolute left-[-15px] top-[220px] rotate-[45deg] z-[99] w-[100%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[3].join(",") ? (
        <span className="absolute left-[25px] right-[35px] top-[230px] rotate-[90deg] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[4].join(",") ? (
        <span className="absolute right-[0px] top-[240px] rotate-[-45deg] z-[99] w-[100%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[5].join(",") ? (
        <span className="absolute right-[-145px] top-[230px] rotate-[90deg] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[6].join(",") ? (
        <span className="absolute left-[25px] top-[240px]  z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}

      {/* {getSelected.length > 1 &&
      getSelected.toString() == possibilty[7].join(",") ? (
        <span className="absolute left-[25px] bottom-[75px] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )} */}
    </div>
  );
};

export default Possible;

//! For the paytton create component just in case navigate(
//   `/email-confirmation?search=${encodeURIComponent("create-account")}`,
//   {
//     state: { stage: "User" },
//   }
// );
