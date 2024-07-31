import { MappedOver, Selected } from "@/app/types/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const Possible: React.FC<MappedOver> = ({
  val,
  index,
  playerOnesChoice,
  setPlayerOnesChoice,
  playerTwosChoice,
  setPlayerTwosChoice,
  currentPlayerControl,
  setCurrentPlayerControl,
  getIndexSelected,
  setGetIndexSelected,
  possibilty,
  trackTheWinner,
  setTrackTheWinner,
}) => {
  const [getSelected, setGetSelected] = useState<number[]>([]);
  const [disableDoubleClick, setDisableDoubleClick] = useState(false);

  // N:B: If you ever face an issue where whatever you push in an array that you need to track and you can't find it updating on time, you need to place it in a useEffect to properly track it if there's any change to it's value
  useEffect(() => {
    if (playerOnesChoice && playerOnesChoice?.length > 0) {
      if (currentPlayerControl) {
        // First i get all the choice player one has selected in an array
        const playerOneSelectedArray = playerOnesChoice
          ? playerOnesChoice?.map((prev) => prev.choice)
          : [];

        // Next I need a way to compare the selected values and the possibleCombinations
        if (playerOnesChoice && playerOnesChoice?.length > 2) {
          //*since the combinations can be in any format right? I need a way to check if the values in the combinations are in the playOneSelectedArray

          const storedAnswer = val.filter((resVal) =>
            playerOneSelectedArray.includes(resVal)
          );

          if (storedAnswer && storedAnswer.length > 2) {
            setGetSelected(storedAnswer);
            setTrackTheWinner("PLAYER 1 WINS");
          }
        }
      }
    }
  }, [playerOnesChoice, currentPlayerControl]);

  useEffect(() => {
    if (playerTwosChoice && playerTwosChoice?.length > 0) {
      console.log("I answer");

      if (currentPlayerControl == false) {
        console.log("I HAVE DEF ANSWERED");

        const playerTwoSelectedArray = playerTwosChoice?.map(
          (prev) => prev.choice
        );

        console.log(playerTwoSelectedArray, "playetr2SelectedARR");

        // Next I need a way to compare the selected values and the possibleCombinations
        if (playerTwosChoice && playerTwosChoice?.length > 2) {
          //*since the combinations can be in any format right? I need a way to check if the values in the combinations are in the playOneSelectedArray

          const storedAnswer = val.filter(
            (resVal) =>
              playerTwoSelectedArray && playerTwoSelectedArray.includes(resVal)
          );
          console.log(storedAnswer, "playerTwo StoredAns");

          if (storedAnswer && storedAnswer.length > 2) {
            console.log(storedAnswer, "player2Ans is the combo!!");
            setGetSelected(storedAnswer);
            setTrackTheWinner("PLAYER 2 WINS");
          }
        }
      }
    }
  }, [currentPlayerControl, playerTwosChoice]);

  console.log(getSelected, "gotten");

  useEffect(() => {
    if (trackTheWinner.length > 2) {
      setDisableDoubleClick(true);
    }
  }, [playerOnesChoice, playerTwosChoice, getSelected, trackTheWinner]);

  useEffect(() => {
    if (
      playerOnesChoice?.length == 5 &&
      playerTwosChoice?.length == 4 &&
      getSelected.length < 1
    ) {
      console.log(getSelected, "getSelected length");

      setTrackTheWinner("IT IS A TIE");
    }
  }, [getSelected]);
  const handleSelections = async (
    selected: number,
    currPlayerControl: boolean
  ) => {
    if (disableDoubleClick) return; // Prevent further clicks if loading

    setDisableDoubleClick(true); // Set loading state to true

    if (!currPlayerControl) {
      //   console.log("playerOne played");

      const playerObj: Selected = {
        player: "PlayerOne",
        choice: selected,
      };

      setPlayerOnesChoice((prev) => {
        return [...prev, playerObj];
      });
      setCurrentPlayerControl((prev) => !prev);

      // setCurrentPlayerControl((prev) => !prev);
    } else if (
      currPlayerControl &&
      playerOnesChoice &&
      playerOnesChoice.length > 0
    ) {
      const playerObj: Selected = {
        player: "PlayerTwo",
        choice: selected,
      };
      setPlayerTwosChoice((prev) => {
        return [...prev, playerObj];
      });

      setCurrentPlayerControl((prev) => !prev);
      // Simulate some delay for processing (optional)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust time as needed
      setDisableDoubleClick(false); // Reset loading state
    }
  };

  console.log(currentPlayerControl, "currentPlayer");

  return (
    <div>
      <div
        onClick={() =>
          !disableDoubleClick && handleSelections(index, currentPlayerControl)
        }
        className={`relative w-[70px] h-[70px] m-auto bg-red cursor-pointer ${
          disableDoubleClick ? "cursor-not-allowed" : ""
        }`}
        style={{
          mixBlendMode: "hard-light",
          border: "5.41667px solid #00A8A8",
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
        <span className="absolute left-[-140px] top-[200px] rotate-90 z-[99] w-[90%] h-[5px] bg-white ">
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
        <span className="absolute left-[25px] top-[40%]  z-[99] w-[90%] h-[5px] bg-white ">
          {" "}
        </span>
      ) : (
        ""
      )}

      {getSelected.length > 1 &&
      getSelected.toString() == possibilty[7].join(",") ? (
        <span className="absolute left-[25px] bottom-[75px]  z-[99] w-[90%] h-[5px] bg-white ">
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
