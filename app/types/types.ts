import React from "react";

export type Combinations = number[][];

export type SelectedAnswer = {
  answers: Selected[];
};
export type Selected = {
  player: string;
  choice: number;
};

export type MappedOver = {
  val: number[];
  // possibilty: Combinations;
  index: number;
  // playerOnesChoice?: Selected[];
  // setPlayerOnesChoice: React.Dispatch<React.SetStateAction<Selected[]>>;
  // playerTwosChoice?: Selected[];
  // setPlayerTwosChoice: React.Dispatch<React.SetStateAction<Selected[]>>;
  // currentPlayerControl: boolean;
  // setCurrentPlayerControl: React.Dispatch<React.SetStateAction<boolean>>;
  // getIndexSelected: number | null;
  // setGetIndexSelected: React.Dispatch<React.SetStateAction<number | null>>;
  // trackTheWinner: string;
  // setTrackTheWinner: React.Dispatch<React.SetStateAction<string>>;
  //   getSelected: number[];
  //   setGetSelected: React.Dispatch<React.SetStateAction<number[]>>;
};

export type User = {
  playerId: string;
  status: string;
  playerName: string;
};
