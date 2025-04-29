'use client';
import React from 'react';
import Homepage from '@/components/homepage/home/Homepage';
import { Toaster } from 'react-hot-toast';

const page: React.FC = () => {
  return (
    <div>
      <Toaster />
      <Homepage />
    </div>
  );
};

export default page;
