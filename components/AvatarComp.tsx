/* eslint-disable @next/next/no-img-element */
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
import { Button } from './ui/button';

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
  const [animationDone, setAnimationDone] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['avatars'],

    queryFn: async () => {
      if (animePictures) {
        return null;
      }
      return fetchAvatars(
        avatarType?.avatarType === 'initials'
          ? ''
          : `${process.env.NEXT_PUBLIC_AVATAR_API}/api/v1/characters`
      );
    },
  });

  const fetchAvatars = async (url: string) => {
    if (animePictures) {
      return animePictures;
    }

    const res = await Axios({
      method: 'GET',
      url: url,
    });
    if (avatarType?.avatarType === 'initials') {
      return null;
    } else {
      return res.data;
    }
  };

  const handleSelection = async (url: string) => {
    //Update it on firebase db
    setAvatar(url);
    setAvatarType(null);
    setAnimePictures(null);
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, //Here's the timing for the staggered effect
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // console.log(isLoading, 'IsLoading');
  // console.log(isError, 'isError');
  console.log('hellooo');

  return (
    <div
      className={`bg-black text-white fixed h-[450px] z-30 min-w-[500px] max-[600px]:min-w-[280px] max-[600px]:w-[90%] max-[400px]:w-[95%] max-w-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
        avatarType?.avatarType === 'initials' ? 'overflow-y-hidden' : 'overflow-y-auto'
      } overflow-x-hidden p-4 max-[600px]:p-2 border border-white/40 rounded-[8px]`}
    >
      <div className="h-full">
        {animationDone && (
          <motion.span
            onClick={() => {
              setAvatarType(null);
              setAnimePictures(null);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-white cursor-pointer absolute top-2 right-[10px] z-50 p-1 rounded-full"
          >
            {<X />}
          </motion.span>
        )}
        {isLoading && (
          <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center gap-[40px] h-full w-full text-white">
            <div className="flex justify-center items-center h-full gap-3">
              <LoadingSpinner className="w-[40px] h-[40px]" />
            </div>
            <Button onClick={() => setAvatarType(null)}>Close </Button>
          </div>
        )}
        {isError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center h-full w-full text-white">
            <div className="flex justify-center items-center h-full gap-3">
              <p className=" text-[red]">
                Sorry something has gone wrong while fetching avatars{' '}
              </p>
            </div>
          </div>
        )}
        <AnimatePresence>
          {data && avatarType?.avatarType !== 'initials' ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit="hidden"
              onAnimationComplete={() => setAnimationDone(true)}
              className="flex justify-center min-w-full w-full gap-3 flex-wrap mt-4 text-white h-full"
            >
              {data?.map((avatar: any, index: number) => (
                <motion.div
                  onClick={() =>
                    handleSelection(
                      avatarType?.avatarType! === 'Avatar'
                        ? avatar?.photoUrl!
                        : avatarType?.avatarUrl!
                    )
                  }
                  className=" cursor-pointer"
                  key={index}
                  variants={childVariants}
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
                </motion.div>
              ))}
            </motion.div>
          ) : avatarType?.avatarType === 'initials' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationEnd={() => setAnimationDone(true)}
              className="flex flex-col items-center justify-center w-full min-h-full "
            >
              <img
                width={100}
                height={100}
                className=" cursor-pointer w-[100px] h-[100px] object-top object-cover rounded-[4px] "
                src={`https://ui-avatars.com/api/?background=random&color=000&name=${
                  avatarType?.avatarName! ?? 'Hero Arlen'
                }`}
                alt="avatar"
                onClick={() =>
                  handleSelection(
                    `https://ui-avatars.com/api/?background=random&color=000&name=${
                      avatarType?.avatarName! ?? 'Hero Arlen'
                    }`
                  )
                }
              />
            </motion.div>
          ) : (
            ''
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center items-start w-full h-full  ">
          <AnimatePresence>
            {animePictures && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                exit="hidden"
                onAnimationComplete={() => setAnimationDone(true)}
                className="flex justify-center min-w-full w-full  gap-3 flex-wrap mt-4 text-white h-full"
              >
                {animePictures?.map((avatar: AvatarTheme, index: number) => (
                  <motion.div
                    onClick={() => handleSelection(avatar?.link)}
                    className="flex flex-col items-start gap-1 cursor-pointer"
                    key={index}
                    variants={childVariants}
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AvatarComp;
