import React, { useState } from 'react';
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

type Props = {
  setOpenModal: (arg: boolean) => void;
  combinedId: string;
  playersChat: any;
  gameData: GameSession | null;
  //   setChatId: (arg: number) => void;
};

const ChatModal: React.FC<Props> = ({
  setOpenModal,
  combinedId,
  playersChat,
  gameData,
  //   setChatId,
}) => {
  const playersObject = useAppSelector((state: RootState) => state.players.players);
  const [textMessage, setTextMessage] = useState<string>('');

  const sendMessage = async (message: string) => {
    // Generate a unique message ID (could be a timestamp or UUID)
    const messageId = new Date().getTime();

    const chatRef = collection(db, 'playersChats');
    const q = query(chatRef, where('combinedId', '==', combinedId));

    const chatDoc = await getDocs(q);
    console.log(chatDoc, 'chatDoc');

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
        //I need to find which player is playerOne
        unreadMessages: {
          playerOne:
            playersObject?.playerOne?.id === gameData?.players?.playerOne?.id
              ? chatData?.unreadMessages?.playerTwo + 1
              : 0,
          playerTwo:
            playersObject?.playerTwo?.id === gameData?.players?.playerTwo?.id
              ? chatData?.unreadMessages?.playerOne + 1
              : 0,
        },
      });
      setTextMessage('');
      console.log('Message sent:', message);
    } else {
      console.log('No chat session found to send the message.');
    }
  };

  //   console.log(playersChat, 'playersChats');
  //   console.log(playersObject?.playerTwo?.avatar, 'playersChats');

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
      className="fixed right-0 top-0 z-10 flex flex-col items-center justify-center w-[40%] min-h-screen bg-gray-100 text-gray-800"
    >
      <div className="flex flex-col gap-4 w-[90%] h-screen min-h-screen">
        <div className="flex items-center justify-between w-full mt-2">
          <div className="rounded-full">
            <div className="flex items-center gap-3">
              <Image
                src={playersObject?.playerTwo?.avatar!}
                width={50}
                height={50}
                alt="img"
                className="w-[50px] h-[50px] object-cover rounded-full "
              />
              <p>{playersObject?.playerTwo?.name} </p>
            </div>
          </div>
          <Button onClick={() => setOpenModal(false)}>Close</Button>
        </div>
        <div className="flex flex-col flex-grow w-full h-full max-w-xl bg-black shadow-xl rounded-lg overflow-hidden">
          <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
            {playersChat?.length > 0 ? (
              playersChat.map((res: Chat, index: number) => (
                <div key={res._id}>
                  <ChatField res={res} combinedId={combinedId} />
                </div>
              ))
            ) : (
              <div className="h-[100%] flex flex-col items-center justify-center">
                <p className="text-white">
                  Start conversation with {playersObject?.playerTwo?.name}{' '}
                </p>{' '}
                <p className="text-gray-500">Enter your message below. </p>
              </div>
            )}
          </div>

          <div className="relative bg-gray-300 p-4">
            <textarea
              className="flex items-center h-[70px] w-full rounded px-3 text-sm placeholder:pt-2 placeholder:pl-2 outline-none border-none "
              placeholder="Type your message…"
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
