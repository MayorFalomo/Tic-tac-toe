import UserChats from '@/components/userChats/UserChats';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const page: React.FC = () => {
  return (
    <div>
      <Toaster />
      <UserChats />
    </div>
  );
};

export default page;
