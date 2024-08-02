import { createSlice } from "@reduxjs/toolkit";

interface track {
  trackTheWinnner: string;
  trackRounds: number;
  playerOneScore: number;
  playerTwoScore: number;
  disabledClick: boolean;
}

const initialState: track = {
  trackTheWinnner: "",
  trackRounds: 1,
  playerOneScore: 0,
  playerTwoScore: 0,
  disabledClick: false,
};

export const trackerSlice = createSlice({
  name: "tracker",
  initialState: initialState,
  reducers: {
    setTrackWinner(state, action) {
      state.trackTheWinnner = action.payload;
    },
    setTrackRounds(state, action) {
      state.trackRounds = 1 + action.payload;
    },
    setTrackPlayerOneScore(state, action) {
      state.playerOneScore = 1 + action.payload;
    },
    setTrackPlayerTwoScore(state, action) {
      state.playerTwoScore = 1 + action.payload;
    },
    setDisabledClick(state, action) {
      state.disabledClick = action.payload;
    },
    emptyScore(state, action) {
      state.playerOneScore = 0;
      state.playerTwoScore = 0;
    },
  },
});

export const {
  setTrackWinner,
  setTrackRounds,
  setTrackPlayerOneScore,
  setTrackPlayerTwoScore,
  setDisabledClick,
  emptyScore,
} = trackerSlice.actions;
export default trackerSlice.reducer;
