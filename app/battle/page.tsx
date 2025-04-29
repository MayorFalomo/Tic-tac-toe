'use client';
import Homepage from '@/components/homepage/home/Homepage';
import React from 'react';
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
