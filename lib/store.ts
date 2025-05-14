import { configureStore } from "@reduxjs/toolkit";
import { possibleSlice } from "./features/PossibilitySlice";
import { playersSlice } from "./features/PlayerSlice";
import { trackerSlice } from "./features/TrackerSlice";
import { userSlice } from "./features/userSlice";
import { ChatAPlayerSlice } from "./features/ChatAPlayerSlice";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";

const persistConfig = {
  key: 'root',
  version: 1,
  storage
}

const rootReducer = combineReducers({
  // All the slices would be here
  possible: possibleSlice.reducer,
  players: playersSlice.reducer,
  track: trackerSlice.reducer,
  user: userSlice.reducer,
  chatUp: ChatAPlayerSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const createStore = () => {
  const store = configureStore({
     reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false
       })
  })
  const persistor = persistStore(store);
  return {
    store,
    persistor
  }
};

export type AppStore = ReturnType<typeof createStore>['store'];
export type Persistor = ReturnType<typeof createStore>['persistor'];
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
