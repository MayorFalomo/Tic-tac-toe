import React from 'react';
import { Check } from 'lucide-react';
import { Unread } from '@/app/types/types';
import NotificationItem from './NotificationItem';
import Link from 'next/link';
import { FaRegBellSlash } from 'react-icons/fa6';
// import NotificationItem from './NotificationItem';
// import { Notification } from '../../types/notification';

interface NotificationsListProps {
  notifications: Unread[];
  onMarkAllAsRead?: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAllAsRead,
}) => {
  const hasUnread = notifications.some((notification) => 5);

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Check className="w-3 h-3" /> Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div>
        {notifications?.length > 0 ? (
          notifications.map((notification, index) => (
            <div className="divide-y divide-gray-100" key={index}>
              <NotificationItem
                notification={notification}
                NotificationsArray={notifications}
              />
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <span>No notifications</span>
              <FaRegBellSlash />
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <Link
          href="/chats"
          className="text-xs text-blue-500 hover:text-blue-600 block text-center"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationsList;
