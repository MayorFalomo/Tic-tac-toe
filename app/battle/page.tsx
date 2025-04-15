import Homepage from '@/components/homepage/home/Homepage';
import React from 'react';
import { Toaster } from 'react-hot-toast';

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Toaster />
      <Homepage />
    </div>
  );
};

export default page;
