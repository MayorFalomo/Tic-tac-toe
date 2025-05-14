'use client';
import { LoadingState, userDetails } from '@/app/types/types';
import useIndexedDB from '@/hooks/useIndexDb';
import { setAPlayer } from '@/lib/features/userSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserProviderProps {
  children: ReactNode;
}

interface PlayerContextType {
  currentUser: userDetails | null;
  loading: LoadingState;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const UserProvider = ({ children }: UserProviderProps) => {
  const { getData, db } = useIndexedDB();
  const dispatch = useAppDispatch();
  const currentUserState = useAppSelector(
    (state: RootState) => state.user as userDetails
  );

  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);

  const fetchPlayerData = async () => {
    try {
      setLoading(LoadingState.LOADING);
      const data = await getData();
      console.log(data, 'data');

      if (data) {
        dispatch(setAPlayer(data));
        setLoading(LoadingState.SUCCESS);
      } else {
        setLoading(LoadingState.FAILED);
      }
    } catch (err) {
      console.error('Error fetching player:', err);
      setLoading(LoadingState.FAILED);
    }
  };

  useEffect(() => {
    if (db && !currentUser?.userId) {
      fetchPlayerData();
    }
  }, [db, currentUserState?.userId]);

  const currentUser = currentUserState;

  return (
    <PlayerContext.Provider
      value={{
        currentUser,
        loading,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// Hook to access context
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
