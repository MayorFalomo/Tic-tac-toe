'use client';
import {
  Chat,
  defaultImg,
  PlayerChatType,
  PlayerDetails,
  Unread,
} from '@/app/types/types';
import { db } from '@/firebase-config/firebase';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import {
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
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';
import UserChatField from './UserChatField';
import toast from 'react-hot-toast';
// import { setCombinedChattingId } from '@/lib/features/ChatAPlayerSlice';
import useTypingIndicator from '@/hooks/useTypingIndicator';
import { motion } from 'framer-motion';
import { formatTimestamp } from '@/app/utils/date';

const UserChats = () => {
  const playersChatState = useAppSelector((state: RootState) => state.chatUp);
  const currentUser = useAppSelector((state: RootState) => state.user);

  const [chatsId, setChatsId] = useState<string | null>(null);
  // const [allPlayerChat, setAllPlayerChat] = useState<Chat[]>([]);
  const [textMessage, setTextMessage] = useState<string>('');
  const [allPlayerContacts, setAllPlayerContacts] = useState<PlayerDetails[]>([]);
  const [trackChatters, setTrackChatters] = useState<PlayerChatType>();
  const [newWay, setNewWay] = useState<PlayerChatType[]>([]);
  const [scrollToBtm, setScrollToBtm] = useState<boolean>(false);
  const [getOpponentId, setGetOpponentId] = useState<string | null>(null);
  const [getSelectedChatCombinedId, setGetSelectedChatCombinedId] = useState<
    string | null
  >(null);
  const [getSelectedChat, setGetSelectedChat] = useState<PlayerDetails[]>([]);

  const { currentTheme } = useTheme();

  const combinedChattersId = useMemo(() => {
    if (!playersChatState?.combinedChattingId) {
      const playerOneId = currentUser?.userId;
      const playerTwoId = playersChatState?.selectedPlayer?.id;
      if (playerOneId && playerTwoId) {
        return playerOneId > playerTwoId
          ? playerOneId + playerTwoId
          : playerTwoId + playerOneId;
      }
    } else {
      console.log('Already computed combinedId');
      return playersChatState?.combinedChattingId;
    }
  }, [playersChatState?.selectedPlayer?.id, playersChatState.combinedChattingId]);

  const { handleTyping } = useTypingIndicator(
    getSelectedChatCombinedId ?? combinedChattersId!
  );

  //useEffect to listen for new players
  useEffect(() => {
    if (combinedChattersId) {
      const playersRef = collection(db, 'userChats');
      const playersQuery = query(
        playersRef,
        where('participants', 'array-contains', currentUser?.userId)
      );

      const unsubscribeChats = onSnapshot(playersQuery, (snapshot) => {
        const updatedChats: PlayerChatType[] = [];

        snapshot.forEach((doc) => {
          if (doc.exists()) {
            const playersArray: PlayerChatType = doc.data() as PlayerChatType;
            updatedChats.push(playersArray);
          }
        });

        // Update state with all chat documents
        setNewWay(updatedChats);
      });

      return () => {
        unsubscribeChats(); // Unsubscribe when component unmounts
      };
    }
  }, [combinedChattersId, currentUser?.userId, getSelectedChatCombinedId]);

  useEffect(() => {
    if (combinedChattersId) {
      const chatRef = collection(db, 'userChats');
      const q = query(
        chatRef,
        where('combinedId', '==', getSelectedChatCombinedId ?? combinedChattersId)
      );

      const unsubscribeChats = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            setTrackChatters(doc.data() as PlayerChatType);
          }
        });
      });

      return () => {
        unsubscribeChats(); // Unsubscribe when component unmounts
      };
    }
  }, [combinedChattersId, getSelectedChatCombinedId]);

  const loadChats = async (combinedId: string) => {
    const playersRef = collection(db, 'userChats');
    //First query to get all your chats
    const playersQuery = query(
      playersRef,
      where('participants', 'array-contains', currentUser?.userId)
    );

    //Query to get a selectedChat
    const queryForCombined = query(playersRef, where('combinedId', '==', combinedId));

    const playerDocs = await getDocs(playersQuery);
    const queryForCombinedSnap = await getDocs(queryForCombined);

    // console.log(queryForCombinedSnap, 'queryCombinedSnap');

    //! Check for if a chat does not exist between the players before.
    if (!queryForCombinedSnap.empty) {
      const playerDocID = queryForCombinedSnap.docs[0]?.id;
      setChatsId(playerDocID);
      const playerDoc = await getDoc(doc(db, 'userChats', combinedId));
      const playerChat = playerDoc?.data() as PlayerChatType;
      // console.log(playerChat, 'playerChat first');

      if (playerChat) {
        setTrackChatters(playerChat);
        setGetOpponentId(
          currentUser?.userId === playerChat?.participantsObject[0]?.id
            ? playerChat?.participantsObject[1]?.id
            : playerChat?.participantsObject[0]?.id
        ); //Gets me the id of the opponent for later use
      }
    } else {
      await createChatSession();
    }
    const playersArray: PlayerChatType[] = playerDocs.docs.map(
      (doc) => doc.data() as PlayerChatType
    );
    // const playerChat = playerDoc?.data()?.messages || [];
    // console.log(playersArray, 'playersArray for contacts');

    if (playersArray.length > 0) {
      const newContactWay = playersArray?.map((res) => res);
      setNewWay(newContactWay);
    } else {
      console.log('No chat found for this user');
      setAllPlayerContacts([]);
      // await createChatSession();
    }
  };

  const createChatSession = async () => {
    const messageObj = {
      combinedId: combinedChattersId,
      messages: [],
      timestamp: new Date(),
      participants: [currentUser?.userId, playersChatState?.selectedPlayer?.id],
      participantsObject: [
        {
          id: currentUser?.userId,
          name: currentUser?.name,
          avatar: currentUser?.avatar,
          networkState: currentUser?.networkState,
        },
        {
          id: playersChatState?.selectedPlayer?.id,
          name: playersChatState?.selectedPlayer?.name,
          avatar: playersChatState?.selectedPlayer?.avatar,
          status: playersChatState?.selectedPlayer?.networkState ?? false,
        },
      ],
      lastMessage: '',
      lastMessageTimeStamp: '',
      playerOneUnread: 0,
      playerTwoUnread: 0,
      typing: false,
    };
    if (combinedChattersId) {
      await setDoc(doc(db, 'userChats', combinedChattersId), messageObj);
    } else {
      console.error('combinedChattersId is undefined');
    }
  };

  useEffect(() => {
    if (currentUser?.userId) {
      if (combinedChattersId) {
        loadChats(combinedChattersId);
      }
    } else {
      toast('You need to be logged in first');
    }
  }, [currentUser?.userId, combinedChattersId]);

  const sendMessage = async (message: string, selectedPlayerId: string) => {
    if (message.length > 1) {
      // Generate a unique message ID (could be a timestamp or UUID)
      const messageId = new Date().getTime();

      const chatRef = collection(db, 'userChats');

      const q = query(
        chatRef,
        where(
          'combinedId',
          '==',
          getSelectedChatCombinedId!?.length > 0
            ? getSelectedChatCombinedId
            : combinedChattersId
        )
      );

      const chatDoc = await getDocs(q);

      if (!chatDoc.empty) {
        const chatId = chatDoc.docs[0].id;
        // console.log(chatId, 'chatId');

        const chatDocumentRef = doc(db, 'userChats', chatId);
        const chatData = chatDoc.docs[0].data();
        // console.log(chatData, 'doc Ref');

        // Update the messages array in the document
        await updateDoc(chatDocumentRef, {
          messages: arrayUnion({
            _id: messageId,
            senderId: currentUser?.userId,
            receiverId: getSelectedChat[0]?.id ?? selectedPlayerId,
            message: message,
            timeStamp: Timestamp.now(),
            reactions: [],
          }),
        });

        const playerOneId = currentUser?.userId;
        const playerTwoId = getSelectedChat[0]?.id ?? selectedPlayerId;

        //update the lastMessage field for the selected user in the userChats document
        await updateDoc(chatDocumentRef, {
          lastMessage: message, // Update the top-level lastMessage,
          lastMessageTimeStamp: Timestamp.now(), // Update the top-level lastMessageTimeStamp
          playerOneUnread:
            playerOneId + playerTwoId === getSelectedChatCombinedId || combinedChattersId
              ? chatData?.playerOneUnread + 1
              : 0,
          playerTwoUnread:
            playerTwoId + playerOneId === getSelectedChatCombinedId || combinedChattersId
              ? chatData?.playerTwoUnread + 1
              : 0,
          typing: false,
        });

        //! Get the selected player document to update unreadMessages
        const playerDocRef = doc(
          db,
          'players',
          getSelectedChat[0]?.id ?? selectedPlayerId
        );
        const playerDoc = await getDoc(playerDocRef);

        if (playerDoc.exists()) {
          // const unreadMessages = playerDoc.data()?.unreadMessages || {};

          // Update the unreadMessages in the player's document
          await updateDoc(playerDocRef, {
            unreadMessages: arrayUnion({
              combinedId: getSelectedChatCombinedId ?? combinedChattersId,
              id: messageId,
              message: `${currentUser?.name} sent you a message`,
              timeStamp: Timestamp.now(),
              name: currentUser?.name,
              avatar: currentUser?.avatar,
              type: 'message',
            }),
          });

          // console.log(unreadMessages, 'unread');
        } else {
          console.log('Player document does not exist.');
        }
        setTextMessage('');
        setScrollToBtm(true);
      } else {
        console.log('No chat session found to send the message.');
      }
    }
  };

  const getFilteredParticipants = (participantsObject: PlayerDetails[]) => {
    return participantsObject.filter(
      (participant) => participant.id !== currentUser?.userId
    );
  };

  //Function to load the chat messages for the selected chat
  const handleChatSelect = async (chat: PlayerChatType) => {
    // dispatch(setCombinedChattingId(chat?.combinedId));

    setGetSelectedChatCombinedId(chat?.combinedId); //a state to store the selectedChat combinedId

    const getSelectedChat = chat?.participantsObject.filter(
      (res) => res.id !== currentUser?.userId
    );

    setGetSelectedChat(getSelectedChat);
    const filter = newWay?.filter((item) => item?.combinedId === chat?.combinedId);
    setTrackChatters(filter[0]);

    //Find the id of the selected player
    const oppID = filter[0]?.participants?.filter((res) => res !== currentUser?.userId);

    const playerOneId = currentUser?.userId;
    const playerTwoId = oppID[0] ?? getOpponentId;

    const chatRef = collection(db, 'userChats');

    const q = query(chatRef, where('combinedId', '==', combinedChattersId));

    const chatDoc = await getDocs(q);

    if (!chatDoc.empty) {
      const chatId = chatDoc.docs[0].id;

      const chatDocumentRef = doc(db, 'userChats', chatId);

      if (playerOneId + playerTwoId === getSelectedChatCombinedId || combinedChattersId) {
        await updateDoc(chatDocumentRef, {
          playerOneUnread: 0,
        });
      }
      if (playerTwoId + playerOneId === getSelectedChatCombinedId || combinedChattersId) {
        await updateDoc(chatDocumentRef, {
          playerTwoUnread: 0,
        });
      }
    }
    const playerDocRef = doc(db, 'players', playerOneId);
    const playerDoc = await getDoc(playerDocRef);

    if (playerDoc.exists()) {
      const unreadMessages: Unread[] = playerDoc.data()?.unreadMessages || {};

      //Find the specific message in the unreadMessages array and remove it
      const updatedUnreadMessages = unreadMessages.filter(
        (message: Unread) => message.name !== currentUser?.name
        // message.id !== playersChatState?.selectedPlayer?.id
      );

      // Update the unreadMessages in the player's document
      await updateDoc(playerDocRef, {
        unreadMessages: updatedUnreadMessages,
      });
    }
  };

  return (
    <div>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        } min-h-full grid grid-cols-[400px_auto_200px] max-[950px]:grid-cols-[300px_auto_200px] max-[750px]:grid-cols-[280px_auto_150px] max-[550px]:grid-cols-[250px_auto_0] h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto">
          <div className="flex flex-col gap-4">
            <h1
              className={`${
                currentTheme === 'light' ? 'text-golden' : 'text-white'
              } pt-1 mb-4 px-3 text-[24px]`}
            >
              <Link href="/players">Your Chats</Link>
            </h1>
            <div className="flex flex-col items-start gap-2 ">
              {newWay?.length > 0 ? (
                newWay.map((chat) => {
                  const filtered = getFilteredParticipants(chat.participantsObject);
                  return (
                    <div
                      className="w-full py-1 border border-b-white/40 border-x-0 border-t-0 "
                      key={chat?.combinedId}
                      onClick={() => handleChatSelect(chat)}
                    >
                      {filtered?.map((contact) => (
                        <div
                          key={contact?.id}
                          className="flex items-center gap-3 cursor-pointer mb-4"
                        >
                          <div className="w-[40px] h-[40px] border border-white/50 rounded-full overflow-hidden">
                            <Image
                              src={contact?.avatar ?? defaultImg} // Or src={contact?.avatar ?? ''}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover object-top"
                              alt={contact?.name ?? 'User Avatar'} // Better alt text
                            />
                          </div>
                          <div className="flex flex-col leading-5 w-full">
                            <div className="flex items-center justify-between gap-2 w-full">
                              <h3>{contact?.name ?? 'Unknown User'}</h3>
                              <p className="text-[12px] text-white/40">
                                {chat?.lastMessageTimeStamp
                                  ? formatTimestamp(chat?.lastMessageTimeStamp!)
                                  : ''}{' '}
                              </p>
                            </div>
                            <div className="flex items-center justify-between w-full">
                              {chat?.combinedId === combinedChattersId &&
                              textMessage?.length < 1 &&
                              trackChatters?.typing ? (
                                <motion.span className="text-[10px]">
                                  typing...
                                </motion.span>
                              ) : (
                                <motion.span className="text-[10px] text-white">
                                  {chat?.lastMessage!.slice(0, 25) || '...'}
                                </motion.span>
                              )}
                              <motion.p>
                                {chat?.participants
                                  ?.filter((res) => res !== currentUser?.userId)
                                  ?.map((res) => {
                                    return (
                                      <span
                                        key={res}
                                        className={`${
                                          res === currentUser?.userId
                                            ? chat?.playerOneUnread === 0
                                              ? ''
                                              : 'bg-blue-500 rounded-full w-[20px] h-[20px]'
                                            : chat?.playerTwoUnread === 0
                                            ? ''
                                            : 'bg-red-500 rounded-full w-[20px] h-[20px]'
                                        }  place-content-center flex justify-center items-center p-0.5 text-[10px]`}
                                      >
                                        {res === currentUser?.userId
                                          ? chat?.playerOneUnread === 0
                                            ? ''
                                            : chat?.playerOneUnread
                                          : chat?.playerTwoUnread === 0
                                          ? ''
                                          : chat?.playerTwoUnread}{' '}
                                      </span>
                                    );
                                  })}
                              </motion.p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div>
                  <p>You don&apos;t have any chats yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[70%] max-[750px]:w-[90%] max-[600px]:w-[95%] h-full overflow-hidden border-x border-white/40">
          <div className="flex items-center gap-3  border-b border-white/50 w-full py-4 px-2">
            {playersChatState?.selectedPlayer?.avatar && (
              <Image
                src={playersChatState?.selectedPlayer?.avatar}
                className="w-[50px] h-[50px] rounded-full object-cover object-top border border-white/50 "
                width={50}
                height={50}
                alt="img"
              />
            )}
            <div className="flex flex-col gap-[1px]">
              <p>
                {trackChatters?.participantsObject[0]?.id === currentUser?.userId
                  ? trackChatters?.participantsObject[1]?.name
                  : trackChatters?.participantsObject[0]?.name}{' '}
              </p>
              <p className="text-[12px] text-white">
                {textMessage?.length < 2 && trackChatters?.typing ? (
                  <span>typing...</span>
                ) : (
                  ''
                )}
              </p>
            </div>
          </div>
          <div className="py-6 h-[70%] overflow-auto">
            <div className="flex flex-col h-full overflow-auto">
              <div className="flex flex-col h-full gap-3">
                {trackChatters?.messages!?.length > 0 ? (
                  trackChatters?.messages?.map((res: Chat, index) => {
                    return (
                      <div key={res?._id}>
                        <UserChatField
                          res={res}
                          combinedId={combinedChattersId!}
                          playerChats={trackChatters?.messages}
                          chatUniqueId={chatsId}
                          scrollToBtm={scrollToBtm}
                          setScrollToBtm={setScrollToBtm}
                        />
                      </div>
                    );
                  })
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
                    playersChatState?.selectedPlayer?.id.length < 1
                      ? getOpponentId!
                      : playersChatState?.selectedPlayer?.id
                  );
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setTextMessage(e.target.value);
                handleTyping();
              }}
              value={textMessage}
              maxLength={100}
            />
            <Button
              onClick={() =>
                sendMessage(
                  textMessage,
                  playersChatState?.selectedPlayer?.id.length < 1
                    ? getOpponentId!
                    : playersChatState?.selectedPlayer?.id
                )
              }
              className="absolute top-[20px] right-[30px]"
            >
              Send{' '}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChats;
