import { User } from "@/app/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: User = {
  playerId: "",
  playerName: "",
  status: "",
};

export const userSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setAPlayerId: (state, action) => {
      state.playerId = action.payload;
    },
  },
});

export const { setAPlayerId } = userSlice.actions;

export default userSlice.reducer;
