import { userDetails } from "@/app/types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: userDetails = {
  userId: '',
  name: '',
  avatar: '',
  networkState: false,
};

export const userSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setAPlayer: (state, action) => {
      return { ...state, ...action.payload };
    },

    updateUser: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAPlayer, updateUser } = userSlice.actions;

export default userSlice.reducer;
