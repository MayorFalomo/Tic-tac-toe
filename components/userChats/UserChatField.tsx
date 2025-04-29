import { Chat, TimeStamp } from '@/app/types/types';
import { doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { db } from '@/firebase-config/firebase';

type IProps = {
  res: Chat;
  combinedId: string;
  playerChats: Chat[];
  chatUniqueId: string | null;
  scrollToBtm: boolean;
  setScrollToBtm: (arg: boolean) => void;
};

const UserChatField: React.FC<IProps> = ({
  res,
  chatUniqueId,
  playerChats,
  scrollToBtm,
  setScrollToBtm,
}) => {
  const playersChatState = useAppSelector((state: RootState) => state.chatUp);
  const currentUser = useAppSelector((state: RootState) => state.user);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        const chatRef = doc(db, 'userChats', chatUniqueId!);
        await updateDoc(chatRef, {
          messages: updatedMessages,
        });
        // setStoredId(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setScrollToBtm(false);
  }, [scrollToBtm]);

  return (
    <div>
      <div
        ref={chatEndRef}
        className={`relative ${
          res.senderId === currentUser?.userId
            ? 'flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end'
            : 'flex w-full mt-2 space-x-3 max-w-xs'
        }`}
        // onMouseOver={() => setStoredId(res?._id)}
        // onMouseOut={() => setStoredId(null)}
      >
        {res.senderId !== currentUser?.userId && (
          <div className=" flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            {playersChatState.selectedPlayer?.avatar! && (
              <Image
                src={
                  res.senderId === currentUser?.userId
                    ? currentUser?.avatar!
                    : playersChatState?.selectedPlayer?.avatar!
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
          {playersChatState?.selectedPlayer?.id === res?._id && (
            <div
              className={
                res?.senderId === currentUser?.userId
                  ? 'absolute left-0 bottom-[-35px] z-30 '
                  : 'absolute left-0 bottom-[-35px] z-30'
              }
            >
              <EmojiPicker
                reactionsDefaultOpen={true}
                onEmojiClick={(e: EmojiClickData) =>
                  handleReactions(e, res?._id, currentUser?.userId)
                }
              />
            </div>
          )}
          <div
            className={
              res.senderId === currentUser?.userId
                ? 'bg-chatBgCurrentUser text-white py-3 px-2 rounded-l-lg rounded-br-lg'
                : 'relative bg-chatBgOpponent py-3 px-2 rounded-r-lg rounded-bl-lg'
            }
          >
            <p className="text-sm">{res?.message ? res?.message : ''}</p>
            {res.reactions && res.reactions.length > 0 && (
              <p
                className={
                  res?.senderId === currentUser?.userId
                    ? 'absolute right-[40px] bottom-[0px] bg-white rounded-md p-[2px] z-20'
                    : 'absolute right-[-10px] bottom-[-20px] bg-white z-20 rounded-md p-[2px]'
                }
              >
                {res.reactions.map((reaction) => (
                  <span key={reaction.userId}>{reaction.reaction}</span>
                ))}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 leading-none">
            {formatTime(res?.timeStamp)}
          </span>
        </div>
        {res.senderId === currentUser?.userId && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
            {currentUser?.avatar! && (
              <Image
                src={
                  res.senderId !== currentUser?.userId
                    ? playersChatState?.selectedPlayer?.avatar!
                    : currentUser?.avatar!
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

export default UserChatField;
