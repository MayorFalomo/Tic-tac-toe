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
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  winner: string | null;
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

