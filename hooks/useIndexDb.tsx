import { useEffect, useState } from 'react';
import { IDBPDatabase, openDB } from 'idb';
import { useAppDispatch } from '@/lib/hooks';
import { setAPlayer, updateUser } from '@/lib/features/userSlice';
import { defaultImg, ProfileType } from '@/app/types/types';

const DB_NAME = 'PlayerDatabase';
const STORE_NAME = 'player';

const useIndexedDB = () => {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const dispatch = useAppDispatch();

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const database = await openDB(DB_NAME, 1, {
        upgrade(db) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        },
      });
      if (database) {
        setDb(database);
      }
    };

    initDB();
  }, []);

  // Function to store data
  const storeData = async (key: string, object: any) => {
    if (db) {
      await db.put(STORE_NAME, { id: key, ...object });
      dispatch(setAPlayer(object));
    }
  };

  // Function to get data
  const getData = async () => {
    if (db) {
      const currentUser = 'currentUser';
      const data = await db.get(STORE_NAME, currentUser);

      return data;
    }
    return null;
  };

  const updateData = async (object: Partial<ProfileType>) => {
    if (db) {
      const existingData = await db.get(STORE_NAME, 'currentUser');
      if (!existingData) {
        console.error('No data found for the given key:');
        return;
      }
      const updatedData = { ...existingData, ...object };
      await db.put(STORE_NAME, updatedData);
      dispatch(updateUser(updatedData));
    }
  };

  const deleteData = async () => {
    if (db) {
      const existingData = await db.delete(STORE_NAME, 'currentUser');

      dispatch(
        updateUser({
          name: '',
          userId: '',
          avatar: defaultImg,
          networkState: '',
          wins: 0,
          losses: 0,
        })
      );
    }
  };

  return { storeData, getData, db, updateData, deleteData };
};

export default useIndexedDB;
