import { Timestamp } from "firebase/firestore";

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
export type fullPlayerType = {
  id: string;
  name: string;
  avatar: string;
  networkState?: string;
  status?: string;
  unreadMessages?: Unread[];
  createdAt?: string;
  updatedAt?: string;
}

export type Unread = {
  combinedId: string;
  id: string;
  name: string;
  avatar: string;
  message: string;
  status?: boolean;
  type?: string;
  timeStamp: TimeStamp;
  answer?: string;
  senderId?: string;
}

export type PlayerDetails = {
  id: string;
  name: string;
  avatar?: string;
  networkState: string;
  lastMessage?: string;
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

export interface SessionPlayerDetails {
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

export type PlayerChatType = {
  combinedId: string;
  messages: Chat[];
  participants: string[];
  participantsObject: PlayerDetails[];
  timestamp: TimeStamp;
  typing: boolean;
  lastMessage?: string;
  playerOneUnread?: number;
 playerTwoUnread?: number;
  lastMessageTimeStamp?: Timestamp;
}

export type Chat = {
  _id: string;
  senderId: string;
  message: string;
  timeStamp: TimeStamp;
  reactions: Reaction[];
  receiverId?: string;
  // lastMessage: [];
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

export interface GlobalChatType {
  id: string;
  senderId: string;
  message: string;
  name: string;
  avatar: string;
  timeStamp: TimeStamp;
}

export interface GroupedChatters {
  [key: string]: GlobalChatType[];
}

export interface battleInvitationType {
  combinedId: string;
  id: string;
  message: string;
  timeStamp: TimeStamp;
  name: string;
  avatar: string;
  type: string;
  answer: string;
  senderId: string;
}

export enum firebaseCollections {
  GAMESESSIONS = 'gameSessions',
  GLOBALCHAT = 'globalChat',
  PLAYERS = 'players',
  PLAYERSCHATS = 'playersChats',
  PLAYERMOVES = 'playersMoves',
  USERCHATS = 'userChats',
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
  FAILED = 'failed',
  IDLE = 'idle'
}

export enum NotifType {
  MESSAGE = 'message',
  ALERT = 'alert',
  UPDATE = 'update',
  BATTLE = 'battle',  
}

export enum BattleReplyStatus {
  ACCEPT = 'accept',
  DECLINE = 'decline',
  PENDING = 'pending',
}

export const defaultImg = 'https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg'