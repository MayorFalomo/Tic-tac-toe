import { Chat, GameSession, TimeStamp } from '@/app/types/types';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';

type IProps = {
  res: Chat;
  combinedId: string;
  playerChats: Chat[];
  storedId: string | null;
  chatUniqueId: string | null;
  setStoredId: (arg: string | null) => void;
  gameData: GameSession | null;
};

const ChatField: React.FC<IProps> = ({
  res,
  combinedId,
  playerChats,
  storedId,
  setStoredId,
  chatUniqueId,
  gameData,
}) => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);

  const formatTime = (timestamp: TimeStamp) => {
    //First run conversions to a formatable date
    const date = new Date(timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1000000);

    // Get the hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format to ensure two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`; // Returns time in HH:MM format
  };

  const handleReactions = async (
    emoji: EmojiClickData,
    messageId: string | null,
    senderId: string | null
  ) => {
    if (messageId) {
      try {
        // Map through all the messages to find and update the specific message
        const updatedMessages = playerChats?.map((msg: Chat) => {
          // Check if the msg id matches the messageId
          if (msg._id === messageId) {
            //I then Check if the user has already reacted previously
            const hasReacted = msg?.reactions?.some(
              (react) => react?.userId === senderId
            );

            if (hasReacted) {
              //If User has reacted, update the reaction
              return {
                ...msg,
                reactions: msg?.reactions?.map((react) => {
                  if (react?.userId === senderId) {
                    return {
                      ...react,
                      reaction: emoji?.emoji,
                    };
                  }
                  return react; // Return an unchanged reaction if the user hasn't reacted before
                }),
              };
            } else {
              // User hasn't reacted yet, add a new reaction
              return {
                ...msg,
                reactions: [
                  ...(msg?.reactions || []), // Preserve existing reactions
                  {
                    reaction: emoji?.emoji,
                    userId: senderId,
                  },
                ],
              };
            }
          }
          return msg;
        });

        // Update Firebase
        const chatRef = doc(db, 'playersChats', chatUniqueId!);
        await updateDoc(chatRef, {
          messages: updatedMessages,
        });
        setStoredId(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <div
        className={`relative ${
          res.senderId === playersObject?.playerOne?.id
            ? 'flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end'
            : 'flex w-full mt-2 space-x-3 max-w-xs'
        }`}
        onMouseOver={() => setStoredId(res?._id)}
        onMouseOut={() => setStoredId(null)}
      >
        {res.senderId !== playersObject?.playerOne?.id && (
          <div className=" flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            {playersObject?.playerTwo?.avatar! && (
              <Image
                src={
                  res.senderId === gameData?.players?.playerOne?.id
                    ? gameData?.players?.playerOne?.avatar!
                    : gameData?.players?.playerTwo?.avatar!
                }
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
                alt="img"
              />
            )}
          </div>
        )}
        <div>
          {storedId === res?._id && (
            <div
              className={
                res?.senderId === playersObject?.playerOne?.id
                  ? 'absolute left-0 bottom-[-35px] z-30 '
                  : 'absolute left-0 bottom-[-35px] z-30'
              }
            >
              <EmojiPicker
                reactionsDefaultOpen={true}
                onEmojiClick={(e: EmojiClickData) =>
                  handleReactions(e, res?._id, playersObject?.playerOne?.id)
                }
              />
            </div>
          )}
          <div
            className={
              res.senderId === playersObject?.playerOne?.id
                ? 'bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg'
                : 'bg-gray-300 p-3 rounded-r-lg rounded-bl-lg'
            }
          >
            <p className="text-sm">{res?.message ? res?.message : ''}</p>
          </div>
          <span className="text-xs text-gray-500 leading-none">
            {formatTime(res?.timeStamp)}
          </span>
          {res.reactions && res.reactions.length > 0 && (
            <p
              className={
                res?.senderId === playersObject?.playerOne?.id
                  ? 'absolute right-[40px] bottom-[0px] bg-white rounded-md p-[2px] z-20'
                  : 'absolute left-[40px] bottom-[0px] bg-white z-20 rounded-md p-[2px]'
              }
            >
              {res.reactions.map((reaction) => (
                <span key={reaction.userId}>{reaction.reaction}</span>
              ))}
            </p>
          )}
        </div>
        {res.senderId === playersObject?.playerOne?.id && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            {playersObject?.playerOne?.avatar! && (
              <Image
                src={
                  res.senderId !== playersObject?.playerOne?.id
                    ? playersObject?.playerTwo?.avatar!
                    : playersObject?.playerOne?.avatar!
                }
                width={40}
                height={40}
                alt="img"
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatField;
