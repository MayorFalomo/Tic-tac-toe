
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
  id: string;
  name: string;
  avatar?: string;
  networkState: string;
}

export type userDetails = {
  userId: string;
  name: string;
  avatar?: string;
  networkState: boolean;
}

export type User = PlayerDetails;

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
  winningCombination: number[] | null,
  goToNextRound?: boolean,
  trackRoundPlayer: string;
  quitGame: boolean;
  draw: boolean;
  scores: PlayersNumbers;
  players: {
    playerOne: SessionPlayerDetails;
    playerTwo: SessionPlayerDetails;
  };
  gameOver?: boolean;
  playersGameStatus?: GamesStatusAsString;
  unreadMessages?: PlayersNumbers;
  trackPlayersOnlineStatus?: TrackPlayersBoolean
};

export type PlayersNumbers = {
  playerOne: number;
  playerTwo: number;
}

export type GamesStatusAsString = {
  playerOne: string;
  playerTwo: string;
}

export type TrackPlayersBoolean = {
  playerOne: string;
  playerTwo: string;
}

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
  PENDING = 'pending',
}

export enum ProfileStatus {
  SEARCH = 'search',
  CREATE = 'create',
  FOUND = 'found',
  NONE = 'none',
}

export type ProfileType = {
  userId: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export type AvatarChoice = {
  id: number,
  avatarStyle: string,
  avatarValue: string,
}

export enum AvatarValueType {
  Anime = 'Anime',
  SuperHeroes = 'Superheroes',
  Avatar = 'Avatar',
  Initials = 'initials'
}

export enum LoadingState {
  LOADING = 'loading',
  SUCCESS = 'success',
  Failed = 'failed'
}

export const defaultImg = 'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg'