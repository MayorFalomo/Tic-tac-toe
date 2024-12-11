'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { AvatarType } from './signup/SignUp';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';
import { LoadingSpinner } from './signup/Loader';

type Props = {
  avatarType: AvatarType | null;
  setAvatarType: (avatarType: AvatarType | null) => void;
  setAvatar: (avatar: any) => void;
};

const AvatarComp: React.FC<Props> = ({ avatarType, setAvatarType, setAvatar }) => {
  const [allAvatars, setAllAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAvatars = async (url: string) => {
    const res = await Axios({
      method: 'GET',
      url: url,
    });
    if (avatarType?.avatarType === 'Avatar') {
      return res.data!;
    } else if (avatarType?.avatarType === 'Naruto') {
      return res.data?.characters;
    } else {
      return res.data;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['avatars'],
    queryFn: () =>
      fetchAvatars(
        avatarType?.avatarType === 'Random'
          ? 'https://last-airbender-api.fly.dev/api/v1/characters'
          : avatarType?.avatarUrl!
      ),
  });

  const handleSelection = async (url: string) => {
    //Update it on firebase db
    setAvatar(url);
    setAvatarType(null);
  };

  // console.log(data, 'data');

  return (
    <div className="bg-black fixed h-[450px] w-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-auto p-4 border border-white/40 rounded-[8px] ">
      <div
        className={`relative  grid ${
          avatarType?.avatarType! === 'Random' || isLoading ? '' : 'grid-cols-4'
        } h-[450px] w-[500px] justify-center mx-auto gap-4 text-white`}
      >
        <span
          onClick={() => setAvatarType(null)}
          className="border border-white cursor-pointer absolute top-4 -right-[60px] p-2 rounded-full"
        >
          {<X />}
        </span>
        {isLoading && (
          <div className="flex justify-center items-center h-full w-full text-white">
            <div className="flex justify-center items-center gap-3">
              <LoadingSpinner className="w-[40px] h-[40px]" />
            </div>
          </div>
        )}
        {data &&
          avatarType?.avatarType !== 'Random' &&
          data?.map((avatar: any, index: number) => (
            <div
              onClick={() =>
                handleSelection(
                  avatarType?.avatarType! === 'Avatar'
                    ? avatar?.photoUrl!
                    : avatarType?.avatarType! === 'Naruto'
                    ? avatar?.images[0]!
                    : avatarType?.avatarUrl!
                )
              }
              className=" cursor-pointer"
              key={index}
            >
              <Image
                key={index}
                src={
                  avatarType?.avatarType === 'Avatar'
                    ? avatar?.photoUrl || null
                    : avatarType?.avatarType === 'Naruto'
                    ? avatar?.images[0] || null
                    : avatarType?.avatarUrl || null
                }
                width={100}
                height={100}
                alt="avatar"
              />
              <p className="text-center mt-1">
                {avatarType?.avatarType === 'Naruto'
                  ? avatar?.name
                  : avatarType?.avatarType === 'Avatar'
                  ? avatar?.name
                  : ''}
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
      </div>
    </div>
  );
};

export default AvatarComp;
