"use client";
import {
  Combinations,
  MappedOver,
  Selected,
  SelectedAnswer,
} from "@/app/types/types";
import Possible from "@/components/possible/Possible";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

type Props = {};

const Homepage = (props: Props) => {
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

  const trackTheWinner = useAppSelector((state) => state.track.trackTheWinnner);

  const trackPlayerOneScore = useAppSelector(
    (state) => state.track.playerOneScore
  );

  const trackPlayerTwoScore = useAppSelector(
    (state) => state.track.playerTwoScore
  );

  const trackRounds = useAppSelector((state) => state.track.trackRounds);

  return (
    <div className=" flex flex-col  gap-[10px]  items-center  w-full h-[100vh]">
      <div className=" flex justify-center items-center m-auto  w-full h-[85%]">
        <div className="flex flex-col w-full gap-[10px] items-center  justify-center">
          <div className="relative">
            <div className="flex items-center justify-between w-[100%] ">
              <div className="flex items-center w-full justify-center gap-[20px]  ">
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(3.6px)",
                    WebkitBackdropFilter: "filter(5px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  }}
                  className="flex flex-col gap-2 p-3"
                >
                  <h1 className="text-white text-[16px] ">Player One</h1>
                  <Image
                    src="/SelectX.png"
                    className="m-auto"
                    width={30}
                    height={30}
                    alt="img"
                  />
                </div>
                <h1 className="text-white text-[24px] ">
                  {trackPlayerOneScore}{" "}
                </h1>
              </div>
              <h1 className="text-white text-[24px] "> : </h1>
              <div className="flex items-center w-full justify-center   gap-[20px]">
                <h1 className="text-white text-[24px] ">
                  {trackPlayerTwoScore}{" "}
                </h1>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(3.6px)",
                    WebkitBackdropFilter: "filter(5px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  }}
                  className="flex flex-col gap-2 p-3"
                >
                  <h1 className="text-white text-[16px] ">Player Two</h1>
                  <Image
                    src="/SelectO.png"
                    className="m-auto"
                    width={30}
                    height={30}
                    alt="img"
                  />
                </div>
              </div>
              {trackTheWinner.length > 1 && (
                <AnimatePresence>
                  <motion.div
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(3.6px)",
                      WebkitBackdropFilter: "filter(5px",
                      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    }}
                    className="absolute z-20 left-0 right-0 top-[50%] w-full p-3"
                  >
                    {" "}
                    <h1
                      style={{
                        color: "transparent",
                        // color: "#ffffff",
                        textShadow:
                          "0 -1px 4px #fff, 0 -2px 10px #ff0, 0 -10px 20px #ff8000, 0 -18px 40px #f00",
                      }}
                      className="text-[24px] text-center m-auto "
                    >
                      {trackTheWinner}{" "}
                    </h1>
                  </motion.div>
                </AnimatePresence>
              )}
              {/* <button>Start Round 2 </button> */}
            </div>
            {/* <div className=" relative w-[500px] h-[500px] grid grid-cols-3 gap-2  m-auto border-2 border-blue-500 "> */}
            <div
              className="relative items-center justify-content w-[500px] h-[500px] grid grid-cols-3 gap-2 m-auto mt-[20px]"
              style={{
                mixBlendMode: "hard-light",
                border: "8.76786px solid #FFD56A",
                boxShadow:
                  "inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)",
                filter: "blur(0.970982px)",
                borderRadius: "32.1429px",
                // border: "12.6228px solid rgba(255, 201, 64, 0.2)",
                //   filter:
                //   "drop-shadow(0px 19.4196px 25.2455px #8F7000) drop-shadow(0px 12.6228px 9.70982px rgba(57, 38, 0, 0.7))",
              }}
            >
              <span
                className="absolute right-[-80px] top-[235px] h-[3px] w-[100%] rotate-[90deg]"
                style={{
                  mixBlendMode: "hard-light",
                  border: "5.76786px solid #FFD56A",
                  boxShadow:
                    "inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)",
                  filter: "blur(0.970982px)",
                  borderRadius: "   10.1429px",
                }}
              >
                {" "}
              </span>
              <span
                className="absolute left-[-80px] top-[235px] h-[3px] w-[100%] rotate-[90deg]"
                style={{
                  mixBlendMode: "hard-light",
                  border: "5.76786px solid #FFD56A",
                  boxShadow:
                    "inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)",
                  filter: "blur(0.970982px)",
                  borderRadius: "10.1429px",
                }}
              >
                {" "}
              </span>
              <span
                className="absolute left-[0px] top-[150px] h-[3px] w-[100%]"
                style={{
                  mixBlendMode: "hard-light",
                  border: "5.76786px solid #FFD56A",
                  boxShadow:
                    "inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)",
                  filter: "blur(0.970982px)",
                  borderRadius: "10.1429px",
                }}
              >
                {" "}
              </span>
              <span
                className="absolute left-[0px] bottom-[150px] h-[3px] w-[100%]"
                style={{
                  mixBlendMode: "hard-light",
                  border: "5.76786px solid #FFD56A",
                  boxShadow:
                    "inset -1.26228px 2.52455px 1.26228px rgba(255, 255, 255, 0.5)",
                  filter: "blur(0.970982px)",
                  borderRadius: "10.1429px",
                }}
              >
                {" "}
              </span>
              {possibilty.map((val, index: number) => (
                <div key={index}>
                  <Possible
                    val={val}
                    // possibilty={possibleCombinations}
                    index={index + 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className=" text-center inline-block  w-full">
        <h1
          style={{
            msTransform: "skewX(20deg)",
            WebkitTransform: "skewX(20deg)",
            textTransform: "uppercase",

            // webkitTransform: "skewX(20deg)",
            transform: "skewX(20deg)",
            display: "inline-block",
          }}
          className="text-white border-2 inline-block text-center text-[26px]  p-2 w-[250px]"
        >
          <span
            style={{
              transform: "skewX(-20deg)", // Counter the skew for the text
            }}
            className="text-white inline-block"
          >
            Round: {trackRounds} / 5
          </span>
        </h1>
      </div>
    </div>
  );
};

export default Homepage;
