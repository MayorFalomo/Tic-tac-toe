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

  const handleReactions = async (
    emoji: EmojiClickData,
    messageId: string | null,
    senderId: string | null
  ) => {
    // handle reactions
    if (messageId) {
      try {
        const chatRef = collection(db, 'playersChats');
        const q = query(chatRef, where('combinedId', '==', combinedId));

        const chatDoc = await getDocs(q);
        console.log(chatDoc, 'chatDoc');

        if (!chatDoc.empty) {
          const chatId = chatDoc.docs[0].id;
          const chatRef = doc(db, 'playersChats', chatId);
          const chatData = chatDoc.docs[0].data();

          const messages: Chat[] = chatData.messages; //Where messages is an array of object of all messages

          //Then I Map through messages to update the specific message
          const updatedMessages = messages.map((msg: Chat) => {
            //First I check If the msg_ id matches the messageId.
            if (msg._id === messageId) {
              //Then I map through the reactions to find the specific reaction having the same userId as the senderId and if I see one, I update the reaction for that message, Mow A user can't react to their message twice.
              const updatedReaction = msg.reactions?.map((react) => {
                if (react?.userId === senderId) {
                  return {
                    ...react,
                    reaction: emoji.emoji,
                  };
                }
                return react;
              });
              console.log(updatedReaction, 'updatedReaction');

              //Now to be sure the user isn't actually in the reactions array already, I check if the updatedReaction array has the senderId in it.
              const checkForExistingReaction = updatedReaction?.some(
                (reaction) => reaction.userId === senderId
              );
              console.log(checkForExistingReaction, 'checked');

              //If the checkForExisiting reaction returns false then it means the user hasn't reacted already then I push the new reaction to the reactions array.
              if (!checkForExistingReaction) {
                return {
                  ...msg,
                  reactions: [
                    ...(updatedReaction || []), //To Ensure the existing reactions are preserved
                    {
                      reaction: emoji.emoji,
                      userId: senderId,
                    },
                  ],
                };
              }
              return { ...msg, reactions: updatedReaction };
            }
            return msg;
          });

          await updateDoc(chatRef, {
            messages: updatedMessages,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <div
        className={`relative border border-red-600 ${
          res.senderId === playersObject?.playerOne?.id
            ? 'flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end'
            : 'flex w-full mt-2 space-x-3 max-w-xs'
        }`}
        onMouseOver={() => setStoredId(res?._id)}
        // onFocus={() => setStoredId(res?._id)}
        onMouseOut={() => setStoredId(null)}
        // onBlur={() => setStoredId(null)}
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
          {storedId === res?._id && (
            <div
              className={
                res?.senderId === playersObject?.playerOne?.id
                  ? 'absolute left-0 bottom-[-35px] z-30 border border-blue-500'
                  : 'absolute left-0 bottom-[-35px] z-30 border border-red-600'
              }
            >
              <EmojiPicker
                reactionsDefaultOpen={true}
                onEmojiClick={(e: EmojiClickData) =>
                  handleReactions(e, res?._id, res?.senderId)
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
          {
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
