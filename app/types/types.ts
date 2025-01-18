
export interface AudioContextType {
  playSound: () => void;
  pauseSound: () => void;
  isPlaying: boolean;
}

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
  unChangeableFirstPlayer?: string;
  rounds: number;
  createdAt: string;
  roundWinner: string | null;
  ultimateWinner?: string | null;
  endOfRound: boolean;
  // winner: string | null;
  winningCombination: number[] | null,
  goToNextRound?: boolean,
  trackRoundPlayer: string;
  quitGame: boolean;
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  players: {
    playerOne: SessionPlayerDetails;
    playerTwo: SessionPlayerDetails;
  };
  gameOver?: boolean;
  playersGameStatus?: {
    playerOne: string;
    playerTwo: string;
  }
  unreadMessages?: {
    playerOne: number;
    playerTwo: number;
  }
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

export type Scores = {
  id: string;
  score: number;
};

export type Chat = {
  _id: string;
  senderId: string;
  message: string;
  timeStamp: TimeStamp;
  reactions: Reaction[];
}

export type TimeStamp = {
  seconds: number;
  nanoseconds: number;
}

export type Reaction = {
  userId: string;
  reaction: string;
}

export type AvatarTheme = {
  id: number,
  character: string,
  link: string;
}

export enum PlayerStatus {
  INGAME = 'inGame',
  LOOKING = 'looking',
  ACTIVE = 'active',
  ONLINE = 'online',
  OFFLINE = 'offline',
}