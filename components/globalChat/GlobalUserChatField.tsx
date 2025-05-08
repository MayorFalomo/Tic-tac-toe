import { GlobalChatType, TimeStamp } from '@/app/types/types';
import { convertToDate, formatTime } from '@/app/utils/groupByTime';
import useOnClickOutside from '@/hooks/useOnclickOutside';
import clsx from 'clsx';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';
import { Spinner } from '../ui/Spinner';

type Props = {
  res: GlobalChatType;
  currentUserId: string;
  setStoreChatId?: (arg: string | null) => void;
  storeChatId?: string | null;
  handleInvite: (arg: string) => void;
  setStoredId?: (arg: string | null) => void;
  loadingSpinner?: string | null;
};

const GlobalUserChatField = (props: Props) => {
  const {
    res,
    currentUserId,
    handleInvite,
    storeChatId,
    setStoreChatId,
    loadingSpinner,
  } = props;

  const getHourAndMin = (time: TimeStamp) => {
    const dateObject = convertToDate(time);
    return formatTime(dateObject);
  };

  return (
    <div>
      <div
        className={clsx(
          res?.senderId === currentUserId && 'flex justify-end items-start gap-2 px-3',
          `flex items-start gap-2 px-3`
        )}
      >
        {currentUserId !== res.senderId && (
          <div className="min-w-[30px] min-h-[30px] w-[30px] h-[30px]">
            <Image
              src={res.avatar || '/defaultAvatar.png'}
              alt="User Avatar"
              width={30}
              height={30}
              className="w-full h-full object-cover object-top rounded-full border border-white/50"
            />
          </div>
        )}
        <div className={`relative flex flex-col max-w-xs  `}>
          <div className="flex justify-between items-center w-full">
            {/* {currentUserId === res?.senderId && (
              <span className="b max-[620px]:flex cursor-pointer min-[620px]:hidden">
                <Ellipsis size={16} />{' '}
              </span>
            )} */}
            <span
              className={clsx(
                currentUserId === res.senderId && 'ml-auto text-black',
                `font-medium text-[14px] mb-0.5 text-white/70`
              )}
            >
              {res.name}
            </span>
            {currentUserId !== res?.senderId && (
              <div
                onClick={() => {
                  setStoreChatId!(storeChatId ? null : res.id);
                }}
                className="relative max-[620px]:flex cursor-pointer min-[620px]:hidden"
              >
                <Ellipsis size={16} />{' '}
                {storeChatId === res?.id && (
                  <ul
                    className={clsx(
                      currentUserId !== res?.senderId && ' left-[-100px] w-fit',
                      `text-gradient-nebula rounded-md absolute top-[20px] whitespace-nowrap list-none`
                    )}
                  >
                    <li
                      onClick={() => {
                        if (currentUserId === res.senderId) return;
                        handleInvite(res.senderId);
                      }}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg whitespace-nowrap"
                    >
                      {loadingSpinner === 'start' && res.id === storeChatId
                        ? `waiting for ${
                            res.name.length > 9 ? res.name.slice(0, 9) : res.name
                          }`
                        : loadingSpinner === 'end' && res.id === storeChatId
                        ? `Ready!`
                        : `Invite ${
                            res.name.length > 9 ? res.name.slice(0, 9) : res.name
                          }`}
                      {loadingSpinner === 'start' && res.id === storeChatId && (
                        <Spinner size={'small'} className="text-white" />
                      )}
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="">
            <p
              className={clsx(
                currentUserId === res.senderId &&
                  'bg-blue-600 text-white rounded-l-lg rounded-br-lg',
                currentUserId !== res.senderId && `bg-white rounded-r-lg rounded-bl-lg`,
                'text-black px-2 py-2'
              )}
            >
              <span className="w-[100%]">{res.message}</span>
            </p>
            <span
              className={clsx(
                currentUserId === res?.senderId
                  ? 'flex justify-start '
                  : `flex justify-end`,
                'text-white mt-1 text-sm whitespace-nowrap'
              )}
            >
              {getHourAndMin(res?.timeStamp)}
            </span>
          </div>
        </div>
        {currentUserId === res.senderId && (
          <div className="min-w-[30px] min-h-[30px] w-[30px] h-[30px]">
            <Image
              src={res.avatar || '/defaultAvatar.png'}
              alt="User Avatar"
              width={30}
              height={30}
              className="w-full h-full object-cover object-top rounded-full border border-white/50"
            />
          </div>
        )}
      </div>
      {/* <span className="text-gray-500 text-sm">
        {new Date(res.timestamp).toLocaleString()}
      </span> */}
    </div>
  );
};

export default GlobalUserChatField;
