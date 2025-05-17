import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="relative w-full mt-[40px]">
      {/* Percentage display */}

      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden relative">
        {/* Animated glow effect on bar */}
        <div className="absolute inset-0 flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full w-full scale-x-0 origin-left transition-transform duration-100 ease-out"
            style={{ transform: `scaleX(${progress / 100})` }}
          ></div>
        </div>

        {/* Animated shine effect */}
        <div
          className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            width: '100%',
            animation: progress < 100 ? 'shine 1.5s infinite' : 'none',
            backgroundSize: '200% 100%',
          }}
        ></div>
      </div>

      {/* Pulse effect at the current progress point */}
      <div
        className="absolute top-1 -translate-y-1/2 h-4 w-4 rounded-full bg-white"
        style={{
          left: `${progress}%`,
          opacity: progress < 100 ? 1 : 0,
          transform: `translateX(-50%) translateY(-50%) ${
            progress < 100 ? 'scale(1)' : 'scale(0)'
          }`,
          boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5)',
          transition: 'left 0.2s ease-out, opacity 0.3s, transform 0.3s',
        }}
      ></div>
      <div className="w-fit flex justify-center mx-auto mt-6">
        <div className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1">
          <span className="text-gray-200 font-mono font-semibold text-sm">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
