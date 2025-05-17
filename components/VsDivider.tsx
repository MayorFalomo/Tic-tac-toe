import React from 'react';

interface VSDividerProps {
  isLoading: boolean;
}

const VSDivider: React.FC<VSDividerProps> = ({ isLoading }) => {
  return (
    <div className="relative flex items-center justify-center z-20">
      <div
        className={`absolute w-20 h-20 rounded-full bg-purple-600 blur-xl opacity-20 transition-opacity duration-700 ${
          isLoading ? 'opacity-20' : 'opacity-50'
        }`}
      ></div>

      <div
        className={`
          relative bg-gradient-to-br from-purple-800 to-purple-900 
          rounded-full w-10 h-10 min-[540px]:w-16 min-[540px]:h-16 md:w-20 md:h-20 
          flex items-center justify-center
          transition-all duration-700 transform
          ${isLoading ? 'scale-90 opacity-90' : 'scale-100 opacity-100'}
          shadow-lg border-2 border-purple-500 border-opacity-50
        `}
      >
        <div className="absolute -inset-1 bg-purple-500 blur-sm opacity-20 rounded-full"></div>
        <span className="font-bold text-white text-[18px] min-[480px]:text-xl md:text-3xl drop-shadow-md">
          VS
        </span>

        <div
          className={`
          absolute -inset-2 md:-inset-3 border-2 border-purple-400 rounded-full 
          opacity-0 ${isLoading ? 'animate-ping' : ''}
        `}
        ></div>
      </div>
    </div>
  );
};

export default VSDivider;
