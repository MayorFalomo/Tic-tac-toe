'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { AppStore, createStore } from './lib/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<{ store: AppStore; persistor: any }>(); // Adjust type to include persistor

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = createStore();
  }
  return (
    <Provider store={storeRef.current.store}>
      <PersistGate loading={null} persistor={storeRef.current.persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
