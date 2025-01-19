import { Combinations, Selected } from "@/app/types/types"; //Define the type we want to expect from Typescript
import { createSlice } from "@reduxjs/toolkit"; // Then we create a slice from github

import type { PayloadAction } from "@reduxjs/toolkit";

interface PossibiltyState {
  possibility: Combinations;
}

//So now i'm expecting a possibility array of array of numbers that would be my initialState
const initialState: PossibiltyState = {
  possibility: [
    [1, 2, 3],
    [1, 4, 7],
    [1, 5, 9],
    [2, 5, 8],
    [3, 5, 7],
    [3, 6, 9],
    [4, 5, 6],
    [7, 8, 9],
    [1, 2, 3],
  ],
};

export const possibleSlice = createSlice({
  name: "possibility",
  initialState,
  reducers: {
    getAllPossibileCombinations: (state, action: PayloadAction<number[][]>) => {
    },
  },
});

export const { getAllPossibileCombinations } = possibleSlice.actions;
export default possibleSlice.reducer;
