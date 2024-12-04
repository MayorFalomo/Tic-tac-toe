import { createSlice } from "@reduxjs/toolkit";

interface track {
  trackTheWinnner: string;
  trackRounds: number;
  trackDisableRound: boolean;
  playerOneScore: number;
  playerTwoScore: number;
  disabledClick: boolean;
  playersSessionId: SessionId;
  gameSessionId: string;
  trackWhoPlays: string | null;
}

export interface SessionId {
  playerOneSessionId: string;
  playerTwoSessionId: string;
}

const initialState: track = {
  trackTheWinnner: "",
  trackRounds: 1,
  trackDisableRound: true,
  playerOneScore: 0,
  playerTwoScore: 0,
  disabledClick: false,
  gameSessionId: "",
  trackWhoPlays: null,
  playersSessionId: {
    playerOneSessionId: "",
    playerTwoSessionId: "",
  }
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
    setSessionId: (state, action) => {
      state.gameSessionId = action.payload;
    },
    setTrackWhoPlays: (state, action) => {
      state.trackWhoPlays = action.payload
    },
   setPlayersSessionId: (state, action) => {
  if (action.payload.playerOneSessionId) {
    state.playersSessionId.playerOneSessionId = action.payload.playerOneSessionId;
  }
  if (action.payload.playerTwoSessionId) {
    state.playersSessionId.playerTwoSessionId = action.payload.playerTwoSessionId;
  }
    },
    setTrackDisableRound: (state, action) => {
      state.trackDisableRound = action.payload;
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
  setSessionId,
  setTrackWhoPlays,
  setPlayersSessionId,
  setTrackDisableRound,
} = trackerSlice.actions;
export default trackerSlice.reducer;
