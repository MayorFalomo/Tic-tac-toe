'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useSound from 'use-sound';

interface AudioProviderProps {
  children: React.ReactNode;
  src: string;
}

interface AudioContextType {
  play: () => void;
  stop: () => void;
}

// Create the context with a default value of null
const AudioContext = createContext<AudioContextType | null>(null);

// Custom hook to use the audio context
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// The AudioProvider component
export const AudioProvider: React.FC<AudioProviderProps> = ({ children, src }) => {
  const [play, { stop }] = useSound(src, { volume: 1 });

  return <AudioContext.Provider value={{ play, stop }}>{children}</AudioContext.Provider>;
};
