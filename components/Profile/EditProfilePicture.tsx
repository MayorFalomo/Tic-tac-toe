import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { CheckIcon, Edit2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import Image from 'next/image';
import { FadeVariants, scaleVariants } from '@/app/animation/constants';
import useImageUpload from '@/hooks/useImageUpload';
import useIndexedDB from '@/hooks/useIndexDb';
import { AvatarType } from '../signup/SignUp';
import {
  AvatarChoice,
  AvatarTheme,
  AvatarValueType,
  defaultImg,
  LoadingState,
} from '@/app/types/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AnimeAvatars, SuperHeroes } from '../PictureStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Spinner } from '../ui/Spinner';

type Props = {
  handleClose: () => void;
  playerAvatar: string;
  playerName: string;
};

const AvatarStore = React.lazy(() => import('@/components/AvatarComp'));

const EditProfilePicture: React.FC<Props> = ({
  handleClose,
  playerAvatar,
  playerName,
}) => {
  const [newAvatar, setNewAvatar] = React.useState<FileList | null>(null);
  const [avatarType, setAvatarType] = useState<AvatarType | null>(null);
  const [AnimePictures, setAnimePictures] = useState<AvatarTheme[]>([]);
  const [Avatar, setAvatar] = useState<string>('');
  const { imageUrl, successfulUpload } = useImageUpload(newAvatar!);
  const [triggerErrMessage, setTriggerErrMessage] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState('');
  const { updateData } = useIndexedDB();

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoadingState(LoadingState.LOADING);
      if (!Avatar && !imageUrl) {
        setTriggerErrMessage(true);
        return;
      }
      //If the Custom Avatar is used
      if (Avatar) {
        updateData({ avatar: Avatar });
        setLoadingState(LoadingState.SUCCESS);
        toast.success(`Your avatar has been updated`);
      } else {
        updateData({ avatar: imageUrl! });
        setLoadingState(LoadingState.SUCCESS);
        toast.success(`Your avatar has been updated`);
      }
    } catch (error) {
      toast.error('An Error has occurred during update');
    }
  };

  //Function to handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAvatar(e.target.files);
    setAvatar(Avatar);
    setTriggerErrMessage(false);
  };

  const AvatarStyle: AvatarChoice[] = [
    {
      id: 1,
      avatarStyle: 'Anime style',
      avatarValue: 'Anime',
    },
    {
      id: 2,
      avatarStyle: 'Superheroes and Villains',
      avatarValue: 'Superheroes',
    },
    {
      id: 3,
      avatarStyle: 'Avatar last-bender',
      avatarValue: 'Avatar',
    },
    {
      id: 4,
      avatarStyle: 'Initials style',
      avatarValue: 'initials',
    },
  ];

  const handleAvatarSelection = (value: string) => {
    console.log(value, 'value');

    switch (value) {
      case AvatarValueType.Anime:
        setAnimePictures(AnimeAvatars);
        return;
      case AvatarValueType.SuperHeroes:
        setAnimePictures(SuperHeroes);
        return;
      case AvatarValueType.Avatar:
        setAvatarType({
          avatarType: 'Avatar',
          avatarUrl: 'https://last-airbender-api.fly.dev/api/v1/characters',
        });
        return;
      case AvatarValueType.Initials:
        setAvatarType({
          avatarType: 'initials',
          avatarName: playerName ?? 'Hero Arlen',
          avatarUrl: ``,
        });
        return;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      className="absolute bg-white w-[300px] max-[320px]:w-[260px] min-[580px]:left-[-20px] max-[580px]:left-[-60px] max-[320px]:left-[-30px] bottom-[-280px] rounded-md z-10 px-3 py-4"
    >
      <form onSubmit={handleEdit}>
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="flex items-center gap-2">
            <p>
              <span>Change your Avatar</span>
            </p>
            <label htmlFor="upload" className="cursor-pointer">
              <span>
                <Edit2Icon size={16} />{' '}
              </span>
            </label>
          </div>
          <Select onValueChange={(value) => handleAvatarSelection(value)}>
            <SelectTrigger className="w-[100%] bg-transparent rounded-none border-black text-black/60 border-b border outline-none border-t-0 border-x-0 text-[16px] focus:ring-offset-0 focus:ring-0">
              <SelectValue
                className=" placeholder:text-black"
                placeholder="Choose your Avatar"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select your Avatar </SelectLabel>
                {AvatarStyle.map((item) => (
                  <SelectItem key={item.id} value={item.avatarValue}>
                    {item.avatarStyle}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Input id="upload" type="file" onChange={handleUpload} className="hidden" />

        <div
          style={{
            backgroundColor: '#d1d5db',
            backgroundImage: `url(${
              imageUrl
                ? imageUrl
                : Avatar
                ? Avatar
                : playerAvatar
                ? playerAvatar
                : defaultImg
            })`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          className="w-full flex justify-start items-end py-3 bg-gray-300 relative flex-shrink-0 my-3 border-[1px] border-black/50 border-dashed"
        >
          {
            <Image
              src={
                imageUrl
                  ? imageUrl
                  : Avatar
                  ? Avatar
                  : playerAvatar
                  ? playerAvatar
                  : defaultImg
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultImg;
              }}
              width={70}
              height={70}
              alt="avatar"
              className="object-cover object-top border-white border w-[70px] h-[70px] rounded-full"
            />
          }
          <label
            htmlFor="upload"
            className="bg-black border-white border w-[30px] h-[30px] flex justify-center items-center place-content-center text-white bottom-0 right-0 rounded-full cursor-pointer"
          >
            <Edit2Icon size={16} />
          </label>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <Button
            type="button"
            className="bg-red-500 p-0 px-3"
            onClick={() => {
              handleClose();
              setAvatar(Avatar); //Remain with your current state
              setTriggerErrMessage(false);
            }}
            disabled={loadingState === LoadingState.LOADING}
          >
            close
          </Button>
          <Button
            type="submit"
            className="flex items-center gap-1 bg-black text-white rounded-md px-2 py-1 mb-2"
            disabled={loadingState === LoadingState.LOADING}
          >
            <span className="flex items-center gap-2">
              {successfulUpload
                ? 'uploaded'
                : successfulUpload
                ? 'updated your avatar'
                : 'update avatar'}
              {loadingState === LoadingState.LOADING && (
                <Spinner size={'small'} className=" text-white" />
              )}
            </span>
            <span>
              {loadingState === LoadingState.SUCCESS ? (
                <CheckIcon style={{ color: 'green' }} size={16} />
              ) : loadingState === LoadingState.LOADING ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn('animate-spin', '')}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                ''
              )}{' '}
            </span>
          </Button>
        </div>
      </form>
      {triggerErrMessage && (
        <motion.p
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={FadeVariants}
          className="text-red-500 text-[10px] text-center"
        >
          Choose or upload a picture.!{' '}
        </motion.p>
      )}
      {AnimePictures?.length > 0 || avatarType?.avatarName ? (
        <AvatarStore
          avatarType={avatarType}
          setAvatarType={setAvatarType}
          setAvatar={setAvatar}
          animePictures={AnimePictures}
          setAnimePictures={setAnimePictures}
        />
      ) : (
        ''
      )}
    </motion.div>
  );
};

export default EditProfilePicture;
