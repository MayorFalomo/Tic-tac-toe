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
    },
    playerTwo: {
      id: "",
      name: "",
    },
  },
  gameSession: null,
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
    setGameSession(state, action) {
      state.gameSession = action.payload;
    },
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
  setGameSession,
} = playersSlice.actions;
export default playersSlice.reducer;
