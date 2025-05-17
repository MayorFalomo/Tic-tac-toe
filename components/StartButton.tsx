import React from 'react';
import { Play } from 'lucide-react';

interface StartButtonProps {
  isReady: boolean;
  onClick: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ isReady, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!isReady}
      className={`
        relative group overflow-hidden
        bg-gradient-to-br from-green-500 to-emerald-700
        text-white font-bold text-lg py-3 px-8 rounded-lg
        transition-all duration-500 transform
        ${
          isReady
            ? 'opacity-100 translate-y-0 hover:scale-105 hover:shadow-lg'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }
        focus:outline-none focus:ring-2 focus:ring-green-400
        focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-gray-900
      `}
    >
      {/* Pulsing background effect */}
      <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>

      {/* Shadow overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-t from-black to-transparent opacity-20"></span>

      <span className="relative flex items-center justify-center gap-2">
        <Play className="w-5 h-5" />
        Start Game
      </span>
    </button>
  );
};

export default StartButton;
