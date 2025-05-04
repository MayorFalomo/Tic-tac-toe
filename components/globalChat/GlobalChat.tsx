'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import GlobalUserChatField from './GlobalUserChatField';
import { Button } from '../ui/button';
import {
  BattleReplyStatus,
  Chat,
  GlobalChatType,
  NotifType,
  SessionPlayerDetails,
  userDetails,
} from '@/app/types/types';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { Home, Info, Settings } from 'lucide-react';
import { globalChatStyle } from '@/app/animation/constants';
import { IoIosPeople } from 'react-icons/io';
import useOnlineStatus from '@/hooks/useOnlinePresence';
import clsx from 'clsx';
import Nav from '../nav/Nav';

interface IPlayers extends SessionPlayerDetails {
  invited: boolean;
}

const GlobalChat = () => {
  const { currentTheme } = useTheme();

  const [globalPlayerChatters, setGlobalPlayerChatters] = useState<GlobalChatType[]>([]);
  const [textMessage, setTextMessage] = useState<string>('');
  const [scrollToBtm, setScrollToBtm] = useState<boolean>(false);
  const [getPlayerChatters, setGetPlayerChatters] = useState<IPlayers[]>([]);

  const currentUser = useAppSelector((state: RootState) => state.user);
  const online = useOnlineStatus();

  useEffect(() => {
    const docRef = doc(db, 'globalChat', 'messages');
    const unsubscribeChats = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGlobalPlayerChatters(data.messages || []);
        const playerChatters: GlobalChatType[] = data.messages || [];
        const filteredChatters: IPlayers[] = playerChatters
          .filter((item) => item?.senderId !== currentUser?.userId)
          .map((res: GlobalChatType) => {
            return {
              id: res.id,
              name: res.name,
              avatar: res.avatar,
              invited: false,
            };
          });
        setGetPlayerChatters(filteredChatters);
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
          const playerChatters: GlobalChatType[] = data.messages || [];
          const filteredChatters: IPlayers[] = playerChatters
            .filter((res) => res?.senderId !== currentUser?.userId)
            .map((res: GlobalChatType) => {
              return {
                id: res.senderId,
                name: res.name,
                avatar: res.avatar,
                invited: false,
              };
            });
          setGetPlayerChatters(filteredChatters);
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
    if (message.trim() === '' || message.length === 1) return;
    if (senderId === undefined || null) return;

    const invitationData = {
      id: new Date().getTime(),
      senderId: senderId,
      message: message,
      name: currentUser?.name,
      avatar: currentUser?.avatar,
      timeStamp: Timestamp.now(),
    };

    try {
      // Reference to the globalChat document and the messages array
      const docRef = doc(db, 'globalChat', 'messages');
      const docSnap = await getDoc(docRef);

      let messages = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        messages = data.messages || [];
      }

      // Add the new message
      messages.push(invitationData);

      //Then I Update the document with the new messages array
      await setDoc(docRef, { messages });
      setTextMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBattleInvitation = async (inviteeId: string) => {
    if (inviteeId === undefined || null) return;
    if (!currentUser?.userId) return;

    const combinedId =
      currentUser?.userId > inviteeId
        ? currentUser?.userId + inviteeId
        : inviteeId + currentUser?.userId;

    const battleInvitationData = {
      combinedId: combinedId,
      id: new Date().getTime(),
      message: `${currentUser?.name} has invited you to a battle`,
      timeStamp: Timestamp.now(),
      name: currentUser?.name,
      // avatar: currentUser?.avatar,
      type: NotifType.BATTLE,
      answer: BattleReplyStatus.PENDING,
      senderId: currentUser?.userId,
    };

    const playerDocRef = doc(db, 'players', inviteeId);
    const playerDocSnap = await getDoc(playerDocRef);
    if (playerDocSnap.exists()) {
      await updateDoc(playerDocRef, {
        unreadMessages: arrayUnion(battleInvitationData),
      });
    } else {
      console.log('No such document!');
    }

    // Reference to the battleInvitations document
    // const docRef = doc(db, 'battleInvitations', combinedId);
    // const docSnap = await getDoc(docRef);
    // if (docSnap.exists()) {
    //   const data = docSnap.data();
    //   const invitations = data.invitations || [];
    //   invitations.push(battleInvitationData);
    //   await setDoc(docRef, { invitations });

    // } else {
    //   await setDoc(docRef, { invitations: [battleInvitationData] });
    // }
    // console.log('Battle invitation sent successfully!');
  };

  return (
    <div>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        } max-w-[1500px] mx-auto grid min-[1300px]:grid-cols-[380px_auto_360px] min-[950px]:grid-cols-[340px_auto_320px] max-[950px]:grid-cols-[320px_auto_200px] max-[750px]:grid-cols-[280px_auto_150px] max-[550px]:grid-cols-[250px_auto_0] h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto">
          <div className="flex flex-col gap-4">
            <h1
              className={`${
                currentTheme === 'light'
                  ? 'text-golden'
                  : 'text-gradient text-gradient-nebula'
              } pt-1 mb-4 px-3 text-[24px]`}
            >
              <Link href="/">Global Chat</Link>
            </h1>
            <p className=" text-white/40">
              Drop a message so players can find and invite you.{' '}
            </p>
            <div className="flex flex-col items-start gap-4 ">
              {getPlayerChatters?.map((res: SessionPlayerDetails) => {
                return (
                  <div className="flex items-center gap-2 w-full" key={res?.id}>
                    <div className="min-w-[40px] min-h-[40px] w-[40px] h-[40px]">
                      <Image
                        src={res?.avatar || '/defaultAvatar.png'}
                        alt="User Avatar"
                        width={50}
                        height={50}
                        className="w-full h-full object-cover object-top rounded-full"
                      />
                    </div>
                    <div className=" flex items-center justify-between w-full ">
                      <p className="flex justify-between items-center w-full">
                        <span className="font-bold">{res.name}</span>
                      </p>
                      <button
                        onClick={() => handleBattleInvitation(res.id)}
                        className={`text-gradient-neo-plasma py-2 rounded-[4px] w-[100px] text-[12px] font-normal px-[3px]`}
                      >
                        Invite{' '}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className={`w-full max-[750px]:w-[90%] max-[600px]:w-[95%] h-full overflow-hidden border-x border-white/40`}
        >
          <div
            className={`${globalChatStyle} flex items-center gap-3  border-b border-white/50 w-full py-4 px-2`}
          >
            {currentUser?.avatar && (
              <Image
                src={currentUser?.avatar}
                className="w-[50px] h-[50px] rounded-full object-cover object-top border border-white/50 "
                width={50}
                height={50}
                alt="img"
              />
            )}
            <div className="flex flex-col items-center gap-[1px]">
              <p>{currentUser?.name} </p>
              <span className="text-[12px]">{online ? 'online' : ''} </span>
            </div>
          </div>
          <div className="py-3 h-[70%] overflow-auto">
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
          <div className={`relative flex items-center ${globalChatStyle} p-4`}>
            <div className={`bg-white flex items-center w-full px-2 rounded-md`}>
              <textarea
                className="flex text-black items-center min-[600px]:h-[100%] max-[600px]:h-[100px] w-full rounded px-2 py-4 pt-2 text-sm font-normal placeholder:pt-2 placeholder:pl-2 outline-none border-none resize-none "
                placeholder="Send a message..."
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
                className={`${globalChatStyle} text-sm font-normal top-[25px] right-[30px]`}
              >
                Send{' '}
              </Button>
            </div>
          </div>
        </div>
        <Nav />
      </div>
    </div>
  );
};

export default GlobalChat;
