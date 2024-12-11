import React from "react";

export type Combinations = number[][];

export type SelectedAnswer = {
  answers: Selected[];
};
export type Selected = {
  player: string;
  choice: number;
  score?: number;
  currrentPlayerControl?: boolean;
  gameId?: string;
  // playerId: string;
};

export type PlayerNames = {
  playerOne: PlayerDetails;
  playerTwo: PlayerDetails;
};

export type PlayerDetails = {
  id: string
  name: string;
  avatar?: string;
}



export type User = {
  playerId: string;
  status: string;
  playerName: string;
  // gameId: string;
};

export type GameSession = {
  sessionId: string;
  currentTurn: string;
  firstPlayer: string;
  rounds: number;
  createdAt: string;
  roundWinner: string;
  endOfRound: boolean;
  winner: string | null;
  winningCombination: number[] | null,
  goToNextRound?: boolean,
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  players: {
    playerOne: SessionPlayerDetails;
    playerTwo: SessionPlayerDetails;
  };
  
};

export type SessionPlayerDetails = {
  id: string;
  name: string;
  avatar: string | null;
};

export type MovesObject = {
  choice: number;
  playerId: string;
  timestamp: string;
};

