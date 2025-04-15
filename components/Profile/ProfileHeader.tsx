import React, { useEffect, useState } from 'react';
import { ChevronDown, Edit, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useIndexedDB from '@/hooks/useIndexDb';
import { defaultImg, ProfileType } from '@/app/types/types';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setAPlayer } from '@/lib/features/userSlice';
import { RootState } from '@/lib/store';
import toast from 'react-hot-toast';

type Props = {};

const EditName = React.lazy(() => import('./EditPlayerNameModal'));
const EditProfilePicture = React.lazy(() => import('./EditProfilePicture'));

const ProfileHeader = () => {
  const { getData, db, deleteData } = useIndexedDB();

  const dispatch = useAppDispatch();
  const playerData = useAppSelector((state: RootState) => state.user);

  const [editPlayer, setEditPlayer] = useState(false);
  const [changeAvatar, setChangeAvatar] = useState(false);
  const [logout, setLogout] = useState(false);

  // Function to fetch player data from IndexedDB
  const fetchPlayerData = async () => {
    const data = await getData();
    if (data) {
      dispatch(setAPlayer(data));
    }
  };

  // Use effect to fetch player data when db is initialized
  useEffect(() => {
    if (db) {
      fetchPlayerData();
    }
  }, [db]);

  const handleLogOut = async () => {
    try {
      await deleteData();
      toast.success('You have logged out');
      setLogout(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      className="w-[280px] group relative border border-white/40 px-4 py-1 flex items-center justify-between rounded-[10px] gap-2 cursor-pointer"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <p className="flex items-center gap-1">
        <span className=" text-white">Welcome!</span>
        <span className=" whitespace-nowrap capitalize">
          {playerData.name === ''
            ? 'Player'
            : playerData?.name.length > 15
            ? playerData?.name?.slice(0, 15)
            : playerData?.name.length <= 15
            ? playerData?.name
            : ''}
        </span>
      </p>

      {/* Arrow Icon */}
      <motion.span
        className="text-white"
        variants={{
          rest: { display: 'none', opacity: 0, y: 5 },
          hover: { display: 'flex', opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown />
      </motion.span>

      <motion.img
        src={playerData?.avatar !== '' ? playerData?.avatar : defaultImg}
        alt="img"
        width={40}
        height={40}
        className="w-[40px] h-[40px] object-cover object-top rounded-full border border-white"
        variants={{
          rest: { x: 0, rotate: 0 },
          hover: { x: 10 },
        }}
        transition={{ duration: 1, type: 'spring' }}
      />

      {/* Dropdown menu */}
      <motion.div
        className={clsx(
          logout && 'bottom-[-200px]',
          `absolute bottom-[-150px] left-0 mt-2 w-full overflow-hidden bg-white text-black rounded-[10px] shadow-lg z-10`
        )}
        variants={{
          rest: { height: 0, opacity: 0, pointerEvents: 'none' },
          hover: { height: 'auto', opacity: 1, pointerEvents: 'auto' },
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      >
        <ul className="py-2 list-none">
          <li
            className={clsx(
              playerData === null && 'opacity-50',
              'py-2 hover:bg-gray-100 px-2 hover:underline'
            )}
          >
            <button
              onClick={() => {
                setEditPlayer(true);
                setLogout(false);
              }}
              className={clsx(
                playerData.name === '' && 'cursor-not-allowed opacity-30',
                `flex items-center justify-between w-full`
              )}
              disabled={playerData.name === ''}
            >
              <span className="ml-2">Edit player name</span>
              <span>
                {' '}
                <Edit size={14} />
              </span>
            </button>
          </li>
          <li
            className={clsx(
              playerData === null && 'opacity-50',
              'py-2 hover:bg-gray-100 px-2 hover:underline'
            )}
          >
            <button
              disabled={playerData.name === ''}
              className={clsx(
                playerData.name === '' && 'cursor-not-allowed opacity-30',
                `flex items-center justify-between w-full`
              )}
              onClick={() => {
                setChangeAvatar(true);
                setLogout(false);
              }}
            >
              <span className="ml-2">Change your Avatar</span>
              <span>
                {' '}
                <Edit size={14} />
              </span>
            </button>
          </li>
          <li
            onClick={() => setLogout(!logout)}
            className={clsx(
              playerData === null && 'opacity-50',
              'py-2 hover:bg-gray-100 px-2 hover:underline'
            )}
          >
            <button
              disabled={playerData.name === ''}
              className={clsx(
                playerData.name === '' && 'cursor-not-allowed opacity-30',
                `flex items-center justify-between w-full`
              )}
              onClick={() => {
                setLogout(true);
              }}
            >
              <span className="ml-2">Logout</span>
              <span>
                {' '}
                <LogOut size={14} />
              </span>
            </button>
          </li>
        </ul>
        <AnimatePresence>
          {logout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-2 px-2 mb-3 mt-2"
            >
              <button
                onClick={() => setLogout(false)}
                className="bg-black text-white px-2 py-[7px] text-sm rounded-md"
              >
                No thanks
              </button>
              <button
                onClick={handleLogOut}
                className="bg-red-600 text-white px-2 py-[7px] text-sm rounded-md"
              >
                Yes, Logout.
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {editPlayer && (
          <EditName
            key={'name'}
            handleClose={() => setEditPlayer(false)}
            playerName={playerData?.name!}
          />
        )}
        {changeAvatar && (
          <EditProfilePicture
            key={'avatar'}
            handleClose={() => setChangeAvatar(false)}
            playerAvatar={playerData?.avatar!}
            playerName={playerData?.name!}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileHeader;
