import { configureStore } from "@reduxjs/toolkit";
import { possibleSlice } from "./features/PossibilitySlice";
import { playersSlice } from "./features/PlayerSlice";
import { trackerSlice } from "./features/TrackerSlice";
import { userSlice } from "./features/userSlice";
import { ChatAPlayerSlice } from "./features/ChatAPlayerSlice";

export const possibiltyStore = () => {
  return configureStore({
    reducer: {
      //All the slices would be here
      possible: possibleSlice.reducer,
      players: playersSlice.reducer,
      track: trackerSlice.reducer,
      user: userSlice.reducer,
      chatUp: ChatAPlayerSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof possibiltyStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
