'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { AvatarType } from './signup/SignUp';
import { useQuery } from '@tanstack/react-query';
import Axios from 'axios';
import { X } from 'lucide-react';
import { LoadingSpinner } from './signup/Loader';
import { AvatarTheme } from '@/app/types/types';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  avatarType: AvatarType | null;
  setAvatarType: (avatarType: AvatarType | null) => void;
  setAvatar: (avatar: any) => void;
  animePictures: AvatarTheme[] | [];
  setAnimePictures: (avatar: any) => void;
};

const AvatarComp: React.FC<Props> = ({
  avatarType,
  setAvatarType,
  setAvatar,
  animePictures,
  setAnimePictures,
}) => {
  const [allAvatars, setAllAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAvatars = async (url: string) => {
    if (animePictures) {
      return animePictures;
    }
    const res = await Axios({
      method: 'GET',
      url: url,
    });
    if (avatarType?.avatarType === 'Avatar') {
      return res.data!;
    } else {
      return res.data;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['avatars'],

    queryFn: async () => {
      if (animePictures) {
        return null;
      }
      return fetchAvatars(
        avatarType?.avatarType === 'Random'
          ? 'https://last-airbender-api.fly.dev/api/v1/characters'
          : avatarType?.avatarUrl!
      );
    },
  });

  console.log(data, 'data');

  const handleSelection = async (url: string) => {
    //Update it on firebase db
    setAvatar(url);
    setAvatarType(null);
    setAnimePictures(null);
  };

  return (
    <div className="bg-black text-white fixed h-[450px] min-w-[500px] max-w-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-x-hidden p-4 border border-white/40 rounded-[8px] ">
      <div className="">
        <span
          onClick={() => {
            setAvatarType(null);
            setAnimePictures(null);
          }}
          className="border border-white cursor-pointer absolute top-2 right-[10px] p-1 rounded-full"
        >
          {<X />}
        </span>
        {isLoading && (
          <div className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center h-full w-full text-white">
            <div className="flex justify-center items-center h-full gap-3">
              <LoadingSpinner className="w-[40px] h-[40px]" />
            </div>
          </div>
        )}
        <AnimatePresence>
          {data && (
            <motion.div className="flex justify-center min-w-full w-full  gap-3 flex-wrap mt-4 text-white h-full">
              {data?.map((avatar: any, index: number) => (
                <div
                  onClick={() =>
                    handleSelection(
                      avatarType?.avatarType! === 'Avatar'
                        ? avatar?.photoUrl!
                        : avatarType?.avatarUrl!
                    )
                  }
                  className=" cursor-pointer"
                  key={index}
                >
                  {avatar?.photoUrl && (
                    <Image
                      key={index}
                      src={avatar?.photoUrl}
                      width={100}
                      height={100}
                      alt="avatar"
                      className="w-[100px] h-[100px]  object-cover"
                    />
                  )}
                  <p className="text-center mt-1">
                    {avatarType?.avatarType === 'Avatar' ? avatar?.name.slice(0, 12) : ''}
                  </p>
                </div>
              ))}
              {avatarType?.avatarType === 'Random' && (
                <div
                  onClick={() => handleSelection(avatarType?.avatarUrl!)}
                  className="flex flex-col cursor-pointer justify-center items-center mx-auto w-full h-full"
                >
                  <Image
                    src={avatarType?.avatarUrl ?? null}
                    className="mx-auto"
                    width={200}
                    height={200}
                    alt="avatar"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center items-start w-full h-full  ">
          {animePictures && (
            <div className="flex justify-center min-w-full w-full  gap-3 flex-wrap mt-4 text-white h-full">
              {animePictures?.map((avatar: AvatarTheme, index: number) => (
                <div
                  onClick={() => handleSelection(avatar?.link)}
                  className="flex flex-col items-start gap-1 cursor-pointer"
                  key={index}
                >
                  {avatar.link && (
                    <Image
                      key={index}
                      src={avatar?.link!}
                      width={100}
                      height={100}
                      alt="avatar"
                      className="w-[100px] h-[100px] object-top object-cover rounded-[4px] "
                    />
                  )}
                  <p className="text-center mx-auto w-full text-[14px] mt-1">
                    {avatar?.character}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarComp;
