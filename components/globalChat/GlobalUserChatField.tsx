import { GlobalChatType } from '@/app/types/types';
import { Ellipsis } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

type Props = {
  res: GlobalChatType;
};

const GlobalUserChatField = (props: Props) => {
  const { res } = props;
  return (
    <div>
      <div className="flex items-center gap-2 px-3">
        <div className="min-w-[40px] min-h-[40px] w-[40px] h-[40px]">
          <Image
            src={res.avatar || '/defaultAvatar.png'}
            alt="User Avatar"
            width={50}
            height={50}
            className="w-full h-full object-cover object-top rounded-full"
          />
        </div>
        <div className="flex flex-col w-full ">
          <p className="flex justify-between items-center w-full">
            <span className="font-bold text-white/70">{res.name}</span>
            <span>
              <Ellipsis size={16} />{' '}
            </span>
          </p>
          <span>{res.message}</span>
        </div>
      </div>
      {/* <span className="text-gray-500 text-sm">
        {new Date(res.timestamp).toLocaleString()}
      </span> */}
    </div>
  );
};

export default GlobalUserChatField;
