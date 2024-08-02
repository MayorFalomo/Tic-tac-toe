import { Selected } from "@/app/types/types";
import { createSlice } from "@reduxjs/toolkit";

interface Players {
  playerOne: Selected[];
  playerTwo: Selected[];
  currentplayerControl: boolean;
  getIndexSelected: number;
  getSelected: number[];
}

const initialState: Players = {
  playerOne: [],
  playerTwo: [],
  currentplayerControl: false,
  getIndexSelected: 0,
  getSelected: [],
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
  },
});

export const {
  addPlayerOne,
  addPlayerTwo,
  changeCurrentPlayerControl,
  changeIndexSelected,
  emptyPlayer,
  setGetSelected,
} = playersSlice.actions;
export default playersSlice.actions;
