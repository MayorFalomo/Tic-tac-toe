import {
  battleInvitationType,
  BattleReplyStatus,
  firebaseCollections,
  GameSession,
  NotifType,
  PlayerDetails,
  PlayerStatus,
  Unread,
} from '@/app/types/types';
import { formatTimeToNow } from '@/app/utils/date';
import { db } from '@/firebase-config/firebase';
import {
  setCombinedChattingId,
  setSelectedPlayer,
} from '@/lib/features/ChatAPlayerSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';
import { createGameSession } from '../funcs/HandleAuth';
import { givePlayerNames } from '@/lib/features/PlayerSlice';
import {
  setCombinedGameSessionId,
  setPlayersSessionId,
  setSessionId,
} from '@/lib/features/TrackerSlice';
import toast from 'react-hot-toast';

interface NotificationItemProps {
  notification: Unread;
  NotificationsArray: Unread[];
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  NotificationsArray,
}) => {
  const dispatch = useAppDispatch();

  const [storeSelectedCombinedId, setStoreSelectedCombinedId] = useState<string | null>(
    null
  );
  const [showConfirmationBtn, setShowConfirmation] = useState(false);
  const [declineState, setDeclineState] = useState<boolean | null>(null);
  const [acceptState, setAcceptState] = useState<string | null>(null);
  const currentUser = useAppSelector((state: RootState) => state.user);

  const router = useRouter();

  const getIconClass = () => {
    switch (notification.type) {
      case NotifType.MESSAGE:
        return 'bg-blue-100 text-blue-500';
      case NotifType.ALERT:
        return 'bg-red-100 text-red-500';
      case NotifType.UPDATE:
        return 'bg-green-100 text-green-500';
      case NotifType.BATTLE:
        return 'bg-red-100 text-red-500';
      default:
        return 'bg-gray-100 text-gray-500 p-1';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotifType.MESSAGE:
        return '💬';
      case NotifType.BATTLE:
        return '⚔️';
      case NotifType.ALERT:
        return '🔔';
      case NotifType.UPDATE:
        return '📦';
      default:
        return '📌';
    }
  };

  const checkOutTheNotification = (combinedId: string, type: string) => {
    dispatch(setCombinedChattingId(combinedId));
    if (type === 'battle') {
      setStoreSelectedCombinedId(combinedId);
      setShowConfirmation(true);
    } else if (type === 'message') {
      dispatch(
        //I'm emptying this setSelectedPlayer so it doesn't show the details of this person at all when the user goes to chat
        setSelectedPlayer({
          id: '',
          name: '',
          avatar: notification.avatar,
          networkState: '',
        })
      );
      router.push('/chats');
    }
  };

  const acceptInviteToBattle = async (senderId: string, combinedId: string) => {
    try {
      setAcceptState('start'); // for the loader
      const combinedRef = doc(db, 'battleInvitations', combinedId);
      const getCombinedDets = await getDoc(combinedRef);
      if (!getCombinedDets.exists()) {
        toast('This invite does not exist anymore');
        return;
      }

      const opponentData = getCombinedDets.data() as battleInvitationType;

      console.log(opponentData, 'opponentData');

      const playerOneDetails = {
        id: currentUser?.userId,
        name: currentUser?.name,
        avatar: currentUser?.avatar,
        networkState: currentUser?.networkState
          ? PlayerStatus.ONLINE
          : PlayerStatus.OFFLINE,
      };

      const playerTwoDetails = {
        id: senderId,
        name: opponentData?.name,
        avatar: opponentData?.avatar,
        networkState: 'online',
      };

      console.log(playerTwoDetails, 'playerTwoDetails');

      const randomControl = Math.random() > 0.5 ? true : false; //So I can randomize the gameplay turns

      const gameSessionId = await createGameSession(
        currentUser?.userId!,
        senderId,
        randomControl
      );

      console.log(gameSessionId, 'gameSessionId');

      await handleGameSession(
        combinedId,
        playerOneDetails,
        playerTwoDetails,
        randomControl
      );

      const updatedNotifs = NotificationsArray.filter(
        (res) => res?.combinedId === combinedId && res?.type === NotifType.BATTLE
      )?.map((item) => {
        return {
          ...item,
          answer: BattleReplyStatus.ACCEPT,
        };
      });
      const currentUserDocRef = doc(db, 'players', currentUser?.userId!);

      await updateDoc(currentUserDocRef, {
        unreadMessages: arrayUnion(...updatedNotifs),
      });
      await updateDoc(combinedRef, {
        answer: BattleReplyStatus.ACCEPT,
      });
      dispatch(setSessionId(gameSessionId)); // Store the current game session ID
      setAcceptState('end');
      setShowConfirmation(false);
      setTimeout(async () => {
        setAcceptState(null); // back to default state
        router.push('/battle'); // Redirect after 2 seconds
      }, 2000);
    } catch (error) {
      console.log(error);
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
        // await saveAvatar(playerOneDetails?.id, opponent?.id, combinedId);

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
        console.log(newGameSession, 'newGameSession');
        return newGameSession; //Return the created gameSession
      }
    } catch (error) {
      console.error('Error creating game session:', error);
    }
  };

  const handleDecline = async (senderId: string, combinedId: string) => {
    setDeclineState(false);
    try {
      //I filter and map over the notifications array to get the specific notification, so I can change the status to decline on my end
      const updatedNotifs = NotificationsArray.filter(
        (res) => res?.combinedId === combinedId && res?.type === NotifType.BATTLE
      )?.map((item) => {
        return {
          ...item,
          answer: BattleReplyStatus.DECLINE,
        };
      });
      //Then i update it on firebase
      const currentUserDocRef = doc(db, 'players', currentUser?.userId!);
      await updateDoc(currentUserDocRef, {
        unreadMessages: arrayUnion(...updatedNotifs),
      });

      const playerDocRef = doc(db, 'players', senderId);
      const playerDocGet = await getDoc(playerDocRef);
      if (!playerDocGet.exists()) {
        console.error('Player does not exist');
        return;
      }
      const battleInviteReply = {
        combinedId: notification.combinedId,
        id: new Date().getTime(),
        message: `${currentUser?.name} has declined your invitation`,
        name: currentUser?.name,
        type: 'declined',
        senderId: notification.senderId,
        timeStamp: Timestamp.now(),
      };
      await updateDoc(playerDocRef, {
        unreadMessages: arrayUnion(battleInviteReply),
      });
      setDeclineState(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setStoreSelectedCombinedId(null);
        setDeclineState(null);
      }, 2000);
    } catch (error) {
      console.log(error);
      setDeclineState(null);
    }
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 transition-colors bg-blue-50/20
      `}
    >
      <div
        onClick={() =>
          checkOutTheNotification(notification?.combinedId, notification.type!)
        }
        className={clsx(
          notification.type === 'battle' && ' cursor-pointer',
          notification?.type === 'message' && 'cursor-pointer',
          `flex gap-3 `
        )}
      >
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${getIconClass()}`}
        >
          <span>{getNotificationIcon()}</span>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <p
              className={`text-sm font-medium text-gray-900
              `}
            >
              {notification.message}
            </p>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {formatTimeToNow(notification.timeStamp)}
          </span>
          {showConfirmationBtn &&
            storeSelectedCombinedId === notification?.combinedId &&
            notification?.type === 'battle' && (
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() =>
                    handleDecline(notification?.senderId!, notification?.combinedId!)
                  }
                  className=" px-3 py-1 bg-red-700 rounded-md"
                >
                  {declineState ? (
                    'Declined'
                  ) : declineState === false ? (
                    <span className="flex items-center gap-2">
                      Decline <Spinner size={'small'} className="text-white" />{' '}
                    </span>
                  ) : (
                    'Decline'
                  )}
                </button>
                <button
                  onClick={() =>
                    acceptInviteToBattle(
                      notification?.senderId!,
                      notification?.combinedId!
                    )
                  }
                  className="px-4 py-1 bg-black text-white rounded-md"
                >
                  {acceptState === 'end' ? (
                    <span>Ready </span>
                  ) : acceptState === 'start' ? (
                    <span>
                      {' '}
                      Gearing up <Spinner size={'small'} className="text-white" />
                    </span>
                  ) : (
                    <span>Let&apos;s Battle </span>
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
