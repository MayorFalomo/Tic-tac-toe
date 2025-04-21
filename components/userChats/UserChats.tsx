'use client';
import { Chat, fullPlayerType } from '@/app/types/types';
import { db } from '@/firebase-config/firebase';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '../Profile/ProfileHeader';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import Image from 'next/image';
import UserChatField from './UserChatField';
import toast from 'react-hot-toast';

type Props = {
  _id: string;
  message: string;
  senderId: string;
};

const UserChats = (props: Props) => {
  const playersChatState = useAppSelector((state: RootState) => state.chatUp);
  const currentUser = useAppSelector((state: RootState) => state.user);

  const [chatsId, setChatsId] = useState<string | null>(null);
  const [allPlayerChat, setAllPlayerChat] = useState<Chat[]>([]);
  const [textMessage, setTextMessage] = useState<string>('');
  const [allPlayerContacts, setAllPlayerContacts] = useState<fullPlayerType[]>([]);
  // const [lastMessage, setLastMessage] = useState([]);

  const { currentTheme } = useTheme();

  const combinedChattersId = useMemo(() => {
    const playerOneId = currentUser?.userId;
    const playerTwoId = playersChatState?.selectedPlayer?.id;
    if (playerOneId && playerTwoId) {
      return playerOneId > playerTwoId
        ? playerOneId + playerTwoId
        : playerTwoId + playerOneId;
    }
  }, [playersChatState?.selectedPlayer?.id, playersChatState.combinedChattingId]);

  // useEffect(() => {
  //   const playersChatRef = collection(db, 'userChats');
  //   const q = query(playersChatRef, where())
  // }, [])
  useEffect(() => {
    if (combinedChattersId) {
      const chatRef = collection(db, 'userChats');
      const q = query(chatRef, where('combinedId', '==', combinedChattersId));

      const unsubscribeChats = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            console.log(doc.data(), 'snap doc data');

            const messages = doc.data().messages || [];
            console.log(messages, 'snapshot messages');

            setAllPlayerChat(messages); // Update state with the latest messages
          }
        });
      });

      return () => {
        unsubscribeChats(); // Unsubscribe when component unmounts
      };
    }
  }, [combinedChattersId]);

  console.log(allPlayerChat, 'allPlayerChatState');

  const loadContacts = async () => {
    const dbRef = collection(db, 'userChats');

    const playerQuery = query(
      dbRef,
      where('participants', 'array-contains', currentUser?.userId)
    );
    const playerQuerySnap = await getDocs(playerQuery);

    if (!playerQuerySnap.empty) {
      const participantsId: Set<string> = new Set();
      playerQuerySnap.forEach((doc) => {
        console.log(doc.data(), 'data');

        doc.data().participants.forEach((participantId: string) => {
          if (participantId !== currentUser?.userId) {
            participantsId.add(participantId); // Add to the set
          }
        });
      });
      const playersData = await fetchPlayersData(Array.from(participantsId));
      setAllPlayerContacts(playersData);

      console.log(playersData, 'playersData');
    }
  };

  const loadChats = async (combinedId: string) => {
    const playerChatDoc = await getDoc(doc(db, 'userChats', combinedId));

    if (playerChatDoc.data()) {
      console.log(playerChatDoc, 'playerChatDoc');
      console.log(playerChatDoc?.data(), 'playerChatDocData');

      // const dbRef = collection(db, 'userChats');
      const playerChat = playerChatDoc.data()?.messages || [];
      console.log(playerChat, 'player');
      if (playerChat) {
        // const chatId = querySnapShot.docs[0].id;
        // console.log(chatId, 'chatId');

        // setChatsId(chatId);
        // const chats: any = [];

        // querySnapShot.forEach((doc) => {
        //   chats.push({ id: doc.id, ...doc.data() });
        // });

        console.log(playerChat, 'load msg chat');

        setAllPlayerChat(playerChat);
      }
    }

    // const q = query(dbRef, where('combinedId', '==', combinedId)); //Get the exact chat between those two people

    // const querySnapShot = await getDocs(q);
    else {
      await createChatSession();
    }
  };

  const fetchPlayersData = async (participantIds: any) => {
    const playersRef = collection(db, 'players');
    const playersQuery = query(playersRef, where('id', 'in', participantIds));

    const playerDocs = await getDocs(playersQuery);
    const playersArray = playerDocs.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '',
      avatar: doc.data().avatar || '',
      networkState: doc.data().networkState || 'offline',
      status: doc.data().status || '',
      // Add other required properties with default values if missing
      ...doc.data(),
    }));
    console.log(playersArray, 'playersArraY');

    return playersArray;
  };

  const createChatSession = async () => {
    // const chatRef = collection(db, 'userChats');
    const messageObj = {
      combinedId: combinedChattersId,
      messages: [],
      timestamp: new Date(),
      participants: [currentUser?.userId, playersChatState?.selectedPlayer?.id],
      namesOfParticipants: [currentUser?.name, playersChatState?.selectedPlayer?.name],
    };
    if (combinedChattersId) {
      await setDoc(doc(db, 'userChats', combinedChattersId), messageObj);
    } else {
      console.error('combinedChattersId is undefined');
    }
    // await addDoc(chatRef, {
    //   combinedId: combinedChattersId,
    //   messages: [],
    //   timestamp: new Date(),
    //   participants: [currentUser?.userId, playersChatState?.selectedPlayer?.id],
    //   namesOfParticipants: [currentUser?.name, playersChatState?.selectedPlayer?.name],
    // });
  };

  useEffect(() => {
    if (currentUser?.userId) {
      loadContacts();
      if (combinedChattersId) {
        loadChats(combinedChattersId);
      }
    } else {
      toast('You need to be logged in first');
    }
  }, [currentUser?.userId, combinedChattersId]);

  const sendMessage = async (message: string, senderId: string) => {
    if (message.length > 1) {
      // Generate a unique message ID (could be a timestamp or UUID)
      const messageId = new Date().getTime();

      const chatRef = collection(db, 'userChats');
      const q = query(chatRef, where('combinedId', '==', combinedChattersId));

      const chatDoc = await getDocs(q);

      if (!chatDoc.empty) {
        const chatId = chatDoc.docs[0].id;
        console.log(chatId, 'chatId');

        const chatDocumentRef = doc(db, 'userChats', chatId);
        // const chatData = chatDoc.docs[0].data();
        console.log(chatDocumentRef, 'doc Ref');

        // Update the messages array in the document
        await updateDoc(chatDocumentRef, {
          messages: arrayUnion({
            _id: messageId,
            senderId: currentUser?.userId,
            message,
            timeStamp: Timestamp.now(),
            reactions: [],
          }),
        });

        // Fetch the current user's player document to update unreadMessages
        const playerDocRef = doc(db, 'players', playersChatState?.selectedPlayer?.id);
        const playerDoc = await getDoc(playerDocRef);

        if (playerDoc.exists()) {
          const unreadMessages = playerDoc.data().unreadMessages || [];

          // Add the new message to the unreadMessages array
          await updateDoc(playerDocRef, {
            unreadMessages: arrayUnion({
              _id: messageId,
              senderId: currentUser?.userId,
              message,
              // timeStamp: Timestamp.now(),
            }),
          });
          console.log(unreadMessages, 'unread');
        }
        setTextMessage('');
      } else {
        console.log('No chat session found to send the message.');
      }
    }
  };

  console.log(allPlayerChat, 'playersChat');

  return (
    <div>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        }border border-red-500 min-h-full grid grid-cols-[400px_auto] max-[950px]:grid-cols-[270px_auto] max-[900px]:grid-cols-[270px_auto_0] max-[600px]:grid-cols-[230px_auto_0] max-[550px]:flex max-[550px]:flex-col-reverse h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto">
          <h1
            className={`${
              currentTheme === 'light' ? 'text-golden' : 'text-white'
            } pt-1 mb-4 px-3 text-[24px]`}
          >
            <Link href="/">Your Chats</Link>
          </h1>

          <div className="flex flex-col gap-4">
            {allPlayerContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 mb-4">
                <div className="w-[40px] h-[40px] border border-white/50 rounded-full overflow-hidden">
                  <Image
                    src={contact?.avatar! ?? ''}
                    width={40}
                    height={40}
                    alt="avatar"
                  />
                </div>
                <div className="flex flex-col leading-5">
                  <h3>{contact?.name} </h3>
                  <p>
                    {contact.unreadMessages?.map((res: Props, index: number) => (
                      <span className="text-[10px] text-white/40" key={index}>
                        {res?.senderId === contact?.id ? res?.message : ''}
                      </span>
                    ))}{' '}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-x border-white/40 w-[70%] h-full overflow-hidden">
          <div className=" border-b border-white/50 w-full flex items-center gap-3 py-4 px-2">
            <Image
              src={playersChatState?.selectedPlayer?.avatar}
              className="w-[50px] h-[50px] rounded-full object-cover object-top "
              width={50}
              height={50}
              alt="img"
            />
            <p>{playersChatState?.selectedPlayer?.name} </p>
          </div>
          <div className="py-6 h-[70%] overflow-auto">
            <div className="flex flex-col h-full overflow-auto">
              {allPlayerChat?.length > 0 ? (
                allPlayerChat.map((res: Chat) => (
                  <div key={res._id}>
                    <UserChatField
                      res={res}
                      combinedId={playersChatState?.combinedChattingId}
                      playerChats={allPlayerChat}
                      chatUniqueId={chatsId}
                    />
                  </div>
                ))
              ) : (
                <div className="h-[100%] flex flex-col items-center justify-center">
                  <p className="text-white">
                    Start conversation with {playersChatState?.selectedPlayer?.name}{' '}
                  </p>{' '}
                  <p className="text-gray-500">Enter your message below. </p>
                  <p className="mt-3 text-center">
                    Click on a message to send reactions 🤪
                  </p>
                </div>
              )}
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
                  sendMessage(
                    e.currentTarget.value,
                    playersChatState?.selectedPlayer?.id
                  );
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setTextMessage(e.target.value);
              }}
              value={textMessage}
              maxLength={100}
            />
            <Button
              onClick={() =>
                sendMessage(textMessage, playersChatState?.selectedPlayer?.id)
              }
              className="absolute top-[20px] right-[30px]"
            >
              Send{' '}
            </Button>
          </div>
          {/* <div>
            <textarea
              placeholder={`Say hello to ${playersChatState?.selectedPlayer?.name} `}
              className="w-full h-[85px] px-3 py-3 "
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserChats;
