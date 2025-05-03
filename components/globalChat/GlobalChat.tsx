'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import GlobalUserChatField from './GlobalUserChatField';
import { Button } from '../ui/button';
import { Chat, GlobalChatType, userDetails } from '@/app/types/types';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import ProfileHeader from '../Profile/ProfileHeader';

type Props = {};

const GlobalChat = (props: Props) => {
  const { currentTheme } = useTheme();

  const [globalPlayerChatters, setGlobalPlayerChatters] = useState<GlobalChatType[]>([]);
  const [textMessage, setTextMessage] = useState<string>('');
  const [scrollToBtm, setScrollToBtm] = useState<boolean>(false);

  const currentUser = useAppSelector((state: RootState) => state.user);

  useEffect(() => {
    const docRef = doc(db, 'globalChat', 'messages');
    const unsubscribeChats = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log('Document data:', data);
        setGlobalPlayerChatters(data.messages || []);
      } else {
        console.log('No such document!');
      }
    });
    return () => {
      unsubscribeChats(); // Clean up the listener on component unmount
    };
  }, []);

  useEffect(() => {
    const fetchGlobalChatters = async () => {
      try {
        const docRef = doc(db, 'globalChat', 'messages');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Document data:', data);

          setGlobalPlayerChatters(data.messages || []);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching global chatters:', error);
      }
    };
    fetchGlobalChatters();
  }, []);

  const sendMessage = async (message: string, senderId: string) => {
    if (message.trim() === '' || message.length === 1) return; // Prevent sending empty messages

    const messageData = {
      id: new Date().getTime(),
      senderId: senderId,
      message: message,
      name: currentUser?.name,
      avatar: currentUser?.avatar,
      timeStamp: Timestamp.now(),
    };

    try {
      // Reference to the globalChat document
      const docRef = doc(db, 'globalChat', 'messages');
      const docSnap = await getDoc(docRef);

      let messages = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        messages = data.messages || [];
      }
      [...messages, messageData]; // Append the new message to the existing messages array
      // Add the new message
      //   messages.push(messageData);

      // Update the document with the new messages array
      await setDoc(docRef, { messages });
      setTextMessage(''); // Clear the input field after sending the message
      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  console.log(globalPlayerChatters, 'globalPlayerChatters');

  return (
    <div>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        } grid min-[950px]:grid-cols-[300px_auto_400px] max-[950px]:grid-cols-[300px_auto_200px] max-[750px]:grid-cols-[280px_auto_150px] max-[550px]:grid-cols-[250px_auto_0] h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto">
          <div className="flex flex-col gap-4">
            <h1
              className={`${
                currentTheme === 'light' ? 'text-golden' : 'text-white'
              } pt-1 mb-4 px-3 text-[24px]`}
            >
              <Link href="/players">Global Chat</Link>
            </h1>
            <div className="flex flex-col items-start gap-2 "></div>
          </div>
        </div>
        <div className="w-full max-[750px]:w-[90%] max-[600px]:w-[95%] h-full overflow-hidden border-x border-white/40">
          <div className="flex items-center gap-3  border-b border-white/50 w-full py-4 px-2">
            {currentUser?.avatar && (
              <Image
                src={currentUser?.avatar}
                className="w-[50px] h-[50px] rounded-full object-cover object-top border border-white/50 "
                width={50}
                height={50}
                alt="img"
              />
            )}
            <div className="flex flex-col gap-[1px]">
              <p>{currentUser?.name} </p>
            </div>
          </div>
          <div className="py-6 h-[70%] overflow-auto">
            <div className="flex flex-col h-full overflow-auto">
              <div className="flex flex-col h-full gap-3">
                {globalPlayerChatters?.map((res: GlobalChatType, index) => {
                  return (
                    <div className=" py-2 border-b border-white/40" key={res?.id}>
                      <GlobalUserChatField
                        res={res}
                        // playerChats={globalPlayerChatters}
                        // currentUser={currentUser}
                        //   chatUniqueId={chatsId}
                        //   scrollToBtm={scrollToBtm}
                        //   setScrollToBtm={setScrollToBtm}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="relative bg-gray-300 p-4">
            <textarea
              className="flex text-black items-center min-[600px]:h-[100%] max-[600px]:h-[100px] w-full rounded px-2 py-4 pt-2 text-sm placeholder:pt-2 placeholder:pl-2 outline-none border-none "
              placeholder="Type your message and send reactions…"
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  // Allow Shift+Enter for new line
                  e.preventDefault();
                  sendMessage(e.currentTarget.value, currentUser?.userId);
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setTextMessage(e.target.value);
              }}
              value={textMessage}
              maxLength={100}
            />
            <Button
              onClick={() => sendMessage(textMessage, currentUser?.userId)}
              className="absolute top-[25px] right-[30px]"
            >
              Send{' '}
            </Button>
          </div>
        </div>
        <div className="w-full border border-red-400">
          <ProfileHeader />
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
