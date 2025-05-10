'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import GlobalUserChatField from './GlobalUserChatField';
import { Button } from '../ui/button';
import {
  BattleReplyStatus,
  firebaseCollections,
  GameSession,
  GlobalChatType,
  NotifType,
  PlayerDetails,
  PlayerStatus,
  SessionPlayerDetails,
} from '@/app/types/types';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { X } from 'lucide-react';
import { FadeVariants, globalChatStyle } from '@/app/animation/constants';
import useOnlineStatus from '@/hooks/useOnlinePresence';
import Nav from '../nav/Nav';
import { Spinner } from '../ui/Spinner';
import { createGameSession } from '../funcs/HandleAuth';
import toast from 'react-hot-toast';
import {
  setCombinedGameSessionId,
  setPlayersSessionId,
  setSessionId,
} from '@/lib/features/TrackerSlice';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import { useRouter } from 'next/navigation';
import { groupChattersByTime } from '@/app/utils/groupByTime';
import { Skeleton } from '../ui/skeleton';
import { IoIosArrowRoundBack } from 'react-icons/io';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface IPlayers extends SessionPlayerDetails {
  invited: boolean;
}

const GlobalChat = () => {
  const { currentTheme } = useTheme();

  const [globalPlayerChatters, setGlobalPlayerChatters] = useState<GlobalChatType[]>([]);
  const [textMessage, setTextMessage] = useState<string>('');
  const [scrollToBtm, setScrollToBtm] = useState<boolean>(false);
  const [getPlayerChatters, setGetPlayerChatters] = useState<IPlayers[]>([]);
  const [loadingSpinner, setLoadingSpinner] = useState<string | null>(null);
  const [storedId, setStoredId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [storeChatId, setStoreChatId] = useState<string | null>(null);

  const currentUser = useAppSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const online = useOnlineStatus();

  const router = useRouter();

  useEffect(() => {
    const docRef = doc(db, 'globalChat', 'messages');
    const unsubscribeChats = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGlobalPlayerChatters(data.messages || []);
        const playerChatters: GlobalChatType[] = data.messages || [];
        const seen = new Set();
        const filteredChatters: IPlayers[] = playerChatters
          // .filter((item) => item?.senderId !== currentUser?.userId)
          .map((res: GlobalChatType) => {
            return {
              id: res.id,
              name: res.name,
              avatar: res.avatar,
              invited: false,
            };
          })
          .filter((player) => {
            if (seen.has(player?.id)) return false;
            seen.add(player?.id);
            return true;
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

          setGlobalPlayerChatters(data.messages || []);
          const playerChatters: GlobalChatType[] = data.messages || [];

          const seen = new Set();
          //Now I ensure that I don't get the currentUser in the array and also multiple users of with the same ID
          const filteredChatters: IPlayers[] = playerChatters
            // .filter((res) => res?.senderId !== currentUser?.userId)
            .map((res) => ({
              id: res.senderId,
              name: res.name,
              avatar: res.avatar,
              invited: false,
            }))
            .filter((player) => {
              if (seen.has(player.id)) return false;
              seen.add(player.id);
              return true;
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

  const handleSendBattleInvitation = async (inviteeId: string) => {
    if (inviteeId === undefined || null) return;
    if (!currentUser?.userId) return;

    try {
      setLoadingSpinner('start');

      const combinedId =
        currentUser?.userId > inviteeId
          ? currentUser?.userId + inviteeId
          : inviteeId + currentUser?.userId;

      const inviteObj = {
        id: new Date().getTime(),
        combinedId: combinedId,
        senderId: currentUser?.userId,
        timeStamp: Timestamp.now(),
        type: NotifType.BATTLE,
        answer: BattleReplyStatus.PENDING,
        name: currentUser?.name,
        avatar: currentUser?.avatar,
      };

      await setDoc(doc(db, 'battleInvitations', combinedId), inviteObj);

      const battleInvitationObj = {
        combinedId: combinedId,
        id: new Date().getTime(),
        message: `${currentUser?.name} has invited you to a battle`,
        timeStamp: Timestamp.now(),
        name: currentUser?.name,
        type: NotifType.BATTLE,
        answer: BattleReplyStatus.PENDING,
        senderId: currentUser?.userId,
      };

      const playerDocRef = doc(db, 'players', inviteeId);
      const playerDocSnap = await getDoc(playerDocRef);
      if (playerDocSnap.exists()) {
        await updateDoc(playerDocRef, {
          unreadMessages: arrayUnion(battleInvitationObj),
        });

        const playerRef = collection(db, 'battleInvitations');
        const playerQuery = query(
          playerRef,
          where('combinedId', '==', combinedId),
          where('answer', '==', BattleReplyStatus.ACCEPT)
        );
        const timeOut = setTimeout(() => {
          setLoadingSpinner(null);
          setStoredId(null);
          toast('Player did not respond on time.');
          unsubscribe();
          return;
        }, 60 * 1000); // 60 seconds

        const unsubscribe = onSnapshot(playerQuery, (snapshot) => {
          snapshot.forEach(async (doc) => {
            const data = doc.data();

            if (data.answer === BattleReplyStatus.ACCEPT) {
              clearTimeout(timeOut);
              const getOponentDetails = playerDocSnap.data();

              toast(`${getOponentDetails.name} has accepted your invitation`);

              const playerOneDetails = {
                id: currentUser?.userId,
                name: currentUser?.name,
                avatar: currentUser?.avatar!,
                networkState: online ? PlayerStatus.ONLINE : PlayerStatus.OFFLINE,
              };

              const playerTwoDetails = {
                id: getOponentDetails.id,
                name: getOponentDetails.name,
                avatar: getOponentDetails.avatar,
                networkState: getOponentDetails.networkState,
              };
              const randomControl = Math.random() > 0.5 ? true : false; //So I can randomize the gameplay turns

              const getSessionId = await createGameSession(
                currentUser?.userId,
                getOponentDetails.id,
                randomControl
              );

              dispatch(setSessionId(getSessionId)); // Store the current game session ID
              await handleGameSession(
                combinedId,
                playerOneDetails,
                playerTwoDetails,
                randomControl
              );
              await updateDoc(doc.ref, { status: PlayerStatus.INGAME });

              setLoadingSpinner('end');
              setTimeout(() => {
                setLoadingSpinner(null);
                router.push('/battle');
              }, 2000);
            } else if (data.answer === BattleReplyStatus.DECLINE) {
              setLoadingSpinner(null);
              toast('Player has declined your Invitation');
              setStoreChatId(null);
              setStoredId(null);
              return;
            }
          });
        });
        return () => {
          clearTimeout(timeOut);
          unsubscribe();
        };
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.log('An error has occurred', error);
    }
  };

  const handleGameSession = async (
    combinedId: string,
    playerOneDetails: PlayerDetails,
    opponent: PlayerDetails,
    randomControl: boolean
  ) => {
    try {
      const sessionDoc = await getDoc(
        doc(db, firebaseCollections.GAMESESSIONS, combinedId)
      );
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const playerOne = {
          id: playerOneDetails?.id,
          name: playerOneDetails?.name,
          avatar: playerOneDetails?.avatar,
          networkState: PlayerStatus.ONLINE,
        };
        const playerTwo = {
          id: opponent?.id,
          name: opponent?.name,
          avatar: opponent?.avatar,
          networkState: opponent?.networkState,
        };

        dispatch(
          givePlayerNames({
            playerOne: playerOne,
            playerTwo: playerTwo,
          })
        );
        dispatch(setCombinedGameSessionId(combinedId));
        return sessionData;
      } else {
        const newGameSession: GameSession = {
          sessionId: combinedId,
          currentTurn: randomControl ? playerOneDetails.id : opponent.id,
          firstPlayer: randomControl ? playerOneDetails.id : opponent.id,
          unChangeableFirstPlayer: randomControl ? playerOneDetails.id : opponent.id,
          rounds: 1,
          createdAt: new Date().toISOString(),
          scores: {
            playerOne: 0,
            playerTwo: 0,
          },
          roundWinner: '',
          endOfRound: false,
          trackRoundPlayer: randomControl ? playerOneDetails.id : opponent.id,
          winningCombination: [],
          quitGame: false,
          goToNextRound: true,
          draw: false,
          players: {
            playerOne: {
              id: playerOneDetails?.id,
              name: playerOneDetails?.name,
              avatar: playerOneDetails?.avatar!,
            },
            playerTwo: {
              id: opponent.id,
              name: opponent.name,
              avatar: opponent.avatar!,
            },
          },
          unreadMessages: {
            playerOne: 0,
            playerTwo: 0,
          },
          trackPlayersOnlineStatus: {
            playerOne: playerOneDetails?.networkState,
            playerTwo: opponent?.networkState,
          },
        };
        await setDoc(
          doc(db, firebaseCollections.GAMESESSIONS, combinedId),
          newGameSession
        );
        setPlayersSessionId(doc(db, 'gameSessions', combinedId));
        const playerOneDets = {
          id: playerOneDetails?.id,
          name: playerOneDetails?.name,
          avatar: playerOneDetails?.avatar,
        };

        const playerTwoDets = {
          id: opponent?.id,
          name: opponent?.name,
          avatar: opponent?.avatar,
        };

        dispatch(
          givePlayerNames({
            playerOne: playerOneDets,
            playerTwo: playerTwoDets,
          })
        );

        dispatch(setCombinedGameSessionId(combinedId));
        return newGameSession; //Return the created gameSession
      }
    } catch (error) {
      console.error('Error creating game session:', error);
    }
  };

  const groupedChatters = groupChattersByTime(
    globalPlayerChatters ? globalPlayerChatters : []
  );

  return (
    <div>
      <div
        className={`${
          currentTheme === 'light' ? 'bg-royalGreen text-white' : 'bg-black text-white'
        } relative max-w-[1500px] mx-auto grid min-[1300px]:grid-cols-[380px_auto_360px] max-[1300px]:grid-cols-[350px_auto_330px] max-[1100px]:grid-cols-[310px_auto_300px] max-[1020px]:grid-cols-[290px_auto_270px] max-[920px]:grid-cols-[320px_auto_100px] max-[820px]:grid-cols-[270px_auto_100px] max-[750px]:grid-cols-[250px_auto_0] max-[620px]:grid-cols-[auto] h-screen overflow-hidden w-full text-white`}
      >
        <div className="h-full w-full border-r border-white/40 p-4 pb-[50px] overflow-auto max-[620px]:hidden">
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
              Drop a message so other players can find and invite you.{' '}
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
                        onClick={() => {
                          setStoredId(res.id);
                          handleSendBattleInvitation(res.id);
                        }}
                        className={clsx(
                          currentUser?.userId === res?.id &&
                            ' cursor-not-allowed disabled:opacity-60',
                          `text-gradient-neo-plasma flex items-center justify-center gap-1 py-2 rounded-[4px] w-[100px] text-[12px] font-normal px-[3px]`
                        )}
                        disabled={res?.id === currentUser?.userId}
                      >
                        Invite{' '}
                        {loadingSpinner && res.id === storedId && (
                          <Spinner size={'small'} className="text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className={`w-full max-[750px]:w-[100%] h-full overflow-hidden min-[620px]:border-x border-white/40`}
        >
          <div
            className={`${globalChatStyle} flex items-center justify-between  border-t-0 border-x-0 border-b border-white/50 `}
          >
            <div className={`flex items-center gap-3 w-full py-4 px-2`}>
              <Link href={'/'}>
                <IoIosArrowRoundBack className=" cursor-pointer" size={24} />
              </Link>
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
            {navOpen ? (
              <motion.button
                onClick={() => setNavOpen(false)}
                className="flex flex-col gap-[7px] mx-6 cursor-pointer"
                variants={FadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <X />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setNavOpen(true)}
                className="min-[620px]:hidden max-[620px]:flex flex flex-col gap-[7px] mx-6 cursor-pointer"
                variants={FadeVariants}
                animate="visible"
                exit="exit"
              >
                <span className="bg-white h-0.5 w-8"></span>
                <span className="bg-white h-0.5 w-8"></span>
              </motion.button>
            )}
          </div>

          <div className="py-3 h-[70%] overflow-auto">
            <div className="flex flex-col h-full overflow-auto">
              <div className="flex flex-col h-full gap-3">
                {Object.keys(groupedChatters)?.length > 0 ? (
                  Object.keys(groupedChatters)?.map((key, index) => (
                    <React.Fragment key={key || index}>
                      <h3 className="flex justify-center bg-white/30 text-white w-fit mx-auto rounded-[20px] text-[14px] my-4 px-4 py-1">
                        {key}
                      </h3>
                      {groupedChatters[key]?.map((res, index) => (
                        <React.Fragment key={res.id}>
                          <GlobalUserChatField
                            res={res}
                            currentUserId={currentUser?.userId}
                            handleInvite={(id) => {
                              handleSendBattleInvitation(id);
                            }}
                            storeChatId={storeChatId}
                            setStoreChatId={setStoreChatId}
                            loadingSpinner={loadingSpinner}
                          />
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="flex flex-col items-center space-x-4">
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-full bg-white" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`relative flex items-center ${globalChatStyle} p-4`}>
            <div className={`bg-white flex items-center w-full mb-3 px-2 rounded-md`}>
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
        {<Nav navPresent={true} navOpen={navOpen} />}
      </div>
    </div>
  );
};

export default GlobalChat;
