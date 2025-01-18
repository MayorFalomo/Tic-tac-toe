import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import Image from 'next/image';
import {
  doc,
  arrayUnion,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { Chat, GameSession } from '@/app/types/types';
import ChatField from './Chat';
import { useTheme } from '@/app/ThemeContext';

type Props = {
  openModal: boolean;
  setOpenModal: (arg: boolean) => void;
  combinedId: string;
  playersChat: Chat[];
  gameData: GameSession | null;
  chatUniqueId: string | null;
  //   setChatId: (arg: number) => void;
};

const ChatModal: React.FC<Props> = ({
  openModal,
  setOpenModal,
  combinedId,
  playersChat,
  gameData,
  chatUniqueId,
  //   setChatId,
}) => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);
  const [textMessage, setTextMessage] = useState<string>('');
  const [storedId, setStoredId] = useState<string | null>(null);

  const { currentTheme } = useTheme();

  const sendMessage = async (message: string) => {
    if (message.length > 1) {
      // Generate a unique message ID (could be a timestamp or UUID)
      const messageId = new Date().getTime();

      const chatRef = collection(db, 'playersChats');
      const q = query(chatRef, where('combinedId', '==', combinedId));

      const chatDoc = await getDocs(q);

      if (!chatDoc.empty) {
        const chatId = chatDoc.docs[0].id;
        const chatDocumentRef = doc(db, 'playersChats', chatId);
        const chatData = chatDoc.docs[0].data();

        // Update the messages array in the document
        await updateDoc(chatDocumentRef, {
          messages: arrayUnion({
            _id: messageId,
            senderId: playersObject?.playerOne?.id,
            message,
            timeStamp: Timestamp.now(),
            reactions: [],
          }),
        });

        // Update unread messages in gameSessions
        const isPlayerOne =
          playersObject?.playerOne?.id === gameData?.players?.playerOne?.id;

        await updateDoc(doc(db, 'gameSessions', combinedId), {
          unreadMessages: {
            playerOne: isPlayerOne
              ? gameData?.unreadMessages?.playerOne!
              : gameData?.unreadMessages?.playerOne! + 1,
            playerTwo: isPlayerOne
              ? gameData?.unreadMessages?.playerTwo! + 1
              : gameData?.unreadMessages?.playerTwo!,
          },
        });

        setTextMessage('');
      } else {
        console.log('No chat session found to send the message.');
      }
    }
  };

  useEffect(() => {
    if (openModal) {
      const clearNotif = async () => {
        try {
          // Determine which player is playerOne
          const isPlayerOne =
            playersObject?.playerOne?.id === gameData?.players?.playerOne?.id;
          // console.log(isPlayerOne, 'isplayerOne');

          await updateDoc(doc(db, 'gameSessions', combinedId), {
            unreadMessages: {
              playerOne: isPlayerOne ? 0 : gameData?.unreadMessages?.playerOne!,
              playerTwo: !isPlayerOne ? 0 : gameData?.unreadMessages?.playerTwo!,
            },
          });
        } catch (error) {
          console.error('Error updating unread messages: ', error);
        }
      };

      clearNotif();
    }
  }, [openModal, gameData, combinedId, playersObject]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 300,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        x: 300,
        opacity: 0,
      }}
      className="fixed right-0 top-0 z-40 flex flex-col items-center justify-center w-[40%] max-[1100px]:w-[60%] max-[600px]:w-[90%] max-h-screen h-screen bg-gray-100 text-gray-800"
    >
      <div className="flex flex-col gap-4 w-[90%] min-[480px]:h-[100%] max-[480px]:h-[95%] max-[480px]:mb-4 max-h-screen">
        <div className="flex items-center justify-between w-full mt-2">
          <div className="rounded-full">
            <div className="flex items-center gap-3">
              <Image
                src={
                  gameData?.players?.playerOne?.id === playersObject?.playerOne?.id
                    ? gameData?.players?.playerTwo?.avatar!
                    : gameData?.players?.playerOne?.avatar!
                }
                width={50}
                height={50}
                alt="img"
                className="w-[50px] h-[50px] object-cover rounded-full "
              />
              <p>{playersObject?.playerTwo?.name} </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setOpenModal(false);
              setStoredId(null);
            }}
          >
            Close
          </Button>
        </div>
        <div
          className={`${
            currentTheme === 'light' ? 'bg-royalGreen' : 'bg-black'
          } flex flex-col flex-grow w-full h-full max-w-xl shadow-xl rounded-lg overflow-hidden`}
        >
          <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
            {playersChat?.length > 0 ? (
              playersChat.map((res: Chat, index: number) => (
                <div key={res._id}>
                  <ChatField
                    res={res}
                    combinedId={combinedId}
                    playerChats={playersChat}
                    storedId={storedId}
                    setStoredId={setStoredId}
                    chatUniqueId={chatUniqueId}
                    gameData={gameData}
                  />
                </div>
              ))
            ) : (
              <div className="h-[100%] flex flex-col items-center justify-center">
                <p className="text-white">
                  Start conversation with {playersObject?.playerTwo?.name}{' '}
                </p>{' '}
                <p className="text-gray-500">Enter your message below. </p>
                <p className="mt-3 text-center">
                  Click on a message to send reactions 🤪
                </p>
              </div>
            )}
          </div>

          <div className="relative bg-gray-300 p-4">
            <textarea
              className="flex items-center h-[70px] w-full rounded px-2 pt-2 text-sm placeholder:pt-2 placeholder:pl-2 outline-none border-none "
              placeholder="Type your message and send reactions…"
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  // Allow Shift+Enter for new line
                  e.preventDefault();
                  sendMessage(e.currentTarget.value);
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setTextMessage(e.target.value);
              }}
              value={textMessage}
              maxLength={100}
            />
            <Button
              onClick={() => sendMessage(textMessage)}
              className="absolute top-[20px] right-[30px]"
            >
              Send{' '}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatModal;
