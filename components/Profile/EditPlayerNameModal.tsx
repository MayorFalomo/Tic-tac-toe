import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';
import { Input } from '../ui/input';
import { FadeVariants, playGameStyle, scaleVariants } from '@/app/animation/constants';
import useIndexedDB from '@/hooks/useIndexDb';
import { LoadingState } from '@/app/types/types';

type Props = {
  handleClose: () => void;
  playerName: string;
};

const EditPlayerNameModal: React.FC<Props> = ({ handleClose, playerName }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [name, setPlayerName] = useState('');

  const { updateData } = useIndexedDB();

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(name, 'names');
    setLoading(LoadingState.LOADING);

    try {
      updateData({ name: name }); // update on indexDB
      //Logic to handle update on fireebase
      setLoading(LoadingState.SUCCESS);

      setTimeout(() => {
        setLoading('');
      }, 4000);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      className={`absolute ${playGameStyle} w-[300px] min-[580px]:left-[-20px] max-[580px]:left-[-60px] bottom-[-185px] rounded-md z-10 px-3 py-4`}
    >
      <form onSubmit={handleNameUpdate}>
        <p className="flex items-center gap-2">
          <span>Edit your player name</span>
          <span>
            <Edit size={16} />{' '}
          </span>
        </p>
        <Input
          type="text"
          placeholder="E.g Terminator"
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full py-2 px-3 border border-gray-200 text-black my-4 rounded-md"
        />
        <div className="flex items-center gap-4 justify-between">
          <Button type="button" className="bg-red-500 p-0 px-3" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="submit"
            className="bg-transparent border border-white text-white rounded-md px-2 py-1 mb-2"
          >
            Edit name
          </Button>
        </div>
      </form>
      {loading === LoadingState.SUCCESS && (
        <motion.p
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={FadeVariants}
          className="text-green-500 cursor-default text-[10px] text-center"
        >
          Your new name is{' '}
          <span className="font-medium underline underline-offset-1">{playerName}.!</span>{' '}
        </motion.p>
      )}
    </motion.div>
  );
};

export default EditPlayerNameModal;
