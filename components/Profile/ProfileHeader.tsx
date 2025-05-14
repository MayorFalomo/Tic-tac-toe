import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Edit, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useIndexedDB from '@/hooks/useIndexDb';
import { defaultImg, Unread } from '@/app/types/types';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setAPlayer } from '@/lib/features/userSlice';
import { RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import { db as database } from '@/firebase-config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import NotificationsList from './NotificationList';
import { FadeVariants, playGameStyle } from '@/app/animation/constants';
import useOnClickOutside from '@/hooks/useOnclickOutside';
import { RxAvatar } from 'react-icons/rx';
import { HiOutlineBellAlert } from 'react-icons/hi2';
import { usePlayer } from '@/contexts/UserContext';

const EditName = React.lazy(() => import('./EditPlayerNameModal'));
const EditProfilePicture = React.lazy(() => import('./EditProfilePicture'));

const ProfileHeader = () => {
  const { deleteData } = useIndexedDB();

  const dispatch = useAppDispatch();
  const playerData = useAppSelector((state: RootState) => state.user);
  const trackIconColor = useAppSelector((state: RootState) => state.track.iconColor);
  const track = useAppSelector((state: RootState) => state.track.notifBg);

  const { currentUser } = usePlayer();

  const [editPlayer, setEditPlayer] = useState<boolean>(false);
  const [changeAvatar, setChangeAvatar] = useState<boolean>(false);
  const [logout, setLogout] = useState<boolean>(false);
  const [openNotifModal, setOpenNotifModal] = useState<boolean>(false);
  const [userNotifs, setUserNotifs] = useState<Unread[]>([]);
  const [showArrow, setShowArrow] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null);

  // Function to fetch player data from IndexedDB
  const fetchPlayerData = async (userId: string) => {
    if (userId) {
      getNotifications(userId);
    }
  };

  //useEffect to track notifications
  useEffect(() => {
    if (playerData?.userId) {
      const playersRef = collection(database, 'players');
      const playersQuery = query(playersRef, where('id', '==', playerData?.userId));
      const unsubscribeNotifs = onSnapshot(playersQuery, (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            const playerData = (doc.data().unreadMessages as Unread[]) || [];
            console.log(playerData, 'playerData');
            setUserNotifs(playerData.reverse());
          }
        });
      });
      return () => {
        unsubscribeNotifs();
      };
    }
  }, [playerData?.userId]);

  const getNotifications = async (userId: string) => {
    const currentUserRef = collection(database, 'players');
    // Query for notifications where the playerId matches the current player's ID
    const retrievedData = query(currentUserRef, where('id', '==', userId));
    const userDocs = await getDocs(retrievedData);
    if (!userDocs.empty) {
      const userData = userDocs.docs[0].data();
      const notifications = userData?.unreadMessages || [];
      setUserNotifs(notifications.reverse());
    }
  };

  // UseEffect to fetch player data when db is initialized
  useEffect(() => {
    if (currentUser?.userId) {
      fetchPlayerData(currentUser?.userId);
    }
  }, [currentUser?.userId]);

  const handleLogOut = async () => {
    try {
      await deleteData();
      toast.success('You have logged out');
      setLogout(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAllNotifAsRead = async () => {
    try {
      const playerDocRef = doc(database, 'players', playerData?.userId);
      const playerDoc = await getDoc(playerDocRef);

      if (playerDoc.exists()) {
        await updateDoc(playerDocRef, {
          unreadMessages: [],
        });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useOnClickOutside({
    ref: ref,
    handler: () => {
      setOpenNotifModal(false);
      setLogout(false);
      setEditPlayer(false);
      setChangeAvatar(false);
    },
  });

  console.log(currentUser, 'trackicon');

  return (
    <div ref={ref} className={`flex items-center gap-6 text-white`}>
      <div className="relative">
        <div className="relative" ref={notificationRef}>
          {/* Bell Icon with Badge */}
          <button
            className="relative p-2 rounded-full text-white hover:bg-gray-100 hover:text-black transition-all duration-300 ease-in-out"
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <HiOutlineBellAlert
              style={{
                background: 'rgba(255, 255, 255, 0.39)',
                borderRadius: '50px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '5px',
              }}
              className={`${trackIconColor}`}
              size={35}
            />

            <span
              style={{ backgroundColor: track || 'red' }}
              className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center`}
            >
              {userNotifs.length > 9 ? '9+' : userNotifs.length}
            </span>

            {/* <span className="bg-red-500 absolute top-[-10px] left-[20%] w-[15px] h-[15px] px-2 py-2 text-[12px] place-items-center flex justify-center items-center rounded-full"></span> */}
          </button>

          {/* Notification Panel with Tooltip Design */}
          {isOpen && (
            <div className="absolute min-[680px]:right-0 max-[680px]:left-0 mt-2 w-80 max-[580px]:w-[280px] max-[320px]:w-[220px] z-50 transform-gpu transition-all duration-200 ease-in-out origin-top-right">
              {/* Triangle Pointer */}
              <div className="absolute -top-2 min-[680px]:right-4 max-[680px]:left-4 w-4 h-4 transform rotate-45 bg-white border-t border-l border-gray-200"></div>

              {/* Notification Content */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <NotificationsList
                  notifications={userNotifs}
                  onMarkAllAsRead={markAllNotifAsRead}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <motion.div
        className="w-[280px] max-[580px]:w-[240px] group relative border border-[#1D1D38] px-4 py-1 flex items-center justify-between rounded-[10px] gap-2 cursor-pointer"
        whileHover="hover"
        initial="rest"
        animate="rest"
        onClick={() => setOpenNotifModal(!openNotifModal)}
        onMouseOver={() => setShowArrow(true)}
        onMouseLeave={() => setShowArrow(false)}
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
        <AnimatePresence>
          {showArrow && (
            <motion.span
              className="text-white"
              variants={{
                initial: { opacity: 0, pointerEvents: 'none' },
                active: { opacity: 1, pointerEvents: 'auto' },
                // rest: { display: 'none', opacity: 0, y: 5 },
                // hover: { display: 'flex', opacity: 1, y: 0 },
              }}
              animate={showArrow ? 'active' : 'initial'}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown />
            </motion.span>
          )}
        </AnimatePresence>

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
        <AnimatePresence>
          {openNotifModal && (
            <motion.div
              className={clsx(
                logout && 'bottom-[-250px]',
                `absolute bottom-[-160px] min-[580px]:left-[-20px] max-[580px]:left-[-60px] mt-2 w-[300px] overflow-hidden ${playGameStyle} text-black rounded-[10px] shadow-lg z-10`
              )}
              variants={{
                initial: { height: 0, opacity: 0, pointerEvents: 'none' },
                hover: { height: 'auto', opacity: 1, pointerEvents: 'auto' },
                active: { height: 'auto', opacity: 1, pointerEvents: 'auto' },
              }}
              animate={openNotifModal ? 'active' : 'initial'}
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
                    'py-2 px-2 hover:underline'
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
                    'py-2 px-2 hover:underline'
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
                      <RxAvatar size={16} />
                    </span>
                  </button>
                </li>
                <li
                  onClick={() => setLogout(!logout)}
                  className={clsx(
                    playerData === null && 'opacity-50',
                    'py-2 px-2 hover:underline'
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
                      setOpenNotifModal(true);
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
                    variants={FadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col justify-between gap-2 px-2 mb-3 mt-2"
                  >
                    <p className="px-2 text-[14px]">Your account would be deleted!. </p>
                    <div className="flex items-center justify-between gap-2 px-2">
                      <button
                        onClick={() => setLogout(false)}
                        className="bg-black text-white px-2 py-[7px] text-sm rounded-md"
                      >
                        No thanks
                      </button>
                      <button
                        onClick={handleLogOut}
                        disabled={!currentUser?.userId}
                        className="bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 py-[7px] text-sm rounded-md"
                      >
                        Yes, Logout.
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
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
    </div>
  );
};

export default ProfileHeader;
