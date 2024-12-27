import { Chat, TimeStamp } from '@/app/types/types';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';

type IProps = {
  res: Chat;
  combinedId: string;
};

const ChatField: React.FC<IProps> = ({ res, combinedId }) => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [storedId, setStoredId] = useState<string | null>(null);

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

  const handleReactions = async (emoji: EmojiClickData, messageId: string | null) => {
    // handle reactions
    if (messageId) {
      try {
        const chatRef = collection(db, 'playersChats');
        const q = query(chatRef, where('combinedId', '==', combinedId));

        const chatDoc = await getDocs(q);
        console.log(chatDoc, 'chatDoc');

        if (!chatDoc.empty) {
          const chatId = chatDoc.docs[0].id;
          const chatRef = doc(db, 'playersChats', chatId); // Adjust the path based on your Firestore structure
          const chatData = chatDoc.docs[0].data();

          const messages = chatData.messages; // Assuming messages is an array

          // Map through messages and update the specific message
          const updatedMessages = messages.map((msg: Chat) => {
            if (msg?._id === messageId) {
              // If the message ID matches, update the reactions
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []), // Ensure existing reactions are preserved
                  {
                    reaction: emoji.emoji,
                    userId: playersObject?.playerOne?.id, // or the appropriate user ID
                  },
                ],
              };
            }
            return msg; // Return the unchanged message
          });
          console.log(updatedMessages, 'updatedMessages');

          await updateDoc(chatRef, {
            messages: updatedMessages,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  console.log(storedId, 'storedId');

  return (
    <div>
      <div
        className={`relative ${
          res.senderId === playersObject?.playerOne?.id
            ? 'flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end'
            : 'flex w-full mt-2 space-x-3 max-w-xs'
        }`}
      >
        {res.senderId !== playersObject?.playerOne?.id && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            <Image
              src={playersObject?.playerTwo?.avatar!}
              width={40}
              height={40}
              alt="img"
            />
          </div>
        )}
        <div>
          {storedId === res._id && (
            <div
              className={
                res.senderId === playersObject?.playerOne?.id
                  ? 'absolute left-0 bottom-[-35px] z-30 border border-blue-500'
                  : 'absolute left-0 bottom-[-35px] z-30 border border-red-600'
              }
            >
              <EmojiPicker
                reactionsDefaultOpen={true}
                onEmojiClick={(e: EmojiClickData) => handleReactions(e, res?._id)}
              />
            </div>
          )}
          <div
            onMouseOver={() => setStoredId(res._id)}
            onFocus={() => setStoredId(res._id)}
            onMouseOut={() => setStoredId(null)}
            onBlur={() => setStoredId(null)}
            className={
              res.senderId === playersObject?.playerOne?.id
                ? 'bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg'
                : 'bg-gray-300 p-3 rounded-r-lg rounded-bl-lg'
            }
          >
            <p className="text-sm">{res.message ? res.message : ''}</p>
          </div>
          <span className="text-xs text-gray-500 leading-none">
            {formatTime(res.timeStamp)}
          </span>
          {
            <span
              className={
                res.senderId === playersObject?.playerOne?.id
                  ? 'absolute left-0 bottom-[-30px] z-20 border border-blue-500'
                  : 'absolute right-0 bottom-[-30px] z-20 border border-red-600'
              }
            >
              {/* {}{' '} */}
            </span>
          }
        </div>
        {res.senderId === playersObject?.playerOne?.id && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            <Image
              src={playersObject?.playerOne?.avatar!}
              width={40}
              height={40}
              alt="img"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatField;
