import { createSlice } from "@reduxjs/toolkit";

interface Track {
  trackTheWinnner: string;
  trackRounds: number;
   trackDisableRound: boolean;
  playersSessionId: SessionId;
  gameSessionId: string;
  combinedGameSessionId: string;
  trackWhoPlays: string | null;
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  trackSound: boolean;
  notifBg: string;
  iconColor: string;
}

export interface SessionId {
  playerOneSessionId: string;
  playerTwoSessionId: string;
}

const initialState: Track = {
  trackTheWinnner: "",
  trackRounds: 1,
   trackDisableRound: true,
  gameSessionId: "",
  combinedGameSessionId: "",
  trackWhoPlays: null,
  playersSessionId: {
    playerOneSessionId: "",
    playerTwoSessionId: "",
  },
  scores: {
    playerOne: 0,
    playerTwo: 0,
  },
  trackSound: false,
  notifBg: "red",
  iconColor: 'icon-glow-emerald'
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
    setTrackScores: (state, action) => {
      state.scores = action.payload;
    },
    setCombinedGameSessionId: (state, action) => {
      state.combinedGameSessionId = action.payload;
    },
    setTrackSound: (state, action) => { 
      state.trackSound = action.payload;
    },
    changeNotifBg: (state, action) => {
      state.notifBg = action.payload;
    },
    changeIconColor: (state, action) => {
      state.iconColor = action.payload
    }
  },
});

export const {
  setTrackWinner,
  setTrackRounds,
  setSessionId,
  setTrackWhoPlays,
  setPlayersSessionId,
  setTrackDisableRound,
  setTrackScores,
  setCombinedGameSessionId,
  setTrackSound,
  changeNotifBg,
  changeIconColor
} = trackerSlice.actions;
export default trackerSlice.reducer;
