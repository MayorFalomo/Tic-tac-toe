'use client';
import { Button } from '@/components/ui/button';
import FadeIn from '../animation/FadeIn';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { userDetails } from '../types/types';
import Image from 'next/image';
import { settingsBtnStyle } from '../animation/constants';

export default function Page() {
  const currentUser = useAppSelector((state: RootState) => state.user as userDetails);

  return (
    <FadeIn>
      <div className="h-screen w-full flex flex-col justify-center items-center ">
        <div
          className={`w-[70%] h-[60%] flex flex-col justify-center items-center mx-auto ${settingsBtnStyle}`}
        >
          <div className="flex items-start gap-6">
            <div>
              <Image
                className="h-[150px] w-[150px] object-cover"
                src={currentUser?.avatar!}
                width={150}
                height={150}
                alt="img"
              />
              <p>{currentUser?.name} </p>
            </div>
            <p>VS </p>
            <div>
              <Image
                className="h-[150px] w-[150px] object-cover"
                src={currentUser?.avatar!}
                width={150}
                height={150}
                alt="img"
              />
              <p>{currentUser?.name} </p>
            </div>
          </div>
          <Button>Begin Game </Button>
        </div>
      </div>
    </FadeIn>
  );
}
