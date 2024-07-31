import { configureStore } from "@reduxjs/toolkit";
import { possibleSlice } from "./features/PossibilitySlice";

export const possibiltyStore = () => {
  return configureStore({
    reducer: {
      //All the slices would be here
      possible: possibleSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof possibiltyStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
