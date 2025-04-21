import { createSlice } from "@reduxjs/toolkit";

interface SelectPlayer {
    selectedPlayer: Player;
    combinedChattingId: string;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    networkState: string;
}

const initialState: SelectPlayer = {
    selectedPlayer: {
        id: '',
        name: '',
        avatar: '',
        networkState: '',
    },
    combinedChattingId: '',
}

export const ChatAPlayerSlice = createSlice({
    name: 'chatAPlayer',
    initialState,
    reducers: {
        setSelectedPlayer(state, action) {
            state.selectedPlayer = action.payload;
        },
        setCombinedChattingId(state, action) {
            state.combinedChattingId = action.payload;
        }
    }
})

export const { setSelectedPlayer, setCombinedChattingId } = ChatAPlayerSlice.actions;

export default ChatAPlayerSlice.reducer;