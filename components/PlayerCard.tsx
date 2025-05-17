import React from 'react';
// import { Player } from '../types';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { PlayerDetails, userDetails } from '@/app/types/types';

interface PlayerCardProps {
  player: PlayerDetails;
  position: 'left' | 'right';
  isLoading: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, position, isLoading }) => {
  return (
    <div
      className={`relative ${
        position === 'left' ? 'text-left' : 'text-right'
      } transition-all duration-700 ease-in-out transform ${
        isLoading
          ? position === 'left'
            ? '-translate-x-10 opacity-90'
            : 'translate-x-10 opacity-90'
          : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`
          relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 
          rounded-xl overflow-hidden p-1 
          ${position === 'left' ? 'origin-left' : 'origin-right'}
          shadow-lg hover:shadow-2xl transition-all duration-300
          border-2 border-opacity-50 ${
            position === 'left' ? 'border-blue-500' : 'border-red-500'
          }
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br opacity-20 from-transparent via-transparent to-black"></div>

        {/* Background glow effect */}
        <div
          className={`absolute inset-0 ${
            position === 'left' ? 'bg-blue-500' : 'bg-red-500'
          } blur-3xl opacity-20`}
        ></div>

        <div className="relative z-10 p-4 flex max-[550px]:flex-col gap-4 items-center">
          {/* Avatar container with border glow */}
          <div
            className={`relative ${
              position === 'left' ? 'md:order-first' : 'md:order-last'
            }`}
          >
            <h2 className="max-[640px]:flex hidden  max-[640px]:text-xl max-[480px]:text-[16px] font-bold text-white tracking-wide">
              {player.name}
            </h2>
            <div
              className={`absolute inset-0 rounded-full ${
                position === 'left' ? 'bg-blue-500' : 'bg-red-500'
              } blur-md opacity-50`}
            ></div>
            <div className="relative overflow-hidden rounded-full h-20 w-20 md:h-24 md:w-24 border-2 border-white border-opacity-30">
              <Image
                src={player.avatar!}
                width={150}
                height={150}
                alt={`${player.name}'s avatar`}
                className="h-[150px] w-[150px] max-[850px]:h-[100px] max-[850px]:w-[100px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    player.name
                  )}&background=${
                    position === 'left' ? '3b82f6' : 'ef4444'
                  }&color=fff&size=100`;
                }}
              />
            </div>
          </div>

          <div
            className={`flex flex-col ${
              position === 'left' ? 'md:text-left' : 'md:text-right'
            } text-center`}
          >
            <h2 className="max-[640px]:hidden text-xl md:text-2xl font-bold text-white tracking-wide">
              {player.name}
            </h2>

            {player.id && (
              <div
                className={`flex items-center gap-1 ${
                  position === 'left' ? 'md:justify-start' : 'md:justify-end'
                } justify-center mt-1`}
              >
                <span className="text-gray-300 text-xs uppercase tracking-widest">
                  Level
                </span>
                <span className="text-white font-bold bg-gray-700 bg-opacity-70 px-2 py-0.5 rounded-md">
                  {1}
                </span>
              </div>
            )}

            {player.id !== undefined && (
              <div
                className={`flex items-center gap-2 ${
                  position === 'left' ? 'md:justify-start' : 'md:justify-end'
                } justify-center mt-2`}
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-200 text-sm">{0} Wins</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
