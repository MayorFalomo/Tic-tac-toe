import { Unread } from '@/app/types/types';
import { formatTimeToNow } from '@/app/utils/date';
import {
  setCombinedChattingId,
  setSelectedPlayer,
} from '@/lib/features/ChatAPlayerSlice';
import { useAppDispatch } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';
// import { formatDistanceToNow } from '../../utils/date';
// import { Notification } from '../../types/notification';

interface NotificationItemProps {
  notification: Unread;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const getIconClass = () => {
    switch (notification.type) {
      case 'message':
        return 'bg-blue-100 text-blue-500';
      case 'alert':
        return 'bg-red-100 text-red-500';
      case 'update':
        return 'bg-green-100 text-green-500';
      default:
        return 'bg-gray-100 text-gray-500 p-1';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return '💬';
      case 'alert':
        return '🔔';
      case 'update':
        return '📦';
      default:
        return '📌';
    }
  };

  const checkOutTheNotification = (combinedId: string) => {
    console.log(combinedId, 'combinedId');
    dispatch(setCombinedChattingId(combinedId));
    dispatch(
      setSelectedPlayer({
        id: '',
        name: '',
        avatar: notification.avatar,
        networkState: '',
      })
    );
    router.push('/chats');
  };

  // console.log(comnbinedId, 'comnbinedId');

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 transition-colors bg-blue-50/20
      `}
    >
      <div
        onClick={() => checkOutTheNotification(notification?.combinedId)}
        className={`flex gap-3 ${notification?.type === 'message' && 'cursor-pointer'}`}
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
            {/* {!notification.read && (
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
            )} */}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {formatTimeToNow(notification.timeStamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
