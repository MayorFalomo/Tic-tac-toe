import { PlayerNames, Selected } from "@/app/types/types";
import { createSlice } from "@reduxjs/toolkit";

interface Players {
  playerOne: Selected[];
  playerTwo: Selected[];
  currentplayerControl: boolean;
  getIndexSelected: number;
  getSelected: number[];
  players: PlayerNames;
  gameSession: null;
  moves: Move[];
}

export interface Move {
  playerId: string;
  choice: string;
  timeStamp: string;
  // nextPlayerId: string;
}

const initialState: Players = {
  playerOne: [],
  playerTwo: [],
  currentplayerControl: false,
  getIndexSelected: 0,
  getSelected: [],
  players: {
    playerOne: {
      id: "",
      name: "",
      avatar: "",
      currentlyPlaying: false,
       initialCurrentlyPlaying: false,
    },
    playerTwo: {
      id: "",
      name: "",
      avatar: "",
      currentlyPlaying: false,
      initialCurrentlyPlaying: false,
    },
  },
  gameSession: null,
  moves: []
};

export const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    addPlayerOne(state, action) {
      state.playerOne.push(action.payload);
    },
    addPlayerTwo(state, action) {
      state.playerTwo.push(action.payload);
    },
    changeCurrentPlayerControl(state, action) {
      state.currentplayerControl = action.payload;
    },
    changeIndexSelected(state, action) {
      state.getIndexSelected = action.payload;
    },
    emptyPlayer(state, action) {
      state.playerOne = [];
      state.playerTwo = [];
    },
    setGetSelected(state, action) {
      state.getSelected = action.payload;
    },
    updatePlayerOne(state, action) {
      return { ...state.playerOne, ...action.payload };
    },
    updatePlayerTwo(state, action) {
      return { ...state.playerTwo, ...action.payload };
    },
    givePlayerNames(state, action) {
      state.players.playerOne = action.payload.playerOne
      state.players.playerTwo = action.payload.playerTwo
    },
     updateCurrentlyPlaying(state, action) {
      // Updates the `currentlyPlaying` state for the appropriate player
      const { nextPlayerId } = action.payload; // Payload should include the playerId
      if (state.players.playerOne.id === nextPlayerId) {
        state.players.playerTwo.currentlyPlaying = true;
        state.players.playerOne.currentlyPlaying = false;
      } else if (state.players.playerTwo.id === nextPlayerId) {
        state.players.playerOne.currentlyPlaying = true;
        state.players.playerTwo.currentlyPlaying = false;
      }
    },
    setGameSession(state, action) {
      state.gameSession = action.payload;
    },
    setMoves(state, action) {
      state.moves = action.payload;
    }
  },
});

export const {
  addPlayerOne,
  addPlayerTwo,
  changeCurrentPlayerControl,
  changeIndexSelected,
  emptyPlayer,
  setGetSelected,
  updatePlayerOne,
  updatePlayerTwo,
  givePlayerNames,
  updateCurrentlyPlaying,
  setGameSession,
  setMoves
} = playersSlice.actions;
export default playersSlice.reducer;
