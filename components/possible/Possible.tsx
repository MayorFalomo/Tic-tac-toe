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
  setTrackWinner,
} from "@/lib/features/TrackerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const Possible: React.FC<MappedOver> = ({ val, index }) => {
  // const [getSelected, setGetSelected] = useState<number[]>([]);

  // const [disableDoubleClick, setDisableDoubleClick] = useState(false);

  const possibilty = useAppSelector((state) => state.possible.possibility);

  const playerOnesChoice = useAppSelector(
    (state: RootState) => state.players.playerOne
  );
  const playerTwosChoice = useAppSelector(
    (state: RootState) => state.players.playerTwo
  );
  const currentPlayerControl = useAppSelector(
    (state) => state.players.currentplayerControl
  );
  const getSelected = useAppSelector(
    (state: RootState) => state.players.getSelected
  );

  const trackRounds = useAppSelector(
    (state: RootState) => state.track.trackRounds
  );
  const disableDoubleClick = useAppSelector(
    (state: RootState) => state.track.disabledClick
  );

  const trackTheWinner = useAppSelector((state) => state.track.trackTheWinnner);

  const playerOneScore = useAppSelector(
    (state: RootState) => state.track.playerOneScore
  );
  const playerTwoScore = useAppSelector(
    (state: RootState) => state.track.playerTwoScore
  );

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

          const storedAnswer = val.filter((resVal) => {
            const check = playerOneSelectedArray.some((e) => e === resVal);
            return check;
          });

          console.log(storedAnswer, "playerOnEsTOREDAns");

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
  }, [
    currentPlayerControl,
    playerOnesChoice,
    val,
    dispatch,
    // disableDoubleClick,
    // playerOneScore,
  ]);

  useEffect(() => {
    if (playerTwosChoice && playerTwosChoice?.length > 0) {
      if (!currentPlayerControl) {
        const playerTwoSelectedArray = playerTwosChoice?.map(
          (prev) => prev.choice
        );
        // console.log(playerTwoSelectedArray, "inside useEffect playerTwo");

        // Next I need a way to compare the selected values and the possibleCombinations
        if (playerTwosChoice && playerTwosChoice?.length > 2) {
          //*since the combinations can be in any format right? I need a way to check if the values in the combinations are in the playOneSelectedArray

          const storedAnswer = val.filter(
            (resVal) =>
              playerTwoSelectedArray && playerTwoSelectedArray.includes(resVal)
          );

          console.log(storedAnswer, "playerTwosTOREDAns");

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

  console.log(getSelected, "GETSELLECT");

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
      console.log(trackRounds, "i ran");

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
  const handleSelections = async (
    selected: number,
    currPlayerControl: boolean
  ) => {
    // console.log(currPlayerControl, "curr");

    if (disableDoubleClick) return; // Prevent further clicks if loading

    dispatch(setDisabledClick(true)); // Set loading state to true

    // console.log(disableDoubleClick, "disabled");
    // console.log(currentPlayerControl, "currentPlayer");

    // If currPlayerControl is false then playerOne is the one playing
    if (!currPlayerControl) {
      const playerObj: Selected = {
        player: "PlayerOne",
        choice: selected,
      };

      dispatch(addPlayerOne(playerObj));

      dispatch(changeCurrentPlayerControl(true));

      // console.log(currPlayerControl, "currPlayerControl");

      // setPlayerOnesChoice((prev) => {
      //   return [...prev, playerObj];
      // });
      // setCurrentPlayerControl((prev) => !prev);
      // console.log(playerOnesChoice, "playeONErOBJ");
    } else if (
      currPlayerControl
      // &&
      // playerOnesChoice &&
      // playerOnesChoice.length > 0
    ) {
      // console.log("hello");

      const playerObj: Selected = {
        player: "PlayerTwo",
        choice: selected,
      };
      // console.log(currPlayerControl, "inside else if");

      dispatch(addPlayerTwo(playerObj));
      dispatch(changeCurrentPlayerControl(false));
      // console.log(playerTwosChoice, "playertwoChoice");

      // setPlayerTwosChoice((prev) => {
      //   return [...prev, playerObj];
      // });

      // setCurrentPlayerControl((prev) => !prev);
      // Simulate some delay for processing (optional)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust time as needed
    }
    dispatch(setDisabledClick(false)); // Reset loading state
  };

  // console.log(getSelected.length, "getSelected length");
  // console.log(getSelected, "getSelected state");
  // console.log(disableDoubleClick, "click");
  // console.log(currentPlayerControl, "change");

  // 11235813;
  // 09039060588

  return (
    <div>
      <div
        onClick={() => {
          if (!disableDoubleClick) {
            // Only call handleSelections if not disabled
            handleSelections(index, currentPlayerControl);
          }
        }}
        // onClick={() =>
        //   dispatch(setDisabledClick(!disableDoubleClick)) &&
        //   handleSelections(index, currentPlayerControl)
        // }
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

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[0].join(",") ? (
        <span className="absolute left-[0] right-[0] top-[80px] m-auto z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[1].join(",") ? (
        <span className="absolute left-[-140px] top-[230px] rotate-90 z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[2].join(",") ? (
        <span className="absolute left-[-15px] top-[220px] rotate-[45deg] z-[99] w-[100%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[3].join(",") ? (
        <span className="absolute left-[25px] right-[35px] top-[230px] rotate-[90deg] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[4].join(",") ? (
        <span className="absolute right-[0px] top-[240px] rotate-[-45deg] z-[99] w-[100%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[5].join(",") ? (
        <span className="absolute right-[-145px] top-[230px] rotate-[90deg] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[6].join(",") ? (
        <span className="absolute left-[25px] top-[240px]  z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[7].join(",") ? (
        <span className="absolute left-[25px] bottom-[75px] z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}
    </div>
  );
};

export default Possible;

// mix-blend-mode: hard-light;
// border: 5.41667px solid rgba(51, 233, 198, 0.2);
// box-shadow: inset -0.541667px 1.08333px 0.541667px rgba(255, 255, 255, 0.5);
// filter: drop-shadow(0px 8.33333px 10.8333px #009999) drop-shadow(0px 5.41667px 4.16667px rgba(0, 77, 70, 0.7));
// border-radius: 26.3891px;

// /* Rectangle 14 */

// box-sizing: border-box;

// position: absolute;
// left: 0%;
// right: 0%;
// top: 0%;
// bottom: 0%;

// border: 3.33333px solid #33E9E9;
// filter: blur(0.416667px);
// border-radius: 26.3891px;
